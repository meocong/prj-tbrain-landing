/**
 * Write the teleoperation records the catalogue never had.
 *
 * The clips have been on disk the whole time — `teleop-ep00..ep10`, plus a
 * left/right pair for ep00 — and `samples.json` held zero teleoperation rows,
 * so `/samples/teleoperation` showed a hero, a spec block and an empty grid.
 * Thạch, 2026-09-10: "teleop có data rồi còn gì." It did.
 *
 * Every field is quoted from what the repo already knows about this set, in
 * `IN_FLIGHT.teleoperation` and the category's `capture` rows: 11 episodes,
 * 14,076 frames at 30 fps, three synchronised 640x480 cameras, 7 DoF per arm
 * plus a gripper, 16-dimensional state and action, LeRobotDataset v2.1. The
 * durations and dimensions are measured off the staged previews rather than
 * taken from that prose.
 *
 * The follower arm is named in `capture` and NOT here: `rig` reaches the card
 * face and the record modal, and "Rig ko ghi tên" has no exception for a
 * gripper — see `redact.mjs`.
 *
 * Usage:
 *   node scripts/samples/build-teleop-records.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const SAMPLES = join(ROOT, "src/lib/samples/samples.json");
const CLIPS = join(ROOT, "public/samples/clips");
const POSTERS = join(ROOT, "public/samples/posters");
const DRY = process.argv.includes("--dry");

/** Titles as `categories.ts` already writes them for the header reel. */
const TITLE = "Pick and place into the bin";

function probe(file) {
  const out = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration:stream=width,height,r_frame_rate",
      "-of", "json",
      file,
    ],
    { encoding: "utf8" },
  );
  const j = JSON.parse(out);
  const v = j.streams?.find((s) => s.width);
  const [num, den] = (v?.r_frame_rate ?? "30/1").split("/").map(Number);
  return {
    durationSec: Math.round(Number(j.format?.duration ?? 0)),
    width: v?.width ?? 640,
    height: v?.height ?? 480,
    fps: den ? Math.round(num / den) : 30,
  };
}

const records = [];
for (let i = 0; i < 11; i++) {
  const slug = `teleop-ep${String(i).padStart(2, "0")}`;
  const clip = join(CLIPS, `${slug}.mp4`);
  const poster = join(POSTERS, `${slug}.jpg`);
  if (!existsSync(clip) || !existsSync(poster)) continue;

  const m = probe(clip);
  // ep00 is the one with a staged left/right pair beside the head view.
  const pair = existsSync(join(CLIPS, `${slug}-right.mp4`));

  records.push({
    slug,
    domain: "robotics",
    modality: "teleoperation",
    tier: "umi",
    provenance: "custom",
    title: `Episode ${i} · ${TITLE.toLowerCase()}`,
    label: TITLE,
    environment: "Lab, table-top",
    locale: "Hanoi, Vietnam",
    // Not the follower arm's model name. See the note at the top of this file.
    rig: "Bimanual teleoperation rig, three synced cameras",
    viewpoint: "third-person",
    skillGroup: "Pick and Place / Object Handling",
    industry: null,
    job: null,
    telemetry: true,
    durationSec: m.durationSec,
    resolution: `${m.width}x${m.height}`,
    fps: m.fps,
    streams: ["rgb head", "rgb left", "rgb right", "joint state", "joint action"],
    formats: ["mp4", "lerobot"],
    size: "1.2 GB across the set",
    spec: [
      ["Task", TITLE],
      ["Episode", `${i} of 11`],
      ["Cameras", `Three synchronised ${m.width}x${m.height} views — head, left, right`],
      ["Arms", "Seven degrees of freedom per arm, plus a gripper each"],
      ["On every frame", "Joint state and action, 16-dimensional"],
      ["Frame rate", `${m.fps} fps`],
      ["Set totals", "11 episodes · 14,076 frames · 7 min 49 s"],
      ["Ships as", "LeRobotDataset v2.1 with a GR00T-compatible modality map"],
      ...(pair ? [["Preview", "Head view here; left and right wrist views ship with the episode"]] : []),
    ],
    breadcrumb: ["Samples", "Teleoperation", TITLE],
    preview: `/samples/clips/${slug}.mp4`,
    pills: [
      { t: TITLE, k: "skill" },
      { t: `${m.width}x${m.height}`, k: "device" },
      { t: "Joint state", k: "quality" },
    ],
    downloads: [{ t: "Preview pack", primary: true }],
  });
}

console.log(`teleoperation records: ${records.length}`);
for (const r of records) console.log(`  ${r.slug}  ${r.durationSec}s  ${r.resolution}`);
if (DRY) process.exit(0);

const all = JSON.parse(readFileSync(SAMPLES, "utf8"));
const kept = all.filter((s) => s.modality !== "teleoperation");
writeFileSync(SAMPLES, JSON.stringify([...kept, ...records], null, 2) + "\n");
console.log(`\nwrote ${kept.length} kept + ${records.length} teleoperation → samples.json`);
