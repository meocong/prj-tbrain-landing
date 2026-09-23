/**
 * Prove that no locator from the approved set reached anything the site ships.
 *
 * `ingest-approved.py` writes an allow-list of rows, so this should never fire.
 * It exists because "should never" is a claim and the page's anonymity promise
 * rests on it: the set's `metadata.json` carries a geohash, a business id, an
 * operator id, device and kit ids, an episode uuid, a NAICS code and a city for
 * every clip, and any one of them in `samples.json` ships in the client bundle.
 *
 * Collects every such VALUE from the source metadata — not a pattern, the actual
 * strings — and searches every file under `src/lib/samples/` and
 * `public/samples/telemetry/` for it. A pattern check would miss a value that
 * happens not to look like its neighbours; the values themselves cannot.
 *
 * Usage: node scripts/samples/check-approved-leaks.mjs [--src DIR]
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { homedir } from "node:os";

const ROOT = resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const SRC = args.includes("--src")
  ? args[args.indexOf("--src") + 1]
  : join(homedir(), ".cache/tbrain-samples/approved");

const EGO = join(SRC, "Egocentric Human Data Samples");
const needles = new Map(); // value -> field it came from

function add(value, field) {
  if (value == null) return;
  const v = String(value).trim();
  // Short values ("Hanoi" is five letters) are still locators; single words
  // below four characters are too generic to search for without noise.
  if (v.length < 4) return;
  needles.set(v, field);
}

for (const d of readdirSync(EGO)) {
  const p = join(EGO, d, "metadata.json");
  if (!existsSync(p)) continue;
  const m = JSON.parse(readFileSync(p, "utf8"));
  add(m.place?.location, "geohash");
  add(m.place?.city, "city");
  add(m.place?.state_province, "province");
  add(m.other?.business_id, "business_id");
  add(m.operator?.["operator-id"], "operator-id");
  add(m.device?.device_id, "device_id");
  add(m.device?.device_kit_id, "kit_id");
  add(m.identity?.["episode-uuid"], "episode-uuid");
  add(m.environment?.["environment-id"], "environment-id");
  add(m.environment?.naics_primary_code, "naics");
  add(m.device?.device_type, "rig name");
  add(m.device?.device_generation, "rig name");
  // The folder hash is the capture handle the delivery is filed under.
  add(d.split("__")[1], "folder hash");
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(json|ts|tsx|mjs)$/.test(f)) out.push(p);
  }
  return out;
}

const targets = [...walk(join(ROOT, "src/lib/samples")), ...walk(join(ROOT, "public/samples/telemetry"))];
const hits = [];
for (const file of targets) {
  const text = readFileSync(file, "utf8");
  for (const [v, field] of needles) {
    if (text.includes(v)) hits.push({ file: file.replace(ROOT + "/", ""), field, value: v });
  }
}

console.log(`checked ${needles.size} identifying values from ${EGO.replace(homedir(), "~")}`);
console.log(`against ${targets.length} files`);
if (hits.length) {
  const grouped = {};
  for (const h of hits) (grouped[`${h.field} in ${h.file}`] ??= []).push(h.value);
  for (const [k, vs] of Object.entries(grouped)) console.log(`  LEAK ${k}: ${vs.slice(0, 5).join(", ")}${vs.length > 5 ? ` (+${vs.length - 5})` : ""}`);
  process.exit(1);
}
console.log("no leaks");
