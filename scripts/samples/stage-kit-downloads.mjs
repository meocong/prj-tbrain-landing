/**
 * Name a folder of Drive downloads after the records they belong to.
 *
 * The kit delivery cannot be cut off its share link — see the note on
 * `SETS.kit` in `cut-drive-previews.mjs` — so the videos arrive by hand, and
 * they arrive anonymous. Drive names a copy after the file, not after the
 * folder it came out of, and every session in this delivery calls its cameras
 * the same three things. Five downloads land as:
 *
 *   Bản sao của gopro_1_original.mp4
 *   Bản sao của gopro_1_original(1).mp4
 *   Bản sao của gopro_1_original(2).mp4
 *   Bản sao của gopro_2_original.mp4
 *   Bản sao của gopro_3_original.mp4
 *
 * Nothing in those names says which task, which session, or which camera role.
 * Renaming them by hand is the kind of job that is wrong once and silently
 * wrong forever — a wrist view filed under the wrong trade looks fine.
 *
 * So they are identified by SIZE. `kit-sessions.json` carries the exact byte
 * count of every file in the delivery, taken from Drive's own listing, and a
 * 200 MB video's length in bytes is effectively unique. The match is exact, not
 * fuzzy: a file whose size appears twice in the delivery, or not at all, is
 * reported and skipped rather than guessed at.
 *
 * Output is symlinks, not copies. These are hundreds of megabytes each and the
 * cutter only reads them.
 *
 * Usage:
 *   node scripts/samples/stage-kit-downloads.mjs <downloadDir> [--out <dir>] [--copy]
 *   node scripts/samples/cut-drive-previews.mjs --set kit --from .samples-stage/kit
 */
import { readFileSync, readdirSync, statSync, mkdirSync, rmSync, symlinkSync, copyFileSync, existsSync } from "node:fs";
import { join, resolve, basename } from "node:path";
import { configOf, kitGroups, wristOrder } from "./kit-slugs.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const args = process.argv.slice(2);
const SRC = args.find((a) => !a.startsWith("--"));
const OUT = resolve(
  args.includes("--out") ? args[args.indexOf("--out") + 1] : join(ROOT, ".samples-stage/kit"),
);
const COPY = args.includes("--copy");

if (!SRC) {
  console.error("usage: node scripts/samples/stage-kit-downloads.mjs <downloadDir> [--out dir] [--copy]");
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(join(ROOT, "scripts/samples/kit-sessions.json"), "utf8"));

/**
 * Which view suffix a camera directory earns, per configuration.
 *
 * Mirrors `VIEW_DIR` in `kit-slugs.mjs` — the head camera is the base view and
 * the wrists follow it. Kept as its own map rather than imported because that
 * one answers "which directory for this suffix" and this one is the inverse.
 */
const SUFFIX = {
  mono: () => ({ gopro_1: "" }),
  /* Per bucket, because which GoPro was on the head is per bucket — see
     `HEAD_CAMERA` in kit-slugs.mjs. Staging has to agree with the cutter about
     this or the card faces come out on the wrong files. */
  wrist: (slug) => Object.fromEntries(wristOrder(slug).map(([suffix, dir]) => [dir, suffix])),
  rgbd: () => ({ d455: "" }),
};

/** Every mp4 in the delivery, keyed by its exact byte count. */
const bySize = new Map();
for (const s of Object.values(manifest.sessions)) {
  if (s.error) continue;
  for (const [dir, cam] of Object.entries(s.cameras ?? {})) {
    for (const [name, f] of Object.entries(cam.files ?? {})) {
      if (!/\.mp4$/i.test(name) || !f?.bytes) continue;
      if (!bySize.has(f.bytes)) bySize.set(f.bytes, []);
      bySize.get(f.bytes).push({ session: s, dir, name });
    }
  }
}

/** Task+config -> slug, so a matched file can be told which record it faces. */
const slugFor = new Map();
for (const g of kitGroups(manifest)) {
  slugFor.set(`${(g.sessions[0].task ?? "").trim()}::${g.config}`, g.slug);
}

mkdirSync(OUT, { recursive: true });

const staged = new Map();
const skipped = [];

for (const file of readdirSync(SRC).filter((f) => /\.mp4$/i.test(f))) {
  const path = join(SRC, file);
  const size = statSync(path).size;
  const hits = bySize.get(size) ?? [];

  if (hits.length === 0) {
    skipped.push(`${file} — ${size} bytes matches nothing in the delivery`);
    continue;
  }
  /* Several sessions sharing a byte count would make the match ambiguous, and
     a wrong guess here mislabels a record. It has not happened yet; if it does
     the file is named by hand rather than by coin toss. */
  const distinct = new Set(hits.map((h) => `${h.session.clock}/${h.dir}`));
  if (distinct.size > 1) {
    skipped.push(`${file} — ${size} bytes is ambiguous: ${[...distinct].join(", ")}`);
    continue;
  }

  const { session, dir } = hits[0];
  const config = configOf(session);
  const slug = slugFor.get(`${(session.task ?? "").trim()}::${config}`);
  const suffix = slug ? SUFFIX[config]?.(slug)?.[dir] : undefined;

  if (!slug || suffix === undefined) {
    skipped.push(`${file} — ${session.task} / ${dir} has no record to face (config ${config})`);
    continue;
  }

  const target = `${slug}${suffix}.mp4`;
  /* Drive hands out `name(1).mp4` for a second copy of the same file. Both
     match the same delivery file, and staging the second over the first is a
     no-op that reads like a conflict, so it is reported as the duplicate it
     is. */
  if (staged.has(target)) {
    skipped.push(`${file} — duplicate of ${staged.get(target)}, already staged as ${target}`);
    continue;
  }

  const dest = join(OUT, target);
  if (existsSync(dest)) rmSync(dest);
  if (COPY) copyFileSync(path, dest);
  else symlinkSync(resolve(path), dest);

  staged.set(target, basename(file));
  console.log(
    `  ok   ${target.padEnd(40)} << ${(session.task ?? "").trim()} / ${session.clock} / ${dir}`,
  );
}

for (const s of skipped) console.log(`  skip ${s}`);
console.log(`\n${staged.size} staged into ${OUT.replace(`${ROOT}/`, "")}`);
