#!/usr/bin/env node
/**
 * Build the 16 hand-pose catalogue records from the committed metrics.
 *
 *   node scripts/samples/handpose/build-handpose-records.mjs [--check]
 *
 * Reads  src/lib/samples/handpose-metrics.json  (written by build-handpose-data.py)
 * Writes src/lib/samples/handpose-records.json  (Sample[], see _sections/tokens.ts)
 *
 * The records are kept OUT of samples.json on purpose. samples.json is read by
 * a dozen site-wide counts — the /samples hero, the front-door coverage tiles,
 * "distinct tasks", the stage-packs run that zips every record into the
 * passcode archive — and none of them should move because sixteen derived
 * hand-pose samples arrived. Only the hand-pose page and the vault read this
 * file, and only when HAND_POSE_ON.
 *
 * Inputs are committed and sanitised, so this runs from a clean checkout with
 * no private cache. Idempotent: the output is a pure function of the metrics.
 * `--check` exits 1 if the file on disk differs from what would be written.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const METRICS = path.join(ROOT, "src/lib/samples/handpose-metrics.json");
const OUT = path.join(ROOT, "src/lib/samples/handpose-records.json");
const TAXONOMY = path.join(ROOT, "src/lib/samples/taxonomy.ts");
const CHECK = process.argv.includes("--check");

const metrics = JSON.parse(fs.readFileSync(METRICS, "utf8"));

/* Skill groups must be ones the catalogue rail knows, or the facet silently
   drops the chip (SampleCatalog lists SKILL_GROUPS, not record values). */
const taxonomy = fs.readFileSync(TAXONOMY, "utf8");
const skillBlock = taxonomy.slice(taxonomy.indexOf("export const SKILL_GROUPS"));
const SKILL_GROUPS = new Set(
  [...skillBlock.slice(0, skillBlock.indexOf("] as const")).matchAll(/"([^"]+)"/g)].map((m) => m[1]),
);

const pct = (v) => `${v.toFixed(1)}%`;
// Same rounding as `mmss` in src/lib/samples/handpose.ts: nearest second first.
const mmss = (sec) => {
  const t = Math.round(sec);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
};

/** The rail facet over min(left, right). Labels are lower-case on purpose:
    the spec-facet chips are not capitalised for this category. */
const BAND = { "95+": "95% or more", "80-95": "80 to 95%", "<80": "Below 80%" };

function record(s) {
  if (!SKILL_GROUPS.has(s.skillGroup)) {
    throw new Error(`${s.slug}: skill group "${s.skillGroup}" is not in taxonomy.ts SKILL_GROUPS`);
  }
  const video = s.preview === "video";
  return {
    slug: s.slug,
    domain: "robotics",
    modality: "handpose",
    tier: "pair",
    provenance: "custom",
    title: s.title,
    label: s.skillGroup,
    // Empty and null on purpose: no site, industry or trade is published for
    // these samples, and the rail hides a facet with no values.
    environment: "",
    locale: "",
    rig: "Six-camera head rig, stereo pair used for hand pose",
    viewpoint: "first-person",
    skillGroup: s.skillGroup,
    industry: null,
    job: null,
    telemetry: false,
    durationSec: s.seconds,
    resolution: video ? "540 x 540 camera video, hand pose overlay" : "No public video",
    fps: metrics.fps,
    streams: [
      "21 joints per hand, in metres",
      "One state per frame and hand",
      "Per-sample metrics",
    ],
    formats: s.pack ? ["npz", "json", "csv"] : ["json", "csv"],
    size: s.pack ? "Sample pack by passcode" : "On request",
    spec: [
      ["Skill group", s.skillGroup],
      ["Both hands with 3D pose", BAND[s.bothHandsBand]],
      ["Preview", video ? "Video preview" : "Preview on request"],
    ],
    breadcrumb: ["Samples", "Hand pose", s.title],
    // Printed as the card caption: the one line a buyer scans across a row.
    preview: `L ${pct(s.left.posePct)} · R ${pct(s.right.posePct)} with 3D pose`,
    pills: [
      { t: s.skillGroup, k: "skill" },
      { t: "21 joints", k: "file" },
      { t: `Measured ${pct(s.measuredOfDeliveredPct)} of delivered`, k: "quality" },
      { t: mmss(s.seconds), k: "file" },
    ],
    downloads: s.pack ? [{ t: "Sample pack", primary: true }] : [],
  };
}

const records = metrics.samples.map(record);
const slugs = new Set(records.map((r) => r.slug));
if (slugs.size !== records.length) throw new Error("duplicate slug");
for (const r of records) {
  if (!/^hand-pose-\d{2}$/.test(r.slug)) throw new Error(`bad slug ${r.slug}`);
  const labels = r.spec.map(([k]) => k);
  if (new Set(labels).size !== labels.length) throw new Error(`${r.slug}: duplicate spec label`);
}

const text = `${JSON.stringify(records, null, 2)}\n`;
if (CHECK) {
  const disk = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (disk !== text) {
    console.error("handpose-records.json is stale: run node scripts/samples/handpose/build-handpose-records.mjs");
    process.exit(1);
  }
  console.log(`handpose-records.json up to date (${records.length} records)`);
} else {
  fs.writeFileSync(OUT, text);
  console.log(`wrote ${path.relative(ROOT, OUT)} (${records.length} records)`);
}
