/**
 * Re-encode the preview clips that are far heavier than their own dimensions
 * justify.
 *
 * These are eight-second, muted, decorative previews at 640x480 or smaller, and
 * a third of them were shipped at broadcast bitrates — `vegetable-weeding.mp4`
 * is 576x432 at 6.0 Mbps, roughly ten times what that frame needs. Fifty-one
 * files over 1 MB carried 86 MB of the library's 181 MB.
 *
 * Nothing is resized and nothing is retimed: same frames, same duration, same
 * aspect. Only the bitrate changes, and only for files that are over budget.
 * A clip already under the threshold is left byte-for-byte alone, because
 * re-encoding an acceptable file is a generation of quality lost for nothing.
 *
 * Usage:
 *   node scripts/samples/shrink-clips.mjs [--dry] [--max-kb 500] [--crf 30]
 */
import { readdirSync, statSync, renameSync, unlinkSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";
import { join, resolve } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

const ROOT = resolve(import.meta.dirname, "../..");
const CLIPS = join(ROOT, "public/samples/clips");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const MAX_KB = args.includes("--max-kb") ? Number(args[args.indexOf("--max-kb") + 1]) : 500;
const CRF = args.includes("--crf") ? Number(args[args.indexOf("--crf") + 1]) : 30;

/* Four at a time. This is pure local CPU, unlike the Drive passes, so the limit
   is cores rather than someone else's quota. */
const CONCURRENCY = 4;

const over = readdirSync(CLIPS)
  .filter((f) => f.endsWith(".mp4"))
  .map((name) => ({ name, bytes: statSync(join(CLIPS, name)).size }))
  .filter((f) => f.bytes > MAX_KB * 1024)
  .sort((a, b) => b.bytes - a.bytes);

const totalBefore = over.reduce((a, f) => a + f.bytes, 0);
console.log(
  `${over.length} clips over ${MAX_KB} KB, ${(totalBefore / 1048576).toFixed(1)} MB between them`
);

if (DRY) {
  for (const f of over.slice(0, 12)) {
    console.log(`  ${(f.bytes / 1024).toFixed(0).padStart(5)}KB  ${f.name}`);
  }
  process.exit(0);
}

let saved = 0;
let cursor = 0;
let doneCount = 0;

async function worker() {
  for (;;) {
    const f = over[cursor++];
    if (!f) return;
    await shrink(f);
  }
}

async function shrink({ name, bytes }) {
  const src = join(CLIPS, name);
  const tmp = join(CLIPS, `.${name}.shrink.mp4`);
  try {
    await run("ffmpeg", [
      "-y", "-v", "error",
      "-i", src,
      // Muted decoration: the audio track, where one survived, was paying for
      // something no visitor ever hears.
      "-an",
      "-c:v", "libx264",
      "-crf", String(CRF),
      // `slow` rather than `veryfast`: this runs once, offline, and buys
      // roughly a third off the same CRF.
      "-preset", "slow",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      tmp,
    ]);

    const after = statSync(tmp).size;
    // A re-encode that came out bigger means the source was already efficient
    // and the only thing achieved would be a lost generation.
    if (after >= bytes) {
      unlinkSync(tmp);
      console.log(`  keep ${name}  (re-encode was not smaller)`);
      return;
    }

    renameSync(tmp, src);
    saved += bytes - after;
    doneCount++;
    console.log(
      `  ok   ${name}  ${(bytes / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB ` +
        `(-${(100 - (after / bytes) * 100).toFixed(0)}%)`
    );
  } catch (err) {
    if (existsSync(tmp)) unlinkSync(tmp);
    console.log(`  FAIL ${name}  ${String(err.message ?? err).split("\n").pop()}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(
  `\n${doneCount} clips re-encoded, ${(saved / 1048576).toFixed(1)} MB saved ` +
    `(library was ${(totalBefore / 1048576).toFixed(1)} MB in these files)`
);
