/**
 * Cut the poster and the 8-second web preview for every file in the Drive
 * manifest, without downloading the deliveries.
 *
 * `ingest-drive.mjs` measures; this one takes pixels. Both read the same Drive
 * URLs through range requests, so an 8-second cut out of the middle of a 3.6 GB
 * 4K .MOV transfers the few megabytes that span those frames and stops. Putting
 * `-ss` BEFORE `-i` is what makes that true: after `-i` ffmpeg decodes from zero
 * and pulls the whole file to reach the same frame.
 *
 * Output matches what the catalogue already ships — an 8-second clip and a
 * matching still, keyed by slug in `public/samples/` — with one deliberate
 * difference. The existing library is 4:3 because it comes off a stereo head
 * rig; this delivery is 16:9 phone and GoPro footage, and letterboxing it into
 * 640x480 to match a convention would throw away the width that is the whole
 * point of an exocentric frame.
 *
 * Usage:
 *   node scripts/samples/cut-drive-previews.mjs [--set exo|sixcam|handpose]
 *                                               [--limit N] [--only <slug>] [--force]
 */
import { readFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { execFile } from "node:child_process";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { exoFiles } from "./exo-slugs.mjs";
import { sixcamViews } from "./sixcam-slugs.mjs";

const run = promisify(execFile);

const ROOT = resolve(import.meta.dirname, "../..");
const CLIPS = join(ROOT, "public/samples/clips");
const POSTERS = join(ROOT, "public/samples/posters");

const args = process.argv.slice(2);
const LIMIT = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : Infinity;
const ONLY = args.includes("--only") ? args[args.indexOf("--only") + 1] : null;
const FORCE = args.includes("--force");
const SET = args.includes("--set") ? args[args.indexOf("--set") + 1] : "exo";

/**
 * The three deliveries this cutter serves, and the frame each one gets.
 *
 * Exo is 854x480 because it is 16:9 phone and GoPro footage and letterboxing
 * it into the library's 4:3 would throw away the width that is the whole point
 * of an exocentric frame. The two head-rig deliveries go the other way: they
 * sit in the SAME grid as the 118 stereo cards, which are 4:3, and they arrive
 * at four different source shapes (1920x1080, 1600x1300, 1280x1040, 1280x720).
 * One frame for the set beats four, and 4:3 is the one the neighbours use.
 *
 * The six-camera cells are cut smaller because six of them share the width two
 * eyes get: a cell is drawn around 225 CSS px on a card spanning two columns
 * of the catalogue grid, so 480 wide is already generous and 640 would be six
 * files of wasted bytes per task.
 */
const SETS = {
  exo: { manifest: "drive-manifest.json", jobs: exoFiles, w: 854, h: 480 },
  sixcam: {
    manifest: "drive-6cam.json",
    jobs: (m) => sixcamViews(m, "sixcam"),
    w: 480,
    h: 360,
  },
  handpose: {
    manifest: "drive-handpose.json",
    jobs: (m) => sixcamViews(m, "handpose"),
    w: 640,
    h: 480,
  },
};

const set = SETS[SET];
if (!set) {
  console.error(`unknown --set ${SET}; expected one of ${Object.keys(SETS).join(", ")}`);
  process.exit(1);
}

const MANIFEST = join(ROOT, "scripts/samples", set.manifest);
const W = set.w;
const H = set.h;
const SECONDS = 8;

async function directUrl(id) {
  const base = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
  const html = await (await fetch(base, { headers: { "user-agent": "Mozilla/5.0" } })).text();
  const uuid = /name="uuid" value="([^"]+)"/.exec(html)?.[1];
  return uuid ? `${base}&confirm=t&uuid=${uuid}` : base;
}

/**
 * Where to cut.
 *
 * Not zero. Route footage opens on the operator starting the recording — a
 * hand on the lens, a doorway, the ground — and a catalogue of thirty tiles all
 * showing the first frame of a walk shows thirty shots of a pavement. A little
 * way in is where the clip is actually about what it is about.
 *
 * Clamped so the cut never runs past the end, including the 2.4-second files in
 * this delivery, which are shorter than the preview they have to fill.
 */
function seekPoint(durationSec) {
  if (!durationSec || durationSec <= SECONDS) return 0;
  return Math.min(durationSec * 0.3, Math.max(0, durationSec - SECONDS - 1), 45);
}

/**
 * `slug` has to survive being a URL, a filename and a JSON key, and it must not
 * carry the operator folder or the camera's own filename: `IMG_2889.MOV` under
 * a person's name says who shot it, which is the thing the ingest step went out
 * of its way not to record.
 */
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

mkdirSync(CLIPS, { recursive: true });
mkdirSync(POSTERS, { recursive: true });

/* Slugs come from the set's own slug module, which its record builder also
   reads. Exo used to derive them in two places and the two disagreed. */
const jobs = set.jobs(manifest).filter((j) => !ONLY || j.slug === ONLY);

/* Four at a time. Nearly all of a job's wall clock is Drive answering range
   requests, so the machine is idle waiting; ffmpeg's own encode of eight
   seconds at 854x480 is a rounding error beside it. Four rather than more
   because this is one shared account's quota, and a crawl that gets throttled
   halfway is slower than one that never does. */
const CONCURRENCY = 4;
let done = 0;
let cursor = 0;

async function worker() {
  for (;;) {
    if (done >= LIMIT) return;
    const job = jobs[cursor++];
    if (!job) return;
    await cut(job);
  }
}

async function cut({ id, file, slug, inverted }) {
  const clip = join(CLIPS, `${slug}.mp4`);
  const poster = join(POSTERS, `${slug}.jpg`);
  if (!FORCE && existsSync(clip) && existsSync(poster)) {
    console.log(`  hit  ${slug}`);
    return;
  }

  const ss = seekPoint(file.durationSec).toFixed(2);
  try {
    const url = await directUrl(id);

    await run("ffmpeg", [
      "-y", "-v", "error",
      "-ss", ss, "-i", url,
      "-t", String(SECONDS),
      "-an",
      /* 180° where the delivery was recorded upside down — see `INVERTED` in
         sixcam-slugs.mjs. First in the chain because it is a correction to the
         source rather than part of the framing; `crop` centres either way. */
      "-vf",
      `${inverted ? "hflip,vflip," : ""}scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}`,
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
      "-movflags", "+faststart",
      clip,
    ]);

    /* The still comes out of the clip that was just written, not out of Drive.
       Cutting it from the source meant a second seek across the network for one
       frame — the same expensive range walk as the clip itself, for 90 KB — and
       it doubled the wall clock of the whole pass. The clip is already the right
       crop and scale, so the frame is a local decode of eight seconds of video.

       Half a second in rather than frame zero: an h264 clip opens on a keyframe,
       and the very first frame of a fast-scaled encode is the softest one in it. */
    await run("ffmpeg", [
      "-y", "-v", "error",
      "-ss", "0.5", "-i", clip,
      "-frames:v", "1",
      "-q:v", "4",
      poster,
    ]);

    done++;
    console.log(
      `  ok   ${slug}  @${ss}s  clip ${(statSync(clip).size / 1024).toFixed(0)}KB  ` +
        `poster ${(statSync(poster).size / 1024).toFixed(0)}KB`
    );
  } catch (err) {
    console.log(`  FAIL ${slug}  ${String(err.message ?? err).split("\n").pop()}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`\n${done} previews cut into public/samples/`);
