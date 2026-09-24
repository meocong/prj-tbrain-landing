/**
 * Take the captures listed in `withdrawn.json` off the page.
 *
 * Thạch, 2026-09-24, on the clips no preview window could save: "nếu mà có vấn
 * đề thì vứt luôn". Each entry carries its reason. `apply-approved.mjs` honours
 * the same list, so a later re-apply does not bring them back; this is the
 * in-place version for when the catalogue is already applied.
 *
 * Removes the records from `samples.json` and `views.json`, and deletes their
 * clip, poster and telemetry files — the slug itself and its staged views,
 * nothing else. Run `stage-packs.mjs` afterwards so `downloads.json` and the
 * full-set archive stop listing them.
 *
 * Usage:
 *   node scripts/samples/withdraw-samples.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync, unlinkSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");
const LIB = join(ROOT, "src/lib/samples");
const PUB = join(ROOT, "public/samples");
const DRY = process.argv.includes("--dry");

const WITHDRAWN = JSON.parse(readFileSync(join(ROOT, "scripts/samples/withdrawn.json"), "utf8"));
const samples = JSON.parse(readFileSync(join(LIB, "samples.json"), "utf8"));
const views = JSON.parse(readFileSync(join(LIB, "views.json"), "utf8"));

const gone = samples.filter((r) => r.slug in WITHDRAWN);
const files = [];
for (const r of gone) {
  const names = [r.slug, ...(views[r.slug] ?? []).map((v) => `${r.slug}-${v}`)];
  for (const n of names)
    for (const p of [`clips/${n}.mp4`, `posters/${n}.jpg`, `telemetry/${n}.json`])
      if (existsSync(join(PUB, p))) files.push(p);
}

for (const r of gone) console.log(`withdraw ${r.slug.padEnd(28)} ${r.tier.padEnd(8)} ${WITHDRAWN[r.slug]}`);
const missing = Object.keys(WITHDRAWN).filter((s) => !samples.some((r) => r.slug === s));
if (missing.length) console.log(`already gone: ${missing.join(", ")}`);
console.log(`samples.json ${samples.length} -> ${samples.length - gone.length}, ${files.length} media files`);
if (DRY) process.exit(0);

const next = samples.filter((r) => !(r.slug in WITHDRAWN));
const nextViews = Object.fromEntries(Object.entries(views).filter(([s]) => !(s in WITHDRAWN)));
writeFileSync(join(LIB, "samples.json"), JSON.stringify(next, null, 2) + "\n"); // 2: redact-data --check compares byte for byte
writeFileSync(join(LIB, "views.json"), JSON.stringify(nextViews, null, 2) + "\n");
for (const p of files) unlinkSync(join(PUB, p));
console.log("written.");
