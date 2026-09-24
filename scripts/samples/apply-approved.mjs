/**
 * Put the approved set on the page, and take the old one off.
 *
 * Second half of `ingest-approved.py`, which cuts the media and writes
 * `.samples-approved/approved-records.json`. This:
 *
 *   1. drops every record in the replaced modalities (egocentric and
 *      teleoperation by default) from `samples.json` and appends the approved
 *      ones in their place — records of every other modality are kept as is;
 *   2. rebuilds `views.json` for the records that remain;
 *   3. writes `teleop-set.json` (what `TeleopSet` and the teleoperation
 *      category read) and `telemetry/teleop-anatomy.json` (what
 *      `TeleopAnatomy` charts);
 *   4. deletes the clips, posters and telemetry of the records it dropped.
 *
 * Step 4 touches nothing else, and is guarded besides: a retired file whose
 * name still appears in a `.ts`/`.tsx` under `src/` is kept and reported.
 * Everything deleted is tracked in git.
 *
 * Usage:
 *   node scripts/samples/apply-approved.mjs [--replace egocentric,teleoperation] [--keep-tiers mono,wrist] [--dry]
 */
import { readFileSync, writeFileSync, readdirSync, unlinkSync, statSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LIB = join(ROOT, "src/lib/samples");
const PUB = join(ROOT, "public/samples");

const args = process.argv.slice(2);
const DRY = args.includes("--dry");
const REPLACE = new Set(
  (args.includes("--replace") ? args[args.indexOf("--replace") + 1] : "egocentric,teleoperation").split(","),
);

const staged = JSON.parse(readFileSync(join(ROOT, ".samples-approved/approved-records.json"), "utf8"));
const samples = JSON.parse(readFileSync(join(LIB, "samples.json"), "utf8"));
const views = JSON.parse(readFileSync(join(LIB, "views.json"), "utf8"));

/* Tiers inside a replaced modality that the approved set does not cover and
   that keep their earlier samples. Thạch, 2026-09-24: "mono wrist lấy lại sample
   cũ đi" — the approved drop is all stereo captures, so the one-camera and
   wrist-camera configurations still show what they showed before. The
   six-camera captures from the Drive "6 cam" delivery stay for the same reason:
   the approved set delivers four lenses and cannot show six. */
const KEEP_TIERS = new Set(
  (args.includes("--keep-tiers") ? args[args.indexOf("--keep-tiers") + 1] : "mono,wrist,stereo6").split(","),
);

/* Captures taken off the page after review, with the reason. Thạch,
   2026-09-24, on the clips no window could save: "nếu mà có vấn đề thì vứt
   luôn". Applied to the approved set and to the kept tiers alike, and their
   media goes with them. */
const WITHDRAWN = JSON.parse(readFileSync(join(ROOT, "scripts/samples/withdrawn.json"), "utf8"));
const live_ = (r) => !(r.slug in WITHDRAWN);

const incoming = [...staged.ego, ...staged.teleop].map(({ _src, ...r }) => r).filter(live_);
const kept = samples.filter((r) => (!REPLACE.has(r.modality) || KEEP_TIERS.has(r.tier)) && live_(r));
const dropped = samples.filter((r) => REPLACE.has(r.modality));

const clash = incoming.filter((r) => kept.some((k) => k.slug === r.slug));
if (clash.length) {
  console.error(`slug clash with kept records: ${clash.map((r) => r.slug).join(", ")}`);
  process.exit(1);
}

const next = [...incoming, ...kept];

// ── views ────────────────────────────────────────────────────────────────
const nextViews = {};
for (const r of kept) if (views[r.slug]) nextViews[r.slug] = views[r.slug];
for (const [slug, v] of Object.entries(staged.views)) if (v.length && !(slug in WITHDRAWN)) nextViews[slug] = v;
const sortedViews = Object.fromEntries(Object.entries(nextViews).sort(([a], [b]) => a.localeCompare(b)));

// ── orphaned media ──────────────────────────────────────────────────────
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(f)) out.push(p);
  }
  return out;
}
const sourceText = walk(join(ROOT, "src")).map((p) => readFileSync(p, "utf8")).join("\n");

const live = new Set();
for (const r of next) {
  live.add(r.slug);
  for (const v of sortedViews[r.slug] ?? []) live.add(`${r.slug}-${v}`);
}
live.add("teleop-anatomy");

/* Only the replaced records' own media is eligible — never "whatever looks
   unused". Thạch, 2026-09-23: "đừng có xoá lây samples của các bộ khác". A
   clip belonging to exocentric, gaming or mocap stays even if nothing links to
   it today; deciding that is not this script's job.

   Eligible: each dropped record's slug and its staged views, plus the clips of
   the egocentric off-the-shelf strip (`ots-*`), which were never records but
   were the same replaced set. */
const retired = new Set();
for (const r of dropped) {
  retired.add(r.slug);
  for (const v of views[r.slug] ?? []) retired.add(`${r.slug}-${v}`);
}
// Views a player hard-coded rather than staged (`teleop-ep00-left`) are still
// that record's media. `live` is checked first, so a kept record whose slug
// happens to extend a dropped one is never caught by the prefix.
const droppedSlugs = dropped.map((r) => r.slug);
const isRetired = (name) =>
  retired.has(name) ||
  /^ots-[a-z]+-\d+$/.test(name) ||
  droppedSlugs.some((s) => name.startsWith(`${s}-`) && /^(left|right|primary-left|primary-right|mid-left|mid-right|outer-left|outer-right|view-\d|depth)$/.test(name.slice(s.length + 1)));

const doomed = [];
const spared = [];
for (const sub of ["clips", "posters", "telemetry"]) {
  const dir = join(PUB, sub);
  for (const f of readdirSync(dir)) {
    const name = basename(f, extname(f));
    if (live.has(name) || !isRetired(name)) continue;
    if (sourceText.includes(`"${name}"`) || sourceText.includes(`/${name}.`) || sourceText.includes(`\`${name}\``)) {
      spared.push(`${sub}/${f}`);
      continue;
    }
    doomed.push(join(dir, f));
  }
}

// ── report + write ───────────────────────────────────────────────────────
const by = (list) => list.reduce((a, r) => ((a[r.modality] = (a[r.modality] || 0) + 1), a), {});
console.log(`removed records : ${dropped.length}  ${JSON.stringify(by(dropped))}`);
console.log(`added records   : ${incoming.length}  ${JSON.stringify(by(incoming))}`);
console.log(`kept records    : ${kept.length}  ${JSON.stringify(by(kept))}`);
console.log(`samples.json    : ${samples.length} -> ${next.length}`);
console.log(`views.json      : ${Object.keys(views).length} -> ${Object.keys(sortedViews).length}`);
console.log(`media to delete : ${doomed.length} files`);
if (spared.length) console.log(`media spared (still referenced in src/): ${spared.join(", ")}`);

if (DRY) process.exit(0);

writeFileSync(join(LIB, "samples.json"), JSON.stringify(next, null, 2) + "\n"); // 2: redact-data --check compares byte for byte
writeFileSync(join(LIB, "views.json"), JSON.stringify(sortedViews, null, 2) + "\n");
if (staged.teleopSet) writeFileSync(join(LIB, "teleop-set.json"), JSON.stringify(staged.teleopSet, null, 2) + "\n");
if (staged.anatomy) writeFileSync(join(PUB, "telemetry/teleop-anatomy.json"), JSON.stringify(staged.anatomy) + "\n");
for (const p of doomed) unlinkSync(p);
console.log("written.");
