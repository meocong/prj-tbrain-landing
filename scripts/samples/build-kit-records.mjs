/**
 * Write the records for the kit delivery: three configurations from one folder.
 *
 * `capability.ts` has priced `mono`, `wrist` and `rgbd` since the sheet was
 * transcribed and the catalogue held zero records for any of them, so the facet
 * rail on `/samples/egocentric` offered three chips reading 0 and
 * `ConfigFolders` drew the wrist card with no face at all. One delivery fixes
 * all three — Thạch, 2026-09-11, asked for exactly that: "cả 3 chứ".
 *
 * WHAT THIS SCRIPT WILL NOT CLAIM
 *
 * 1. That anything is time-synced. Every session records `sync: "none"` and a
 *    start policy of `gopro_wired_only` or `raw_independent_start_no_sync`, and
 *    the cameras prove it: session `13-58-30` ran its three GoPros for 80.96,
 *    123.52 and 123.54 seconds. The tier sheet's `sync_offset.json` and the
 *    six-camera page's "hardware-synced clock, frame-level" are the SHEET's
 *    claims about what we sell; a record states what the delivery did.
 *
 * 2. Which camera is the head one. `<cam>.calib.json` says `role: "gopro_1"` and
 *    nothing more, and `missing_streams` names `wrist_left.mp4` and
 *    `wrist_right.mp4` on all 85 sessions — including the three-camera ones —
 *    so it is the kit's profile template, not an audit. A frame from
 *    `gopro_3_original.mp4` shows two wrist-strapped cameras and both hands, so
 *    the rig IS one head camera and two wrist cameras; which index is which is
 *    not in the delivery and is not invented here.
 *
 * 3. A camera model. Every `.calib.json` names one. "Rig ko ghi tên" — the rig
 *    row is the configuration, per `redact.mjs`.
 *
 * Locale is "Vietnam". Environment is the tier's own line from `capability.ts`
 * rather than a workplace per trade: these were plainly shot in a garment
 * factory, and "Sewing Factory, Packing Area" is a claim about a shoot nobody
 * measured. Coarse and true beats specific and guessed.
 *
 * Usage:
 *   node scripts/samples/build-kit-records.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { CONFIGS, TASKS, kitGroups } from "./kit-slugs.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const SAMPLES = join(ROOT, "src/lib/samples/samples.json");
const MANIFEST = join(ROOT, "scripts/samples/kit-sessions.json");
const CLIPS = join(ROOT, "public/samples/clips");
const POSTERS = join(ROOT, "public/samples/posters");

const DRY = process.argv.includes("--dry");

/** The tier's line from `capability.ts`, not a guess at each trade's premises. */
const ENVIRONMENT = "Household, factory, daily";

/**
 * Frame and formats per configuration, read off the delivery's own sidecars.
 *
 * The GoPro figure is every `.calib.json` in the delivery agreeing: wide lens,
 * 1920x1080, 60 fps. The D455 figure is its `calibration.txt` and `session.json`
 * agreeing on 848x480 at 30 across all five of its streams.
 */
const FRAME = {
  mono: { resolution: "1920x1080", fps: 60 },
  wrist: { resolution: "1920x1080", fps: 60 },
  rgbd: { resolution: "848x480", fps: 30 },
};

const FORMATS = {
  mono: ["mp4", "wav", "csv", "json"],
  wrist: ["mp4", "wav", "csv", "json"],
  rgbd: ["mp4", "png16", "csv", "json"],
};

/** The card's title has to differ per configuration or the grid shows doubles. */
const TITLE_SUFFIX = { mono: "", wrist: " · three cameras", rgbd: " · depth" };

/**
 * How this rig was started, in a buyer's terms rather than the kit's.
 *
 * A loader author reads this row and decides whether they can index frames by a
 * shared clock. They cannot, and the row has to say so before they licence.
 */
const SYNC_ROW = [
  "Synchronisation",
  "Independent start per camera, no hardware sync — each stream carries its own first-frame host timestamp",
];

function mmss(sec) {
  const s = Math.round(sec);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

const gb = (b) => (b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${Math.round(b / 1e6)} MB`);

const all = JSON.parse(readFileSync(SAMPLES, "utf8"));

/* Vocabulary assert, against the canonical taxonomies rather than against
   whatever is already in `samples.json`. A facet chip reading "Clothing &
   Laundy" is worse than no chip: it splits a group in two and nothing on the
   page says why. Industries are checked against the records because
   `taxonomy.ts` says its own list is descriptive, not final. */
const tax = readFileSync(join(ROOT, "src/lib/samples/taxonomy.ts"), "utf8");
const listOf = (name) =>
  new Set(
    [...(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\] as const`).exec(tax)?.[1] ?? "")
      .matchAll(/"([^"]+)"/g)].map((m) => m[1]),
  );
