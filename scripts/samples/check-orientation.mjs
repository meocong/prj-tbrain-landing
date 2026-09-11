/**
 * Which freshly cut clips came out upside down.
 *
 * Some rig builds mount the camera block inverted, so the delivery itself is
 * rotated 180° — floor at the top, lettering backwards. It is not a container
 * flag: `ffprobe` finds no `rotate` tag and no display matrix on these files,
 * and ffmpeg autorotates when there is one. The frames are simply upside down,
 * and there is nothing in the file to ask.
 *
 * The six-camera set answered this by eye, with a hand-written `INVERTED` list
 * in `sixcam-slugs.mjs`. That does not scale to 110 stereo records, and it does
 * not need to: for those there is already a right answer on disk. The clip the
 * catalogue publishes today is the same camera, the same session, seconds away.
 * So the question is not "is this upright" — it is "does this match what we
 * already ship", which is decidable.
 *
 * Both clips are sampled across their whole eight seconds and correlated at
 * 96x72 grayscale, in both orientations. One poster against one poster is two
 * moments seconds apart and calls it wrong often — the first pass at 32x24 on
 * single frames produced eighteen "inverted" records of which ten were real.
 * Many frames against many frames gives the match a chance to find the same
 * instant, and the best pair decides.
 *
 * A verdict of STILL UNSURE means the frame is close to symmetric under 180°
 * at this scale — a bench top filling the view. Those are worth a human
 * glance; there were three, and all three were already the right way up.
 *
 * Usage:
 *   node scripts/samples/check-orientation.mjs <new-dir> <slug>...
 *
 * `<new-dir>` holds the fresh cuts as `<slug>.mp4`; the published clip is read
 * from `public/samples/clips`. Prints a `flipList=[...]` ready to feed back to
 * `cut-r2-stereo.py` under `FLIP=1`.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const PUBLISHED = join(ROOT, "public/samples/clips");

const [NEW, ...slugs] = process.argv.slice(2);
if (!NEW || slugs.length === 0) {
  console.error("usage: node scripts/samples/check-orientation.mjs <new-dir> <slug>...");
  process.exit(1);
}

const W = 96;
const H = 72;
const CELL = W * H;

/** Three frames a second, grayscale, optionally turned over. */
function frames(file, flip) {
  const buf = execFileSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-vf",
     `${flip ? "hflip,vflip," : ""}fps=3,scale=${W}:${H},format=gray`,
     "-f", "rawvideo", "-"],
    { maxBuffer: 1 << 24 },
  );
  const out = [];
  for (let i = 0; i + CELL <= buf.length; i += CELL) out.push(buf.subarray(i, i + CELL));
  return out;
}

/** Pearson correlation. Mean-centred, so a brightness shift between two
    encodes of the same scene does not read as a difference in content. */
function corr(a, b) {
  const n = a.length;
  let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let num = 0, da = 0, db = 0;
  for (let i = 0; i < n; i++) {
    const x = a[i] - ma, y = b[i] - mb;
    num += x * y; da += x * x; db += y * y;
  }
  return num / (Math.sqrt(da * db) || 1);
}

const best = (refs, tests) => Math.max(...refs.flatMap((r) => tests.map((t) => corr(r, t))));

/** Below this the two orientations are indistinguishable and a human looks. */
const MARGIN = 0.03;

const flip = [];
for (const slug of slugs) {
  const ref = join(PUBLISHED, `${slug}.mp4`);
  const cut = join(NEW, `${slug}.mp4`);
  if (!existsSync(ref) || !existsSync(cut)) {
    console.log(`${slug.padEnd(24)} — missing ${existsSync(ref) ? "cut" : "published clip"}`);
    continue;
  }
  const refs = frames(ref, false);
  const up = best(refs, frames(cut, false));
  const dn = best(refs, frames(cut, true));
  const verdict = dn > up + MARGIN ? "FLIP" : up > dn + MARGIN ? "keep" : "STILL UNSURE";
  if (verdict === "FLIP") flip.push(slug);
  console.log(
    `${slug.padEnd(24)} refs=${refs.length}  up=${up.toFixed(3)}  flipped=${dn.toFixed(3)}  -> ${verdict}`,
  );
}

console.log(`\nflipList=${JSON.stringify(flip)}`);
