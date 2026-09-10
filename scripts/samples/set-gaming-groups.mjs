/**
 * Give the gaming records the axis every other category already has.
 *
 * All eight carried `skillGroup: null`, which is why they had no folder view:
 * `skillFolders` reads that field, found nothing, and the category fell back to
 * a flat grid while egocentric and exocentric got folders. The records were not
 * missing the information — every one of them states what the session exercises
 * in its own title, "Off-road vehicle control", "Firefight and looting run" —
 * it just was not in a field anything could group by.
 *
 * Grouped by what the gameplay demands of a policy, not by publisher or genre
 * label. A buyer training a driving model wants SnowRunner and BeamNG together
 * whatever their marketing genres are, and does not want Dragon's Dogma in the
 * same folder because both happen to be third-person.
 *
 * Written as a script rather than edited into samples.json by hand so the
 * mapping is reviewable and re-runnable. Idempotent.
 *
 * Usage:
 *   node scripts/samples/set-gaming-groups.mjs [--dry]
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const SAMPLES = join(ROOT, "src/lib/samples/samples.json");
const DRY = process.argv.includes("--dry");

/**
 * Slug → group.
 *
 * Keyed by slug rather than by the `Title` spec row because the title is
 * display copy and a rename would silently drop a record out of its folder.
 */
const GROUPS = {
  // Wheels on terrain: throttle, steering and recovery from a physics engine
  // that models the surface. The thing a driving policy is actually learning.
  snowrunner: "Vehicle Control & Driving",
  beamng: "Vehicle Control & Driving",

  // Aim, target selection and engagement under threat.
  borderlands2: "Combat & Engagement",
  mhw: "Combat & Engagement",
  "dragons-dogma-2": "Combat & Engagement",

  // Getting somewhere across open terrain, on foot and by vehicle, without a
  // fight being the point.
  justcause3: "Traversal & Open World",

  // A route through a world where the interaction is choosing and talking
  // rather than shooting or steering.
  outerworlds: "Exploration & Dialogue",

  // Two agents, one clock, frame-aligned. The only multi-agent record in the
  // set and the only one whose value is the second viewport, so it is its own
  // folder however small that folder is — see the note on `usesFolders`.
  "gtav-coop-host": "Multi-agent & Co-op",
};

const all = JSON.parse(readFileSync(SAMPLES, "utf8"));
let changed = 0;
const missing = [];

for (const s of all) {
  if (s.modality !== "gaming") continue;
  const group = GROUPS[s.slug];
  if (!group) {
    missing.push(s.slug);
    continue;
  }
  if (s.skillGroup !== group) {
    s.skillGroup = group;
    changed++;
  }
}

const counts = {};
for (const s of all) {
  if (s.modality === "gaming" && s.skillGroup) {
    counts[s.skillGroup] = (counts[s.skillGroup] ?? 0) + 1;
  }
}

for (const [g, n] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(2)}  ${g}`);
}
if (missing.length) console.log(`  UNMAPPED: ${missing.join(", ")}`);

if (DRY) process.exit(0);
writeFileSync(SAMPLES, JSON.stringify(all, null, 2) + "\n");
console.log(`\n${changed} gaming records updated`);