const VOCAB = {
  skillGroup: listOf("SKILL_GROUPS"),
  job: listOf("JOBS"),
  industry: new Set(all.map((s) => s.industry).filter(Boolean)),
};
const unknown = [];
for (const [name, t] of Object.entries(TASKS)) {
  for (const key of ["skillGroup", "industry", "job"]) {
    if (!VOCAB[key].has(t[key])) unknown.push(`${name} → ${key} = ${JSON.stringify(t[key])}`);
  }
}
if (unknown.length) {
  console.error("not in the catalogue's vocabulary:\n  " + unknown.join("\n  "));
  process.exit(1);
}

const groups = kitGroups(JSON.parse(readFileSync(MANIFEST, "utf8")));

const records = [];
const skipped = [];
for (const g of groups) {
  const { trade, config } = g;
  /* A record without a clip is a card with a dead poster. The cutter runs
     first; anything it failed on waits for the next pass rather than shipping
     broken. */
  const hasPreview =
    existsSync(join(CLIPS, `${g.slug}.mp4`)) && existsSync(join(POSTERS, `${g.slug}.jpg`));
  if (!hasPreview && !DRY) {
    skipped.push(`${g.slug} — no preview on disk`);
    continue;
  }

  const cfg = CONFIGS[config];
  const frame = FRAME[config];
  const title = `${trade.title}${TITLE_SUFFIX[config]}`;
  const views =
    g.camerasMin === g.camerasMax
      ? null
      : `${g.camerasMin}-${g.camerasMax} of 3 recorded, by session`;

  records.push({
    slug: g.slug,
    domain: "robotics",
    modality: "egocentric",
    tier: config,
    provenance: "custom",
    title,
    task: g.task,
    label: trade.skillGroup,
    skill: trade.skillGroup,
    skillGroup: trade.skillGroup,
    industry: trade.industry,
    job: trade.job,
    environment: ENVIRONMENT,
    locale: "Vietnam",
    rig: cfg.rig,
    viewpoint: "first-person",
    telemetry: false,
    /* The bucket's total, not one episode's. `ConfigFolders` sums this field to
       print a configuration's hours, and a per-episode figure would make a
       14-episode run report 2 minutes. `Longest episode` keeps the shape of a
       single recording visible beside it. */
    durationSec: g.durationSec,
    resolution: frame.resolution,
    fps: frame.fps,
    streams: cfg.streams,
    formats: [...FORMATS[config], ...(g.lerobot ? ["LeRobot"] : [])],
    size: gb(g.bytes),
    spec: [
      ["Task id", g.task],
      ["Skill group", trade.skillGroup],
      ["Industry", trade.industry],
      ["Operator", trade.job],
      ["Cameras", cfg.cameras],
      ...(views ? [["Views measured", views]] : []),
      ["Frame", `${frame.resolution} at ${frame.fps} fps`],
      /* The total is over the episodes whose length came back, so say which
         those are. A bucket reading "14 episodes, 20 min" when two were never
         measured understates the delivery and cannot be checked against it. */
      [
        "Episodes",
        g.episodesMeasured === g.episodes
          ? `${g.episodes}, totalling ${mmss(g.durationSec)}`
          : `${g.episodes}, of which ${g.episodesMeasured} measured, totalling ${mmss(g.durationSec)}`,
      ],
      ["Longest episode", mmss(g.longestSec)],
      SYNC_ROW,
      ...(config === "rgbd"
        ? [
            [
              "Depth",
              "16-bit PNG at 0.001 m per unit, with the colour and IR intrinsics and their extrinsics",
            ],
          ]
        : []),
      /* Only where some sessions carry it. Printed unconditionally it would
         promise every buyer an export three quarters of the episodes do not
         have. */
      ...(g.lerobot
        ? [["LeRobot export", `On ${g.lerobot} of ${g.episodes} episodes`]]
        : []),
      ["Delivered size", `${gb(g.bytes)} across ${g.episodes} episodes`],
    ],
    breadcrumb: ["Samples", "Egocentric", title],
    /* Prose, not a path: `SampleCatalog` prints this as the card's caption and
       `SampleModal` prints it again under the player. */
    preview: `Preview · 8 s from one of ${g.episodes} episodes · ${frame.resolution} source`,
    pills: [
      { t: trade.skillGroup, k: "skill" },
      { t: cfg.cameras.split(" — ")[0], k: "quality" },
      { t: gb(g.bytes), k: "file" },
    ],
    downloads: [{ t: "Preview pack", primary: true }],
  });
}

console.log(`kit records: ${records.length}`);
for (const r of records) {
  const eps = r.spec.find((p) => p[0] === "Episodes")?.[1] ?? "";
  console.log(`  ${r.slug.padEnd(30)} ${r.tier.padEnd(6)} ${r.resolution.padEnd(10)} ${r.size.padStart(8)}  ${eps}`);
}
for (const s of skipped) console.log(`  skip ${s}`);
if (DRY) process.exit(0);

/* Replace this delivery only, by slug prefix. Filtering on tier would be wrong
   three times over: these three tiers are exactly the ones another delivery
   would land in next. */
const kept = all.filter((s) => !s.slug.startsWith("kit-"));
writeFileSync(SAMPLES, JSON.stringify([...kept, ...records], null, 2));
console.log(`\nwrote ${records.length} records (${kept.length} kept) → ${SAMPLES}`);
