#!/usr/bin/env node
/**
 * Stage the hand-pose sample packs, and register them for the download route.
 *
 *   node scripts/samples/handpose/stage-handpose-packs.mjs                 dry run: the plan, and the JSON it would write
 *   node --env-file=.env.local scripts/samples/handpose/stage-handpose-packs.mjs --upload [--force] [--only hand-pose-13]
 *
 * Options: --only <slug> stage one sample (the manifest is merged, so the rest
 * stay); --force replace objects that already exist; --packs <dir> read the
 * packs from somewhere other than `<cache>/packs`; --allow-extra accept files in
 * a zip that PACK_FILES does not list. The cache is `~/.cache/tbrain-samples/handpose-v2`,
 * or HANDPOSE_CACHE, the same variable the python scripts read.
 *
 * Reads `<cache>/packs/manifest.json` and the zips that `pack-handpose-assets.py`
 * wrote next to it, for every sample with `pack: true` in
 * `src/lib/samples/handpose-metrics.json`. Plans two GCS objects per sample,
 * under `samples/hand-pose/`:
 *
 *   packs/hand-pose-NN-pack.zip             the passcode sample pack  (asset: preview)
 *   metadata/hand-pose-NN.metadata.json     the sample's sanitised metadata (asset: metadata)
 *
 * and a `full` asset whose object stays null: the full delivery goes out by a
 * signed link after the licence is agreed, never from the bucket on request.
 *
 * Dry run by default. With `--upload` it puts the objects in the bucket and
 * then, only if every upload succeeded, writes
 * `src/lib/samples/handpose-downloads.json`. The manifest therefore never names
 * an object the bucket does not hold (the invariant `stage-packs.mjs` keeps for
 * the library, and the reason `downloads.ts` can sign any entry it finds).
 *
 * Separate from `stage-packs.mjs` on purpose. That script rebuilds its manifest
 * wholesale from `samples.json` on every run and would drop these entries;
 * this one merges: entries for the samples it stages are replaced, every other
 * entry is kept, keys are sorted, and the file is byte-for-byte the same when
 * nothing changed.
 *
 * It refuses, before it uploads anything, if a pack is not what the page says
 * it is: the zip must hold exactly the files in `PACK_FILES` (handpose.ts), its
 * checksums must agree with the manifest and with its own SHA256SUMS, every
 * member must pass the privacy scan (`check-handpose-privacy.mjs`), and the
 * metadata must not carry the pipeline gate's longest-gap figure. It also
 * refuses to overwrite an object that already exists, unless `--force`.
 *
 * Credentials and bucket come from the same environment as `stage-packs.mjs`:
 * GCS_PROJECT_ID, GCS_CLIENT_EMAIL, GCS_PRIVATE_KEY, GCS_BUCKET_NAME.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { scanFile } from "../check-handpose-privacy.mjs";

const ROOT = resolve(import.meta.dirname, "../../..");
const METRICS = join(ROOT, "src/lib/samples/handpose-metrics.json");
const DOWNLOADS = join(ROOT, "src/lib/samples/handpose-downloads.json");
const HANDPOSE_TS = join(ROOT, "src/lib/samples/handpose.ts");

const args = process.argv.slice(2);
const opt = (k) => (args.includes(`--${k}`) ? args[args.indexOf(`--${k}`) + 1] : null);
const UPLOAD = args.includes("--upload");
const FORCE = args.includes("--force");
const ONLY = opt("only");

const expand = (p) => (p.startsWith("~") ? join(homedir(), p.slice(1)) : p);
const CACHE = expand(process.env.HANDPOSE_CACHE ?? "~/.cache/tbrain-samples/handpose-v2");
const PACKS = resolve(expand(opt("packs") ?? join(CACHE, "packs")));

/** Where the objects go. Fixed: `check-handpose-data.mjs` asserts the manifest names exactly these. */
const PREFIX = "samples/hand-pose";
const FULL_NOTE = "Full delivery by signed link after the licence is agreed";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const shown = (p) => p.replace(homedir(), "~");
const mib = (n) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MiB` : `${(n / 1024).toFixed(1)} KiB`);

/** @type {string[]} */
const errors = [];
const warnings = [];

/* ── What a pack must hold: `PACK_FILES` in handpose.ts, which the page prints ── */

/** `NN` stands for the sample number. Keep in step with PACK_FILES. */
const EXPECTED_MEMBERS = ["joints.npz", "hand-pose-NN.rrd", "metadata.json", "README.txt", "SHA256SUMS"];

function packFilesFromSource() {
  const src = readFileSync(HANDPOSE_TS, "utf8");
  const block = /export const PACK_FILES[\s\S]*?\n\];/.exec(src)?.[0] ?? "";
  return [...block.matchAll(/name:\s*"([^"]+)"/g)].map((m) => m[1]);
}

{
  const fromSource = packFilesFromSource();
  if (JSON.stringify([...fromSource].sort()) !== JSON.stringify([...EXPECTED_MEMBERS].sort())) {
    errors.push(
      `PACK_FILES in handpose.ts is [${fromSource.join(", ")}] but this script expects [${EXPECTED_MEMBERS.join(", ")}]: ` +
        "update EXPECTED_MEMBERS, or the page and the pack disagree",
    );
  }
}

/* ── Read ────────────────────────────────────────────────────────────────── */

if (!existsSync(METRICS)) {
  console.error("stage-handpose-packs: src/lib/samples/handpose-metrics.json is missing; run build-handpose-data.py first");
  process.exit(1);
}
const metrics = JSON.parse(readFileSync(METRICS, "utf8"));
let targets = metrics.samples.filter((s) => s.pack);
if (ONLY) targets = targets.filter((s) => s.slug === ONLY);
if (targets.length === 0) {
  console.error(`stage-handpose-packs: no sample with pack: true${ONLY ? ` matches --only ${ONLY}` : ""}`);
  process.exit(1);
}

const manifestPath = join(PACKS, "manifest.json");
if (!existsSync(manifestPath)) {
  console.error(`stage-handpose-packs: ${shown(manifestPath)} is missing; run pack-handpose-assets.py first`);
  process.exit(1);
}
const packManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const listed = new Map((packManifest.packs ?? []).map((p) => [p.slug, p]));

function unzipList(zip) {
  return execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).split("\n").filter(Boolean);
}
function unzipMember(zip, name) {
  return execFileSync("unzip", ["-p", zip, name], { maxBuffer: 256 * 1024 * 1024 });
}

/** Everything about one pack that can be known without the bucket. */
function inspect(s) {
  const slug = s.slug;
  const nn = String(s.n).padStart(2, "0");
  const fail = (msg) => errors.push(`${slug}: ${msg}`);
  const out = { slug, nn, ok: false, notes: [] };

  const entry = listed.get(slug);
  if (!entry) {
    fail(`not listed in ${shown(manifestPath)}`);
    return out;
  }
  const zipPath = join(PACKS, entry.file ?? `${slug}-pack.zip`);
  if (!existsSync(zipPath)) {
    fail(`${shown(zipPath)} is missing`);
    return out;
  }

  const zip = readFileSync(zipPath);
  out.zipPath = zipPath;
  out.zipBytes = zip.length;
  out.zipSha = sha256(zip);
  if (zip.length !== entry.bytes || out.zipSha !== entry.sha256) {
    fail("the zip differs from the pack manifest (size or sha256): it was rebuilt after the manifest, run pack-handpose-assets.py again");
  }

  // The members: exactly the files the page lists, in one folder named for the sample.
  const members = unzipList(zipPath);
  const want = EXPECTED_MEMBERS.map((m) => `${slug}/${m.replace("NN", nn)}`);
  for (const w of want) if (!members.includes(w)) fail(`pack has no ${w.slice(slug.length + 1)}`);
  for (const m of members) {
    if (m.endsWith("/") || want.includes(m) || args.includes("--allow-extra")) continue;
    fail(`pack holds ${m.slice(slug.length + 1) || m}, which the page does not list`);
  }

  // Privacy: every member goes through the same scan as the public files.
  const bodies = new Map();
  for (const m of members) {
    if (m.endsWith("/")) continue;
    const buf = unzipMember(zipPath, m);
    bodies.set(m, buf);
    for (const f of scanFile(m, buf)) fail(`privacy scan: ${f.at}  ${f.rule}`);
  }

  // The pack's own checksums must hold for the files as shipped.
  const sums = bodies.get(`${slug}/SHA256SUMS`);
  if (sums) {
    for (const line of sums.toString("utf8").split("\n").filter(Boolean)) {
      const m = /^([0-9a-f]{64}) {2}(.+)$/.exec(line);
      if (!m) {
        fail(`SHA256SUMS has a line this script cannot read`);
        continue;
      }
      const body = bodies.get(`${slug}/${m[2]}`);
      if (!body) fail(`SHA256SUMS lists ${m[2]}, which is not in the pack`);
      else if (sha256(body) !== m[1]) fail(`SHA256SUMS does not match ${m[2]}`);
    }
  }

  // The metadata: the file that is uploaded on its own, so it is the one read.
  const metaBuf = bodies.get(`${slug}/metadata.json`);
  if (metaBuf) {
    out.meta = metaBuf;
    let meta;
    try {
      meta = JSON.parse(metaBuf.toString("utf8"));
    } catch {
      fail("metadata.json is not valid JSON");
    }
    if (meta) {
      if (meta.slug !== slug) fail(`metadata.json is for ${meta.slug}`);
      if (/longest_gap|longestGap/.test(metaBuf.toString("utf8"))) {
        fail("metadata.json carries the pipeline gate's longest gap, which disagrees with the lane; rebuild the pack after build-handpose-data.py publishes longestNoPoseFrames");
      }
      // The pack says what the page says: same counts, same shares, same length.
      const same = (what, got, want) => got !== want && fail(`metadata.json ${what} is ${JSON.stringify(got)}, the metrics say ${JSON.stringify(want)}`);
      same("frames", meta.frames, s.frames);
      same("fps", meta.fps, metrics.fps);
      same("seconds", meta.seconds, s.seconds);
      for (const hand of ["left", "right"]) {
        const h = meta.hands?.[hand] ?? {};
        same(`${hand} measured`, h.measured, s[hand].measured);
        same(`${hand} guessed`, h.guessed, s[hand].guessed);
        same(`${hand} bridged`, h.bridged, s[hand].bridged);
        same(`${hand} no_3d_pose`, h.no_3d_pose, s[hand].none);
        same(`${hand} pose_pct`, h.pose_pct, s[hand].posePct);
        same(`${hand} missed_pct_reported`, h.missed_pct_reported, s[hand].missedPct);
        if (h.longest_no_pose_frames !== undefined) same(`${hand} longest_no_pose_frames`, h.longest_no_pose_frames, s[hand].longestNoPoseFrames);
      }
    }
    // A copy on disk next to the zip, if somebody unpacked it, must be the same file.
    const loose = join(PACKS, slug, "metadata.json");
    if (existsSync(loose) && !readFileSync(loose).equals(metaBuf)) fail(`${shown(loose)} differs from the metadata.json inside the zip`);
  }

  out.members = members.length;
  out.ok = true;
  return out;
}

const inspected = targets.map(inspect);

/* ── Plan ────────────────────────────────────────────────────────────────── */

const plan = inspected
  .filter((p) => p.zipBytes != null && p.meta)
  .map((p) => {
    const zipObject = `${PREFIX}/packs/${p.slug}-pack.zip`;
    const metaObject = `${PREFIX}/metadata/${p.slug}.metadata.json`;
    return {
      ...p,
      zipObject,
      metaObject,
      entry: {
        preview: { object: zipObject, bytes: p.zipBytes, filename: `${p.slug}-pack.zip`, contentType: "application/zip" },
        metadata: { object: metaObject, bytes: p.meta.length, filename: `${p.slug}.metadata.json`, contentType: "application/json" },
        full: { object: null, bytes: null, filename: `${p.slug}-full-delivery`, contentType: "application/octet-stream", note: FULL_NOTE },
      },
    };
  });

/** The manifest as it would be written: existing entries kept, these replaced, sorted. */
function mergedManifest() {
  const current = existsSync(DOWNLOADS) ? JSON.parse(readFileSync(DOWNLOADS, "utf8")) : { samples: {} };
  const samples = { ...(current.samples ?? {}) };
  for (const p of plan) samples[p.slug] = p.entry;
  const sorted = Object.fromEntries(Object.keys(samples).sort().map((k) => [k, samples[k]]));
  const { _note, ...rest } = current;
  return `${JSON.stringify({ ...(_note ? { _note } : {}), ...rest, samples: sorted }, null, 2)}\n`;
}

/* ── Report ──────────────────────────────────────────────────────────────── */

const bucketName = process.env.GCS_BUCKET_NAME ?? process.env.GCS_BUCKET ?? "<bucket>";
console.log(`stage-handpose-packs ${UPLOAD ? "--upload" : "(dry run)"}${FORCE ? " --force" : ""}`);
console.log(`packs   ${shown(PACKS)}`);
console.log(`samples ${targets.map((t) => t.slug).join(", ")}\n`);

for (const p of inspected) {
  if (!p.zipBytes) {
    console.log(`${p.slug}  NOT READY`);
    continue;
  }
  console.log(`${p.slug}  ${p.zipBytes.toLocaleString("en-US")} B  sha256 ${p.zipSha.slice(0, 12)}…  ${p.members} members`);
  const pl = plan.find((x) => x.slug === p.slug);
  if (pl) {
    console.log(`  preview   gs://${bucketName}/${pl.zipObject}  ${mib(pl.entry.preview.bytes)}`);
    console.log(`  metadata  gs://${bucketName}/${pl.metaObject}  ${mib(pl.entry.metadata.bytes)}`);
    console.log(`  full      not staged: ${pl.entry.full.filename}`);
  }
}

