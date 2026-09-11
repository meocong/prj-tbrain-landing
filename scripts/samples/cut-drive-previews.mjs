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
import { kitViews } from "./kit-slugs.mjs";

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
 * Cut from a local directory instead of from Drive.
 *
 * A share link is not the only way to hold a delivery, and for the kit set it
 * stopped being a way at all — see the note on `SETS.kit`. With `--from`, a job
 * looks for `<dir>/<slug>.mp4` first and only falls back to the network if it
 * is not there, so a partial folder is useful: drop in the six files you have
 * and the rest still try the link.
 *
 * `<slug>.mp4` rather than the delivery's own tree, because the tree is four
 * levels of Vietnamese task names and the slug is the one string the cutter,
 * the record builder and the page already agree on.
 */
const FROM = args.includes("--from") ? resolve(args[args.indexOf("--from") + 1]) : null;
/**
 * Cut from this second instead of from `seekPoint`.
 *
 * The heuristic picks 30% in, which is a good guess about footage and only a
 * guess. Some episodes spend their first minute walking to the bench: the
 * fabric-marking session shows the room until about 80 s and the hands after
 * it, so 30% of 140 s lands on a wall. Rather than tune the formula until it
 * fits one delivery, this says "I looked at the clip, cut here".
 *
 * Pair it with `--only` — it applies to every job in the run, and one timecode
 * is rarely right for two different recordings.
 */
const AT = args.includes("--at") ? Number(args[args.indexOf("--at") + 1]) : null;

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
  /**
   * The kit delivery: one head camera, three body-worn, or colour and depth.
   *
   * 4:3 like the other head-rig sets, because these cards sit in the same grid
   * as the 118 stereo ones. 640x480 rather than the six-camera set's 480x360:
   * this one lays out at most three cells across a card, so each gets roughly
   * twice the width six do.
   *
   * KNOWN: this set cannot be cut off the share link as it stands.
   *
   * The folder's quota is spent, and Drive serves its "Quota exceeded" page
   * with a 200 and `content-type: video/mp4` — so ffmpeg reads ~2 KB of markup
   * and reports "Invalid data found when processing input", which looks like a
   * corrupt delivery and is not. Verified against one file, all four ways in:
   * no Range header, `bytes=0-`, and two bounded ranges. All blocked. There is
   * no ranged-read loophole; an earlier pass that found nine of eighteen files
   * readable was measuring a rolling limit that tightened as it was polled.
   *
   * Small files are unaffected — the JSON sidecars and the packaged
   * `preview_*.jpg` stills still fetch, which is how eight of the eleven
   * posters were produced without touching a video.
   *
   * Unblock by giving the crawl a source that is not the shared link: copy the
   * folder into an account we own, or stage the files locally. Waiting also
   * works; the cap is a daily one.
   */
  kit: {
    manifest: "kit-sessions.json",
    jobs: kitViews,
    w: 640,
    h: 480,
    concurrency: 1,
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

/** Seconds, off a file on disk. Local, so it costs nothing and cannot be stale. */
async function probeDuration(path) {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "csv=p=0",
    path,
  ]);
  const n = Number(stdout.trim());
  return Number.isFinite(n) ? n : 0;
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
/* Per set, because four is not always the right number. `kit` asks for one:
   four workers against that folder tripped Drive's rate limiting on the first
   pass and every job in the batch failed, where a sequential run of the same
   jobs had been getting through. Reading from `--from` is local I/O and is not
   rate limited by anybody, so it keeps the default. */
const CONCURRENCY = FROM ? 4 : (set.concurrency ?? 4);
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

  try {
    /* A staged copy wins over the link. Same bytes, no quota, no confirm-token
       dance — and for a delivery whose share link is capped it is the only way
       through. */
    const local = FROM ? join(FROM, `${slug}.mp4`) : null;
    const fromDisk = Boolean(local && existsSync(local));
    const url = fromDisk ? local : await directUrl(id);

    /* Measure a staged file rather than trusting the manifest.
       `durationSec` on the job is the REPRESENTATIVE session's length — the
       longest episode in the bucket — and a staged file is whichever episode
       of that bucket someone happened to download. The two are not the same
       recording: the three staged wrist views run 26.7 s where their bucket's
       representative runs 125.6 s, so the seek landed at 37.7 s, past the end,
       and all three cuts failed with nothing to decode. Probing the file on
       disk is instant and free, so there is no reason to guess. */
    const seconds = fromDisk ? await probeDuration(local) : file.durationSec;
    const ss = (AT != null ? Math.min(AT, Math.max(0, seconds - SECONDS)) : seekPoint(seconds)).toFixed(2);

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
