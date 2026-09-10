/**
 * Which published records have BOTH eyes on disk.
 *
 * Every egocentric record is a stereo pair in the delivery and was previewed on
 * the catalogue as one video — the left eye, with a caption saying so. Tam,
 * 2026-09-10: "cái danh sách này để thành 2 cam với nhau trái phải đều là cam
 * front nhé, đừng để 1 vid". A page selling stereo has to show stereo.
 *
 * The card cannot work this out for itself. It is a client component, so it
 * cannot stat the filesystem, and probing 118 URLs to see which 404 is 118
 * requests to learn something the build already knows. So the build writes it
 * down, once, here.
 *
 * ## The convention
 *
 *     public/samples/clips/<slug>.mp4         left eye  (already staged)
 *     public/samples/clips/<slug>-right.mp4   right eye (this looks for it)
 *     public/samples/posters/<slug>-right.jpg poster for the right eye
 *
 * `-right` rather than `-r` or `_right` because the suffix is already in use
 * and already staged: `teleop-ep00-left.mp4` / `teleop-ep00-right.mp4` are the
 * two arm cameras of the teleoperation episode, read by `TeleopSet`. One naming
 * rule for "a second view of the same capture" is worth more than a rule that
 * distinguishes an eye from an arm — the pairing is stated in the caption, not
 * in the filename.
 *
 * ## Why the index can be empty and that is not a bug
 *
 * It is empty today. The 118 clips were cut from their `.mcap` deliveries with
 * only camera0 extracted, and the deliveries are not in this repo — so there is
 * no right eye to index until they are re-cut. The catalogue falls back to the
 * single view per card, exactly as before, and lights up per record as its
 * second file lands. Nothing here needs changing when it does; re-run this.
 *
 *     node scripts/samples/index-stereo.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLIPS = join(ROOT, "public", "samples", "clips");
const POSTERS = join(ROOT, "public", "samples", "posters");
const OUT = join(ROOT, "src", "lib", "samples", "stereo.json");

const samples = JSON.parse(readFileSync(join(ROOT, "src", "lib", "samples", "samples.json"), "utf8"));

const paired = [];
const missingPoster = [];

for (const s of samples) {
  if (!existsSync(join(CLIPS, `${s.slug}-right.mp4`))) continue;
  paired.push(s.slug);
  // A pair with no second poster shows one still and one black rectangle until
  // the file buffers, which reads as a broken tile rather than as a loading
  // one. Worth failing loudly at build rather than quietly on the page.
  if (!existsSync(join(POSTERS, `${s.slug}-right.jpg`))) missingPoster.push(s.slug);
}

paired.sort();
writeFileSync(OUT, `${JSON.stringify(paired, null, 2)}\n`);

console.log(`records            ${samples.length}`);
console.log(`with both eyes     ${paired.length}`);
console.log(`wrote              ${OUT.replace(`${ROOT}/`, "")}`);

if (missingPoster.length) {
  console.warn(`\nmissing right-eye poster for ${missingPoster.length}:`);
  for (const slug of missingPoster) console.warn(`  ${slug}`);
  process.exitCode = 1;
}
