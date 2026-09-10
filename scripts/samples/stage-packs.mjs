/**
 * Stage the downloadable side of the sample library.
 *
 * The catalogue pages ship an 8-second, 640x480 preview of every sample so the
 * page stays light. This script builds what a visitor actually takes away once
 * they are past the gate, uploads it to GCS, and writes the manifest the
 * download route signs against.
 *
 * Three assets per sample:
 *
 *   preview   a zip of the clip, poster, metadata sidecar and telemetry track.
 *             Small, real, and buildable from what is already in `public/`, so
 *             the gate has something to open on day one.
 *   metadata  the sidecar on its own, for people who want to read the record
 *             before committing to a transfer.
 *   full      the delivery file itself (.mcap, the egocentric segment, the game
 *             session). These are 180 MB to 1.8 GB and are not in this repo;
 *             the manifest carries a null object until someone uploads them,
 *             and the route answers `not_staged` rather than signing a URL for
 *             an object that is not there.
 *
 * Usage:
 *   node --env-file=.env.local scripts/samples/stage-packs.mjs [--dry] [--only <slug>]
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { Storage } from "@google-cloud/storage";
import { publicSpec } from "../../src/lib/samples/redact.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const PUBLIC = join(ROOT, "public/samples");
const STAGE = join(ROOT, ".samples-stage");
const PREFIX = "samples/library";

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;

const samples = JSON.parse(readFileSync(join(ROOT, "src/lib/samples/samples.json"), "utf8"));

/** "486 MB" / "1.8 GB" -> bytes. Used only to show a size before staging. */
function parseSize(text) {
  const m = /^([\d.]+)\s*(KB|MB|GB|TB)$/i.exec(String(text).trim());
  if (!m) return null;
  const mult = { kb: 1024, mb: 1048576, gb: 1073741824, tb: 1099511627776 };
  return Math.round(parseFloat(m[1]) * mult[m[2].toLowerCase()]);
}

/**
 * The delivery file a customer is really after, per domain. Names follow what
 * the team already uses on disk so an upload lands on the expected object.
 */
function fullAsset(s) {
  if (s.domain === "ots") return { filename: `${s.slug}.mcap`, note: "MCAP with the stereo pair, IMU, VIO and annotations" };
  if (s.domain === "robotics") return { filename: `${s.slug}-segment.zip`, note: "Six camera mp4s, imu_left.db, imu_right.db, mag_middle.db" };
  return { filename: `${s.slug}-session.zip`, note: "Screen capture mp4, frames.csv, session.json, key_bindings.json" };
}

/** The metadata sidecar. Mirrors the record the page shows, plus provenance. */
function sidecar(s) {
  return {
    schema: "tbrain.samples/v1",
    slug: s.slug,
    title: s.title,
    domain: s.domain,
    taxonomy: {
      industry: s.industry,
      skillGroup: s.skillGroup,
      job: s.job,
      breadcrumb: s.breadcrumb,
      viewpoint: s.viewpoint,
    },
    capture: {
      rig: s.rig,
      environment: s.environment,
      locale: s.locale,
      durationSec: s.durationSec,
      resolution: s.resolution,
      fps: s.fps,
      streams: s.streams,
    },
    delivery: {
      formats: s.formats,
      size: s.size,
      telemetryTrack: s.telemetry,
    },
    // Same rows the page prints: everything descriptive, minus the pipeline's
    // internal ids.
    record: Object.fromEntries(publicSpec(s.spec)),
    provenance: {
      collector: "Tbrain",
      collected: true,
      scraped: false,
      note: "Collected by Tbrain operators under contract. Operators are not identifiable in the delivered files. Game captures are licensed per engagement.",
    },
  };
}

function zipDir(dir, outFile) {
  rmSync(outFile, { force: true });
  // `zip` ships with macOS and every CI image we use; -r -q -X drops resource
  // forks so the archive is identical between machines.
  execFileSync("zip", ["-r", "-q", "-X", outFile, "."], { cwd: dir });
  return statSync(outFile).size;
}

function bucket() {
  let pk = process.env.GCS_PRIVATE_KEY ?? "";
  if ((pk.startsWith('"') && pk.endsWith('"')) || (pk.startsWith("'") && pk.endsWith("'"))) pk = pk.slice(1, -1);
  pk = pk.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r/g, "");
  const storage = new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: { client_email: process.env.GCS_CLIENT_EMAIL, private_key: pk },
  });
  return storage.bucket(process.env.GCS_BUCKET_NAME ?? process.env.GCS_BUCKET);
}

