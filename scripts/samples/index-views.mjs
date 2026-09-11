/**
 * Which published records have more than one view staged on disk.
 *
 * Was `index-stereo.mjs`, which asked one question — is there a right eye —
 * and answered it with a flat list of slugs. The six-camera delivery needs a
 * different answer: WHICH lenses are staged, because the card lays them out as
 * the rig is worn and a missing one has to leave its own hole rather than
 * shuffle the other five along.
 *
 * The card cannot work this out for itself. It is a client component, so it
 * cannot stat the filesystem, and probing 135 x 6 URLs to see which 404 is
 * eight hundred requests to learn something the build already knows. So the
 * build writes it down, once, here.
 *
 * ## The convention
 *
 *     public/samples/clips/<slug>.mp4          the base view, always
 *     public/samples/clips/<slug>-<view>.mp4   every other view
 *     public/samples/posters/<slug>-<view>.jpg its poster
 *
 * `-right` is the pair's second eye and predates this file: `teleop-ep00-left`
 * / `-right` are the two arm cameras of the teleoperation episode, read by
 * `TeleopSet`. One naming rule for "a second view of the same capture" is
 * worth more than a rule that distinguishes an eye from an arm — the pairing
 * is stated in the caption, not in the filename.
 *
 * The six-camera set names its lenses instead, because four of them are
 * neither left nor right of anything on their own: `-primary-right`,
 * `-mid-left`, `-mid-right`, `-outer-left`, `-outer-right`, with the primary
 * left eye as the base file.
 *
 * ## Output
 *
 *     { "<slug>": ["<view>", ...] }
 *
 * View names only — no suffixes, no CSS. `SampleCatalog` owns where a lens
 * sits on the card; a generated file that carried grid placement would put the
 * layout somewhere nobody edits it.
 *
 * An empty object is not a bug. It is what this wrote for as long as the 118
 * `.mcap` deliveries were cut with camera0 only.
 *
 *     node scripts/samples/index-views.mjs
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const CLIPS = join(ROOT, "public", "samples", "clips");
const POSTERS = join(ROOT, "public", "samples", "posters");
const OUT = join(ROOT, "src", "lib", "samples", "views.json");

/**
 * Every extra view the catalogue knows how to draw, in the order the card
 * reads them. Anything staged under a name not on this list is ignored rather
 * than rendered somewhere arbitrary.
 */
const VIEWS = [
  "right",
  "primary-right",
  "mid-left",
  "mid-right",
  "outer-left",
  "outer-right",
  /* The kit delivery's three body-worn cameras. Numbered rather than named
     left and right: the delivery states no role for any of them — every
     `.calib.json` says `role: "gopro_N"` and stops — so the base view is the
     head camera, read off the footage, and these two are the wrists in the
     order they were recorded. Inventing "wrist-left" would be a claim about
     which arm, which nothing in the delivery supports. */
  "view-2",
  "view-3",
  /* The depth camera's second stream. Staged and served since the RGB-D record
     landed, and invisible until it was named here — the card played the colour
     feed alone, which is a mono card on the configuration whose whole point is
     the depth. */
  "depth",
];

const samples = JSON.parse(
  readFileSync(join(ROOT, "src", "lib", "samples", "samples.json"), "utf8"),
);

const index = {};
const missingPoster = [];

for (const s of samples) {
  /* `-right` means the second eye of a pair, and it means that only where
     there is no `-left` beside it. `teleop-ep00` stages three files — the head
     view as the base, plus `-left` and `-right` for the two ARM cameras, which
     `TeleopSet` reads and labels for itself. Indexing that record as a pair
     would put the head view and one arm side by side on the card under
     "left eye / right eye", which is three wrong things at once. */
  if (existsSync(join(CLIPS, `${s.slug}-left.mp4`))) continue;

  const staged = VIEWS.filter((v) => existsSync(join(CLIPS, `${s.slug}-${v}.mp4`)));
  if (staged.length === 0) continue;
  index[s.slug] = staged;

  /* A view with no poster shows a black rectangle beside its neighbours until
     the file buffers, which reads as a broken tile rather than a loading one.
     Worth failing loudly at build rather than quietly on the page. */
  for (const v of staged) {
    if (!existsSync(join(POSTERS, `${s.slug}-${v}.jpg`))) missingPoster.push(`${s.slug}-${v}`);
  }
}

const ordered = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(OUT, `${JSON.stringify(ordered, null, 2)}\n`);

const multi = Object.values(ordered);
console.log(`records            ${samples.length}`);
console.log(`with extra views   ${multi.length}`);
console.log(`  two-up           ${multi.filter((v) => v.length === 1).length}`);
// Three body-worn cameras: a head view plus two wrists.
console.log(`  three-up         ${multi.filter((v) => v.length === 2).length}`);
// Four extras, not five, on a task the delivery is a lens short of. The card
// draws the rig with a hole in it; this line has to count it as a rig.
console.log(`  six-up           ${multi.filter((v) => v.length >= 4).length}`);
console.log(`wrote              ${OUT.replace(`${ROOT}/`, "")}`);

if (missingPoster.length) {
  console.warn(`\nmissing poster for ${missingPoster.length}:`);
  for (const slug of missingPoster) console.warn(`  ${slug}`);
  process.exitCode = 1;
}
