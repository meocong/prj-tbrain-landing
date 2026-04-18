/**
 * Terminal Bench ingest script.
 *
 * Usage:
 *   yarn ingest:tb --zip "/path/to/outer.zip" --batch april-2026 --batch-name "April 2026 Batch"
 *
 * Responsibilities:
 *  - unzip the outer archive
 *  - upload the outer zip to GCS `batches/{slug}.zip`
 *  - for each inner `tbrain-*.zip`:
 *      - parse task.toml (normalising memory/storage variants)
 *      - read instruction.md into Postgres
 *      - AST-parse tests/test_outputs.py via python3 → tests_json
 *      - upload inner zip to GCS `samples/{batchSlug}/{sampleSlug}.zip`
 *      - walk files, upload each to GCS `files/{sampleId}/{path}`, insert `files` row
 *      - upsert `samples` row
 *  - upsert `batches` row
 *
 * Idempotent: rerunning overwrites GCS objects and upserts rows.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import path from "node:path";
import { promises as fs } from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import toml from "@iarna/toml";
import { supabaseAdmin } from "../src/lib/terminal-bench/supabase/admin";
import {
  batchZipObject,
  fileObject,
  sampleZipObject,
  uploadBuffer,
} from "../src/lib/terminal-bench/gcs";
import { parseTestsPython } from "../src/lib/terminal-bench/parse-tests";
import type { SampleSpec } from "../src/lib/terminal-bench/types";

interface Args {
  zip: string;
  batch: string;
  batchName: string;
}

function parseArgs(): Args {
  const out: Partial<Args> = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--zip") out.zip = argv[++i];
    else if (a === "--batch") out.batch = argv[++i];
    else if (a === "--batch-name") out.batchName = argv[++i];
  }
  if (!out.zip || !out.batch || !out.batchName) {
    console.error("Usage: --zip <path> --batch <slug> --batch-name <name>");
    process.exit(1);
  }
  return out as Args;
}

function mimeFor(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".py")) return "text/x-python";
  if (lower.endsWith(".ts") || lower.endsWith(".tsx")) return "application/typescript";
  if (lower.endsWith(".js") || lower.endsWith(".jsx")) return "application/javascript";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "application/x-yaml";
  if (lower.endsWith(".toml")) return "application/toml";
  if (lower.endsWith(".md")) return "text/markdown";
  if (lower.endsWith(".sh") || lower.endsWith(".bash")) return "application/x-sh";
  if (lower.endsWith(".sql")) return "application/sql";
  if (lower.endsWith("dockerfile")) return "text/x-dockerfile";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

const SKIP_BINARY_OVER = 500 * 1024; // skip images/binaries >500KB
const SKIP_DIR_PARTS = new Set([".git", "node_modules", "__pycache__", ".venv"]);

function parseMemory(raw: unknown): number | undefined {
  if (typeof raw === "number") return raw;
  if (typeof raw !== "string") return undefined;
  const m = raw.trim().match(/^(\d+(?:\.\d+)?)\s*([KMG])?$/i);
  if (!m) return undefined;
  const n = parseFloat(m[1]);
  const unit = (m[2] ?? "").toUpperCase();
  switch (unit) {
    case "G": return Math.round(n * 1024);
    case "M": return Math.round(n);
    case "K": return Math.round(n / 1024);
    default:  return Math.round(n);
  }
}

function extractZip(zipPath: string, destDir: string): void {
  // Prefer `unzip` if available; fall back to Python zipfile (which ships with Python 3 and is
  // available on most runners).
  const hasUnzip = spawnSync("which", ["unzip"]).status === 0;
  if (hasUnzip) {
    const res = spawnSync("unzip", ["-o", "-q", zipPath, "-d", destDir], { stdio: "inherit" });
    if (res.status !== 0) throw new Error(`unzip failed for ${zipPath}`);
    return;
  }
  const res = spawnSync(
    "python3",
    ["-c", `import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])`, zipPath, destDir],
    { stdio: "inherit" }
  );
  if (res.status !== 0) throw new Error(`python zipfile failed for ${zipPath}`);
}

async function walkFiles(root: string, rel = ""): Promise<string[]> {
  const out: string[] = [];
  const abs = path.join(root, rel);
  const entries = await fs.readdir(abs, { withFileTypes: true });
  for (const e of entries) {
    if (SKIP_DIR_PARTS.has(e.name)) continue;
    const sub = path.join(rel, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkFiles(root, sub)));
    } else if (e.isFile()) {
      out.push(sub);
    }
  }
  return out;
}

async function main() {
  const args = parseArgs();
  const db = supabaseAdmin();

  console.log(`[ingest] zip=${args.zip} batch=${args.batch}`);

  const work = await fs.mkdtemp(path.join(os.tmpdir(), "ingest-"));
  console.log(`[ingest] scratch=${work}`);

  // 1. Unzip outer archive.
  extractZip(args.zip, work);

  // 2. Upload outer ZIP to GCS.
  const outerZip = await fs.readFile(args.zip);
  await uploadBuffer(batchZipObject(args.batch), outerZip, "application/zip");
  console.log(`[ingest] uploaded outer zip → ${batchZipObject(args.batch)}`);

  // 3. Upsert batch row.
  const { data: batchRow, error: batchErr } = await db
    .from("batches")
    .upsert(
      {
        project: "terminal-bench",
        slug: args.batch,
        name: args.batchName,
        gcs_batch_zip_object: batchZipObject(args.batch),
      },
      { onConflict: "project,slug" }
    )
    .select("id, slug")
    .single();
  if (batchErr || !batchRow) throw batchErr ?? new Error("batch upsert failed");

  // 4. Find inner zips recursively.
  const innerZips: string[] = [];
  async function findZips(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) await findZips(p);
      else if (e.isFile() && e.name.endsWith(".zip")) innerZips.push(p);
    }
  }
  await findZips(work);

  console.log(`[ingest] found ${innerZips.length} inner zip(s)`);

  for (const zip of innerZips) {
    const sampleRoot = await fs.mkdtemp(path.join(os.tmpdir(), "sample-"));
    extractZip(zip, sampleRoot);

    // The inner zip typically extracts to a single folder tbrain-<name>/. Pick it.
    const topEntries = await fs.readdir(sampleRoot, { withFileTypes: true });
    let sampleDir = sampleRoot;
    if (topEntries.length === 1 && topEntries[0].isDirectory()) {
      sampleDir = path.join(sampleRoot, topEntries[0].name);
    }

    const folderName = path.basename(sampleDir);
    const sampleSlug = folderName.replace(/^tbrain-/, "");

    // Read task.toml.
    const taskTomlPath = path.join(sampleDir, "task.toml");
    let taskToml: any;
    try {
      taskToml = toml.parse(await fs.readFile(taskTomlPath, "utf8"));
    } catch (err) {
      console.warn(`[ingest] skipping ${folderName} (no task.toml):`, err);
      continue;
    }
    const meta = taskToml.metadata ?? {};
    const env = taskToml.environment ?? {};
    const verifier = taskToml.verifier ?? {};
    const agent = taskToml.agent ?? {};

    const spec: SampleSpec = {
      verifier_timeout_sec: Number(verifier.timeout_sec) || undefined,
      agent_timeout_sec: Number(agent.timeout_sec) || undefined,
      build_timeout_sec: Number(env.build_timeout_sec) || undefined,
      cpus: Number(env.cpus) || undefined,
      memory_mb: env.memory_mb ?? parseMemory(env.memory),
      storage_mb: env.storage_mb ?? parseMemory(env.storage),
    };

    let instructionMd: string | null = null;
    try {
      instructionMd = await fs.readFile(path.join(sampleDir, "instruction.md"), "utf8");
    } catch {
      instructionMd = null;
    }

    let testsJson: unknown = null;
    try {
      const testsPy = await fs.readFile(path.join(sampleDir, "tests", "test_outputs.py"), "utf8");
      testsJson = parseTestsPython(testsPy);
    } catch {
      testsJson = [];
    }

    // Upload inner zip.
    const innerZipBuf = await fs.readFile(zip);
    const sampleZip = sampleZipObject(batchRow.slug, sampleSlug);
    await uploadBuffer(sampleZip, innerZipBuf, "application/zip");

    // Upsert sample.
    const title: string = String(meta.title ?? folderName.replace(/^tbrain-/, "").replace(/-/g, " "));

    const { data: sampleRow, error: sampleErr } = await db
      .from("samples")
      .upsert(
        {
          batch_id: batchRow.id,
          slug: sampleSlug,
          title,
          difficulty: meta.difficulty ?? null,
          category: meta.category ?? null,
          tags: meta.tags ?? null,
          author_name: meta.author_name ?? null,
          author_email: meta.author_email ?? null,
          expert_time_min: meta.expert_time_estimate_min
            ? Math.round(Number(meta.expert_time_estimate_min))
            : null,
          junior_time_min: meta.junior_time_estimate_min
            ? Math.round(Number(meta.junior_time_estimate_min))
            : null,
          spec_json: spec,
          instruction_md: instructionMd,
          tests_json: testsJson,
          gcs_sample_zip_object: sampleZip,
        },
        { onConflict: "batch_id,slug" }
      )
      .select("id")
      .single();

    if (sampleErr || !sampleRow) {
      console.error(`[ingest] sample upsert failed for ${sampleSlug}:`, sampleErr);
      continue;
    }

    // Walk and upload files in parallel batches (MSAL has ~1900 files).
    const relPaths = await walkFiles(sampleDir);
    console.log(`[ingest] ${sampleSlug}: ${relPaths.length} files`);

    const CONCURRENCY = 24;
    let done = 0;
    const sampleId = sampleRow.id;
    const uploadOne = async (rel: string) => {
      const abs = path.join(sampleDir, rel);
      const stat = await fs.stat(abs);
      const mime = mimeFor(rel);
      const isBinary = mime.startsWith("image/") || mime === "application/zip";
      if (isBinary && stat.size > SKIP_BINARY_OVER) return;

      const data = await fs.readFile(abs);
      const object = fileObject(sampleId, rel.replace(/\\/g, "/"));
      await uploadBuffer(object, data, mime);
      await db
        .from("files")
        .upsert(
          {
            sample_id: sampleId,
            path: rel.replace(/\\/g, "/"),
            mime,
            size_bytes: stat.size,
            gcs_object: object,
          },
          { onConflict: "sample_id,path" }
        );
    };

    for (let i = 0; i < relPaths.length; i += CONCURRENCY) {
      const slice = relPaths.slice(i, i + CONCURRENCY);
      await Promise.all(slice.map(uploadOne));
      done += slice.length;
      if (relPaths.length > 200 && done % 200 < CONCURRENCY) {
        console.log(`[ingest] ${sampleSlug}: ${done}/${relPaths.length}`);
      }
    }

    console.log(`[ingest] ${sampleSlug}: done`);
  }

  console.log("[ingest] done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