const b = DRY ? null : bucket();

async function upload(local, object, contentType) {
  if (DRY) return;
  await b.upload(local, { destination: object, resumable: false, metadata: { contentType } });
}

rmSync(STAGE, { recursive: true, force: true });
mkdirSync(STAGE, { recursive: true });

const manifest = {
  bucket: process.env.GCS_BUCKET_NAME ?? process.env.GCS_BUCKET ?? null,
  generatedAt: new Date().toISOString(),
  fullSet: null,
  samples: {},
};

const setDir = join(STAGE, "tbrain-sample-library");
mkdirSync(setDir, { recursive: true });

for (const s of samples) {
  if (ONLY && s.slug !== ONLY) continue;

  const packDir = join(STAGE, "packs", s.slug);
  mkdirSync(packDir, { recursive: true });

  const meta = sidecar(s);
  const metaPath = join(packDir, `${s.slug}.metadata.json`);
  writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");

  const clip = join(PUBLIC, "clips", `${s.slug}.mp4`);
  const poster = join(PUBLIC, "posters", `${s.slug}.jpg`);
  const telem = join(PUBLIC, "telemetry", `${s.slug}.json`);
  if (existsSync(clip)) cpSync(clip, join(packDir, `${s.slug}-preview.mp4`));
  if (existsSync(poster)) cpSync(poster, join(packDir, `${s.slug}-poster.jpg`));
  if (existsSync(telem)) cpSync(telem, join(packDir, `${s.slug}-telemetry.json`));

  const full = fullAsset(s);
  writeFileSync(
    join(packDir, "README.txt"),
    [
      `${s.title}`,
      `${s.slug} · ${s.rig} · ${s.environment}`,
      ``,
      `This is the preview pack: an 8-second 640x480 excerpt, the poster frame,`,
      `the metadata sidecar, and the telemetry track where one was captured.`,
      ``,
      `The full delivery for this sample is ${s.size} (${full.filename}):`,
      `  ${full.note}`,
      `Ask your Tbrain contact, or use the same passcode against the full-set link.`,
      ``,
      `Collected by Tbrain operators. Not scraped.`,
      ``,
    ].join("\n")
  );

  cpSync(packDir, join(setDir, s.slug), { recursive: true });

  const zipPath = join(STAGE, `${s.slug}.zip`);
  const zipBytes = zipDir(packDir, zipPath);
  const metaBytes = statSync(metaPath).size;

  const previewObject = `${PREFIX}/packs/${s.slug}-preview.zip`;
  const metaObject = `${PREFIX}/metadata/${s.slug}.metadata.json`;

  await upload(zipPath, previewObject, "application/zip");
  await upload(metaPath, metaObject, "application/json");

  manifest.samples[s.slug] = {
    preview: { object: previewObject, bytes: zipBytes, filename: `${s.slug}-preview.zip`, contentType: "application/zip" },
    metadata: { object: metaObject, bytes: metaBytes, filename: `${s.slug}.metadata.json`, contentType: "application/json" },
    full: { object: null, bytes: parseSize(s.size), filename: full.filename, contentType: "application/octet-stream", note: full.note },
  };

  console.log(`${DRY ? "built " : "staged"} ${s.slug.padEnd(22)} preview ${(zipBytes / 1048576).toFixed(1)} MB · metadata ${metaBytes} B`);
}

if (!ONLY) {
  const setZip = join(STAGE, "tbrain-sample-library.zip");
  const setBytes = zipDir(setDir, setZip);
  const setObject = `${PREFIX}/tbrain-sample-library.zip`;
  await upload(setZip, setObject, "application/zip");
  manifest.fullSet = {
    object: setObject,
    bytes: setBytes,
    filename: "tbrain-sample-library.zip",
    contentType: "application/zip",
    count: samples.length,
  };
  console.log(`${DRY ? "built " : "staged"} full set${"".padEnd(15)} ${(setBytes / 1048576).toFixed(1)} MB · ${samples.length} samples`);
}

if (!ONLY) {
  const out = join(ROOT, "src/lib/samples/downloads.json");
  writeFileSync(out, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nmanifest -> src/lib/samples/downloads.json`);
}

rmSync(STAGE, { recursive: true, force: true });
