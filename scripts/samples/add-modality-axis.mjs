/**
 * One-shot migration: split `domain` into the two axes it was carrying.
 *
 * `domain` held "robotics" | "game" | "ots", which is not one axis. Off-the-shelf
 * is where a record CAME FROM; robotics is what it IS. Both values sat in one
 * field, so the rail offered "Robotics" and "Off the shelf" as if picking one
 * excluded the other — while 39 of the 39 `ots` records are robotics egocentric
 * stereo, on the same rigs as the 79 tagged `robotics`.
 *
 * After this, three fields, each answering one question:
 *
 *   modality    what it is           egocentric | exocentric | mocap | gaming
 *   tier        how it was captured  stereo | gameplay  (+ mono/6-cam/wrist later)
 *   provenance  where it came from   ots | custom
 *
 * `domain` is deliberately left in place. `/samples/s` groups downloads by it and
 * every analytics event carries it; removing it in the same change as adding the
 * new axis would make a regression in either surface impossible to attribute.
 *
 * Nothing here is inferred beyond what a record already states:
 *
 *   - `tier` is "stereo" for all 118, because every one of them reports
 *     `resolution: "stereo pair"`. NOT "stereo-2cam" — the six-camera rig on
 *     tbrain-dashboard.vercel.app may be the same Robocap that 84 of these
 *     records name, and the camera count is an open question for Sơn. Writing a
 *     number down now is how the wrong one survives.
 *   - `provenance` is null on the 8 game records. The plan says gaming has both
 *     OTS and custom, but no game record says which it is, and a guess here is a
 *     claim on a sales page.
 *
 * Re-runnable: it only writes fields it computes, and computes them from
 * `domain`, which it never changes.
 */
import { readFileSync, writeFileSync } from "node:fs";

const PATH = new URL("../../src/lib/samples/samples.json", import.meta.url);
const rows = JSON.parse(readFileSync(PATH, "utf8"));

const modalityOf = (d) => (d === "game" ? "gaming" : "egocentric");
const tierOf = (d) => (d === "game" ? "gameplay" : "stereo");
const provenanceOf = (d) => (d === "ots" ? "ots" : d === "game" ? null : "custom");

let changed = 0;
for (const r of rows) {
  const next = {
    modality: modalityOf(r.domain),
    tier: tierOf(r.domain),
    provenance: provenanceOf(r.domain),
  };
  if (r.modality !== next.modality || r.tier !== next.tier || r.provenance !== next.provenance) {
    changed += 1;
  }
  Object.assign(r, next);
}

writeFileSync(PATH, `${JSON.stringify(rows, null, 2)}\n`);

const tally = (f) =>
  Object.entries(
    rows.reduce((a, r) => ((a[String(f(r))] = (a[String(f(r))] ?? 0) + 1), a), {}),
  )
    .map(([k, v]) => `${k}=${v}`)
    .join("  ");

console.log(`${rows.length} records, ${changed} changed`);
console.log("modality  ", tally((r) => r.modality));
console.log("tier      ", tally((r) => r.tier));
console.log("provenance", tally((r) => r.provenance));
