/**
 * Write the six-camera records, and the hand-pose records beside them.
 *
 * `capability.ts` has priced `stereo6` since 2026-09-10 and `ConfigFolders`
 * has been drawing its card from a borrowed montage (`STANDIN.stereo6 =
 * "rig-six"`) because the catalogue held zero records for it. Two deliveries
 * fix that, and they are NOT the same set:
 *
 *   6cam      10 trades, six lenses each, ~4m38s per episode, 4.55 h total
 *   handpose   7 of those trades, six lenses, 30 s each, plus a rendered
 *              hand-pose overlay on the pair that sees the hands
 *
 * Different lengths, different resolutions, different Drive folders. Filing
 * them as one set would print "17 samples · 4.6 hours" over a grid where seven
 * cards are half-minute clips.
 *
 * WHAT THIS SCRIPT WILL NOT CLAIM
 *
 * `ingest-drive.mjs` indexes video files only — `VIDEO = /\.(mp4|mov|...)$/i`
 * — so the crawl saw six .mp4 per trade and nothing else. The tier's `outputs`
 * row promises `camera_info per lens + imu.csv + VIO`, and that promise is the
 * SHEET's, quoted in `capability.ts` where it belongs. A record here states
 * only what was measured off the delivery: the lenses, the frame, the length
 * and the bytes. The 2-cam corpus can print an IMU rate because its metadata
 * shipped one; this one cannot, and inventing the row to match its neighbours
 * would be the same class of error as `info.json` declaring 10 teleop episodes
 * over a disk holding 11.
 *
 * Locale is "Vietnam", which every other record in the catalogue also says and
 * which is where Tbrain collects. Environment is the tier's own line rather
 * than a workplace per trade: a sewing task was plainly shot somewhere that
 * sews, but "Sewing Factory, Sewing Area" is a claim about a shoot nobody
 * measured. Coarse and true beats specific and guessed — same rule as
 * `redact.mjs`.
 *
 * Usage:
 *   node scripts/samples/build-sixcam-records.mjs [--set sixcam|handpose] [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { overlayPair, sixcamTasks } from "./sixcam-slugs.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const SAMPLES = join(ROOT, "src/lib/samples/samples.json");
const CLIPS = join(ROOT, "public/samples/clips");
const POSTERS = join(ROOT, "public/samples/posters");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const SET = args.includes("--set") ? args[args.indexOf("--set") + 1] : "sixcam";

const SETS = {
  sixcam: {
    manifest: "drive-6cam.json",
    /* Both sets are the same rig, so both are the same tier. The hand-pose
       delivery is an annotation layer over it, not a fifth configuration —
       the doc lists four and inventing a fifth to hold seven clips would
       break the tree Tam asked for. */
    tier: "stereo6",
    prefix: "sixcam",
  },
  handpose: { manifest: "drive-handpose.json", tier: "stereo6", prefix: "handpose" },
};

const set = SETS[SET];
if (!set) {
  console.error(`unknown --set ${SET}; expected one of ${Object.keys(SETS).join(", ")}`);
  process.exit(1);
}

/**
 * The trade behind each folder name, in the catalogue's own vocabulary.
 *
 * Written out rather than borrowed from a "nearest" existing record, because
 * nearest is not near enough: `shoe-sorting` is the only other shoe row and it
 * is filed under Packing & Bagging, which is what shoe SORTING is and not what
 * shoe SEWING is. Every string below is asserted against the strings already
 * in `samples.json` further down, so a typo or a drifted label fails the run
 * instead of quietly adding a facet value of one.
 */
