/**
 * Apply the publication rules to `samples.json` itself, not just to the render.
 *
 * WHY THIS EXISTS
 *
 * `redact.mjs` is a render-layer filter: `publicSpec()` drops the locating rows
 * and masks the session handle out of `File`, and the record modal and the card
 * face both go through it. That is sound as far as it goes, and the check it
 * was signed off with — fetch every route, grep the HTML — passes.
 *
 * It cannot see the JavaScript payload. `samples.json` is imported by three
 * CLIENT components (`HeroSamples`, `SampleCatalog`, `CategoryHeader`), so the
 * whole file is bundled and served to every visitor. Measured on a production
 * build before this script existed:
 *
 *     740  internal rig names
 *     472  raw `capture__<date>_<time>__<hash>` session handles
 *     118  Site, Geohash, NAICS, Environment id, Device, Device id, Kit,
 *          Episode uuid — each
 *      68  Business, including trading name and commune
 *
 * All of it in `.next/static`, readable from DevTools. No render-layer rule can
 * reach a bundle, so the values have to leave the data.
 *
 * WHAT IT DOES
 *
 * Runs every record's `spec` through `publicSpec()` — the same function the
 * page calls — and writes the result back. The data then carries exactly what
 * the page is allowed to print, and the two cannot drift: adding a label to
 * `DROPPED_LABELS` and re-running is the whole procedure.
 *
 * `redact.mjs` stays in the render path as defence in depth, for fields that
 * arrive after this has run.
 *
 * Idempotent. Run it after any regeneration of `samples.json`.
 *
 *     node scripts/samples/redact-data.mjs [--check]
 *
 * `--check` exits non-zero if anything would change, for CI.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { publicSpec } from "../../src/lib/samples/redact.mjs";

const PATH = "src/lib/samples/samples.json";
const check = process.argv.includes("--check");

const before = readFileSync(PATH, "utf8");
const records = JSON.parse(before);

let dropped = 0;
let masked = 0;

for (const record of records) {
  if (!Array.isArray(record.spec)) continue;
  const clean = publicSpec(record.spec);
  dropped += record.spec.length - clean.length;
  masked += clean.filter((row, i) => row[1] !== record.spec[i]?.[1]).length;
  record.spec = clean;
}

const after = JSON.stringify(records, null, 2) + "\n";

if (check) {
  if (after !== before) {
    console.error(`redact-data: ${dropped} row(s) still publishable that should not be. Run without --check.`);
    process.exit(1);
  }
  console.log("redact-data: clean");
  process.exit(0);
}

writeFileSync(PATH, after);
console.log(`redact-data: dropped ${dropped} locating rows, masked ${masked} values, across ${records.length} records`);