const next = mergedManifest();
const before = existsSync(DOWNLOADS) ? readFileSync(DOWNLOADS, "utf8") : "";
console.log(`\nsrc/lib/samples/handpose-downloads.json ${next === before ? "would be unchanged" : "would become"}:`);
console.log(next);

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  console.error(`${errors.length} problem${errors.length === 1 ? "" : "s"}, nothing uploaded:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
if (!UPLOAD) {
  console.log("dry run: nothing uploaded, nothing written. Re-run with --upload (and --env-file=.env.local) to stage.");
  process.exit(0);
}

/* ── Upload ──────────────────────────────────────────────────────────────── */

for (const k of ["GCS_PROJECT_ID", "GCS_CLIENT_EMAIL", "GCS_PRIVATE_KEY"]) {
  if (!process.env[k]) {
    console.error(`${k} is not set; run with node --env-file=.env.local`);
    process.exit(1);
  }
}
if (!process.env.GCS_BUCKET_NAME && !process.env.GCS_BUCKET) {
  console.error("GCS_BUCKET_NAME is not set; run with node --env-file=.env.local");
  process.exit(1);
}

/** Same credential handling as stage-packs.mjs: the key arrives quoted and with literal \n. */
async function bucket() {
  const { Storage } = await import("@google-cloud/storage");
  let pk = process.env.GCS_PRIVATE_KEY ?? "";
  if ((pk.startsWith('"') && pk.endsWith('"')) || (pk.startsWith("'") && pk.endsWith("'"))) pk = pk.slice(1, -1);
  pk = pk.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r/g, "");
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: { client_email: process.env.GCS_CLIENT_EMAIL, private_key: pk },
  });
  return storage.bucket(process.env.GCS_BUCKET_NAME ?? process.env.GCS_BUCKET);
}

const b = await bucket();

// Look before writing anything: one existing object stops the whole run.
const objects = plan.flatMap((p) => [p.zipObject, p.metaObject]);
if (!FORCE) {
  const taken = [];
  for (const o of objects) if ((await b.file(o).exists())[0]) taken.push(o);
  if (taken.length) {
    console.error(`refusing to overwrite ${taken.length} existing object${taken.length === 1 ? "" : "s"} (use --force to replace):`);
    for (const o of taken) console.error(`  gs://${bucketName}/${o}`);
    process.exit(1);
  }
}

/** A create-only write unless --force: GCS rejects it if the object appeared since the look above. */
const precondition = FORCE ? {} : { preconditionOpts: { ifGenerationMatch: 0 } };

for (const p of plan) {
  await b.upload(p.zipPath, {
    destination: p.zipObject,
    resumable: false,
    metadata: { contentType: "application/zip" },
    ...precondition,
  });
  await b.file(p.metaObject).save(p.meta, {
    resumable: false,
    contentType: "application/json",
    ...precondition,
  });

  // Read back what the bucket holds, not what we sent.
  for (const [object, buf] of [[p.zipObject, readFileSync(p.zipPath)], [p.metaObject, p.meta]]) {
    const [meta] = await b.file(object).getMetadata();
    const md5 = createHash("md5").update(buf).digest("base64");
    if (Number(meta.size) !== buf.length || meta.md5Hash !== md5) {
      console.error(`uploaded ${object} does not match the local file (size ${meta.size}, md5 ${meta.md5Hash}); manifest NOT written`);
      process.exit(1);
    }
  }
  console.log(`staged ${p.slug}`);
}

writeFileSync(DOWNLOADS, next);
console.log(`\nmanifest -> ${shown(DOWNLOADS)}`);