const TRADES = {
  "engine-working": {
    title: "Engine working",
    skillGroup: "Mechanical / Automotive Work",
    industry: "Automotive and Transport",
    job: "Mechanic",
  },
  "fabric-sewing": {
    title: "Fabric sewing",
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Tailor / seamstress",
  },
  "garment-sewing": {
    title: "Garment sewing",
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Tailor / seamstress",
  },
  "panel-installation": {
    title: "Panel installation",
    skillGroup: "Construction & Building",
    industry: "Construction and Hardware",
    job: "Construction laborer",
  },
  "pineapple-cutting": {
    title: "Pineapple cutting",
    skillGroup: "Food Preparation & Cooking",
    industry: "Food and Beverage",
    job: "Food prep worker",
  },
  "room-cleaning": {
    title: "Room cleaning",
    skillGroup: "Cleaning & Sanitation",
    industry: "Hospitality",
    job: "Cleaner",
  },
  "shoe-sewing": {
    title: "Shoe sewing",
    skillGroup: "Clothing & Laundry",
    industry: "Repair Services",
    job: "Shoe repairer",
  },
  "wood-grinding": {
    title: "Wood grinding",
    skillGroup: "Tool Use & Technical Manipulation",
    industry: "Industrial Manufacturing",
    job: "Woodworker",
  },
  "wrapping-selecting": {
    title: "Wrapping and selecting",
    skillGroup: "Packing & Bagging",
    industry: "Industrial Manufacturing",
    job: "Assembler",
  },
  "zipper-sewing": {
    title: "Zipper sewing",
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Tailor / seamstress",
  },
};

/** The tier's line from `capability.ts`, not a guess at each trade's premises. */
const ENVIRONMENT = "Workshop, workplace, on site";

/** `WxH` of a staged clip, read off the file rather than assumed. */
function probe(file) {
  const out = execFileSync(
    "ffprobe",
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", file],
    { encoding: "utf8" },
  ).trim();
  return out.replace("x", " x ");
}

function mmss(sec) {
  const s = Math.round(sec);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
}

const all = JSON.parse(readFileSync(SAMPLES, "utf8"));

/* Vocabulary assert. A facet chip reading "Hospitalty" is worse than no chip:
   it splits a group in two and nothing on the page says why. */
const VOCAB = {
  skillGroup: new Set(all.map((s) => s.skillGroup).filter(Boolean)),
  industry: new Set(all.map((s) => s.industry).filter(Boolean)),
  job: new Set(all.map((s) => s.job).filter(Boolean)),
};
const unknown = [];
for (const [task, t] of Object.entries(TRADES)) {
  for (const key of ["skillGroup", "industry", "job"]) {
    if (!VOCAB[key].has(t[key])) unknown.push(`${task}.${key} = ${JSON.stringify(t[key])}`);
  }
}
if (unknown.length) {
  console.error("not in the catalogue's vocabulary:\n  " + unknown.join("\n  "));
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(join(ROOT, "scripts/samples", set.manifest), "utf8"),
);
const tasks = sixcamTasks(manifest, SET);

const records = [];
const skipped = [];
for (const t of tasks) {
  const trade = TRADES[t.task];
  if (!trade) {
    skipped.push(`${t.task} — no row in TRADES`);
    continue;
  }
  /* A record without a clip is a card with a dead poster. The cutter runs
     first; anything it failed on waits for the next pass rather than shipping
     broken. */
  if (!existsSync(join(CLIPS, `${t.slug}.mp4`)) || !existsSync(join(POSTERS, `${t.slug}.jpg`))) {
    skipped.push(`${t.task} — no preview on disk`);
    continue;
  }

  const hp = SET === "handpose";
  const pair = hp ? overlayPair(t.overlays) : null;
  /* Which of the six the cutter actually staged, which is not always six —
     `garment-sewing` has an `outer_left.mp4` that ffprobe cannot open. The
     record says what is here, and `index-views.mjs` tells the card the same
     thing off the same files. */
  const staged = ["", "-primary-right", "-mid-left", "-mid-right", "-outer-left", "-outer-right"]
    .filter((s) => existsSync(join(CLIPS, `${t.slug}${s}.mp4`)));
  /* Measured off the file the page will actually serve, not off the delivery.
     The caption is about the thing in the browser — the 118 stereo records say
     "576 x 432" for the same reason — and the source frame has its own row. */
  const cut = probe(join(CLIPS, `${t.slug}.mp4`));
  const mb = Math.round(t.bytes / 1e6);
  const title = hp ? `${trade.title} · hand pose` : trade.title;

  records.push({
    slug: t.slug,
    domain: "robotics",
    modality: "egocentric",
    tier: set.tier,
    provenance: "custom",
    title,
    task: t.task,
    label: trade.skillGroup,
    skill: trade.skillGroup,
    skillGroup: trade.skillGroup,
    industry: trade.industry,
    job: trade.job,
    environment: ENVIRONMENT,
    locale: "Vietnam",
    /* Configuration, never the model string. "Rig ko ghi tên" — redact.mjs. */
    rig: "Six-camera head rig, three stereo pairs",
    viewpoint: "first-person",
    telemetry: false,
    durationSec: t.durationSec,
    resolution: `${t.width}x${t.height}`,
    fps: t.fps,
    streams: hp
      ? ["RGB x6 (three stereo pairs)", "Hand-pose overlay render"]
      : ["RGB x6 (three stereo pairs)"],
    formats: ["mp4"],
    size: `${mb} MB`,
    spec: [
      ["Task id", t.task],
      ["Skill group", trade.skillGroup],
      ["Industry", trade.industry],
      ["Operator", trade.job],
      ["Cameras", "Six, in three stereo pairs — primary, mid and outer"],
      /* Only when it is not six. A row reading "6 of 6" on ten cards is noise;
         the one card where a lens failed to probe has to say so. */
      ...(t.cams.length === 6 ? [] : [["Views measured", `${t.cams.length} of 6`]]),
      ["Frame", `${t.width}x${t.height} at ${t.fps} fps`],
      [hp ? "Segment" : "Episode", mmss(t.durationSec)],
      ...(hp && pair
        ? [["Hand pose", `Rendered overlay on the ${pair} pair, left and right`]]
        : []),
      ["Delivered size", `${mb} MB across ${t.cams.length + t.overlays.length} files`],
      /* Say it rather than quietly correct it. The rig build that shot these
         mounts the camera block inverted, so the delivery is upside down and
         the preview is not. A buyer writing a loader has to know which one
         they are getting. */
      ...(t.inverted
        ? [["Orientation", "Recorded inverted; the preview is rotated 180°, the delivery is not"]]
        : []),
    ],
    breadcrumb: ["Samples", "Egocentric", title],
    /* Prose, not a path. `SampleCatalog` prints this as the card's caption and
       `SampleModal` prints it again under the player, so a record whose
       `preview` is "/samples/clips/sixcam-wood-grinding.mp4" puts its own file
       path on the page where a sentence about what you are looking at belongs.
       The 118 stereo records get this right; `build-teleop-records.mjs` does
       not, and its 11 cards are still captioned with a URL. */
    preview: hp
      ? `Preview · 8 s of the hand-pose render, both eyes of the annotated pair · ${cut}`
      : `Preview · 8 s on ${
          staged.length === 6 ? "all six lenses" : `${staged.length} of the six lenses`
        }, the same instant on each · ${cut} per view`,
    pills: [
      { t: trade.skillGroup, k: "skill" },
      { t: "6 cameras", k: "quality" },
      ...(hp ? [{ t: "Hand pose", k: "quality" }] : []),
      { t: `${mb} MB`, k: "file" },
    ],
    downloads: [{ t: "Preview pack", primary: true }],
  });
}

console.log(`${SET} records: ${records.length}`);
for (const r of records) {
  console.log(`  ${r.slug.padEnd(28)} ${Math.round(r.durationSec)}s  ${r.resolution}  ${r.size}`);
}
for (const s of skipped) console.log(`  skip ${s}`);
if (DRY) process.exit(0);

/* Replace this set only. The two share a tier, so filtering on tier would wipe
   the other one every run. */
const kept = all.filter((s) => !s.slug.startsWith(`${set.prefix}-`));
writeFileSync(SAMPLES, JSON.stringify([...kept, ...records], null, 2) + "\n");
console.log(`\nwrote ${kept.length} kept + ${records.length} ${SET} → samples.json`);
