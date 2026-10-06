#!/usr/bin/env node
/**
 * Privacy gate for the hand-pose set.
 *
 *   node scripts/samples/check-handpose-privacy.mjs [--root <dir>] [--self-test]
 *
 * Runs in `prebuild`, so a leak fails the deploy rather than reaching it. Exit 1
 * with `file:line:col` (text) or `file@0xOFFSET` (binary) and the RULE that
 * fired — never the matched text, because build logs are not a place to repeat
 * the thing this script exists to keep out.
 *
 * Plain Node, no dependencies, no python and no ffprobe: CI installs with
 * `npm ci --omit=dev` and the gate has to run there.
 *
 * What is scanned, everything a visitor or a repo reader can reach for this set:
 *
 *   src/lib/samples/handpose-metrics.json, handpose-records.json,
 *     handpose-downloads.json, scripts/samples/handpose/curation.json
 *   public/samples/hand-pose/**              lanes, CSV, stills, video, hero, og
 *   public/samples/clips/hand-pose-*         card loops
 *   public/samples/posters/hand-pose-*       card posters
 *   src/app/samples/_sections/handpose/**    the components
 *
 * What it fails on:
 *
 *   identifiers   the capture's own names (`capture__`, a `YYYYMMDD_HHMMSS`
 *                 stamp, `seg_NN`), Drive links, operator and business fields,
 *                 the mesh's shape parameters, the vendor's product name, the
 *                 cities and communes with and without diacritics and with the
 *                 words run together, the known business names, and the
 *                 episode hashes. The hashes are read at run time from the
 *                 private slug map and matched against every 8-hex window of
 *                 the scanned bytes; they are not in this file in any form.
 *   copy          claims this set must not make (see COPY_RULES), in text files
 *                 and not in code comments, which say what not to print.
 *   json keys     fields the data is not allowed to carry, by whole word.
 *   media         every mp4 must be faststart (moov before mdat); no mp4
 *                 location atom; no EXIF, XMP or IPTC in a jpeg. A sample whose
 *                 preview is not "video" has no loop, no video and no such file
 *                 on disk; a "lane" sample has no poster and no still either.
 *   repo          no file or folder named *slug-map*: the private map from a
 *                 sample number to its capture lives in the cache, never here.
 *   records       the sixteen catalogue records carry no environment, locale,
 *                 industry or job, and nothing in their spec that `publicSpec`
 *                 would redact.
 *
 * Binary files are scanned twice: as latin1, for exact byte offsets of the
 * ASCII identifiers, and as UTF-8, for the diacritic spellings.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve, extname, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/** The directory of this file. Not `import.meta.dirname`: this runs in `prebuild`, on whatever Node the host builds with. */
const HERE = dirname(fileURLToPath(import.meta.url));

/* ── Rules ──────────────────────────────────────────────────────────────── */

/** Lower-case ASCII, diacritics folded: "Hà Nội" -> "ha noi", "Hưng Yên" -> "hung yen". */
export const fold = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D");

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Words run together, or separated by space, underscore, dot or hyphen, and not
 * inside a longer word: `hanoi_01` and `Ha-Noi` match, `shanoi` does not.
 */
const phrase = (words) =>
  new RegExp(`(?<![a-z])${words.split(" ").map(esc).join("[\\s_.\\-]*")}(?![a-z])`, "i");

/** Matched against folded text, so the diacritic spellings need no entry of their own. */
const PLACES = ["ha noi", "thai nguyen", "viet tri", "hai phong", "hung yen", "van giang", "xa van giang"];
const BUSINESSES = ["xuong may", "signage workshop"];

/** [rule id, regexp] pairs for the identifiers. The id is what is printed. */
export const ID_RULES = [
  ["episode-name", /capture__/i],
  ["capture-timestamp", /\d{8}_\d{6}/],
  ["segment-index", /seg_\d+/i],
  ["drive-link", /drive\.google\.com/i],
  ["operator-field", /operator_/i],
  ["business-field", /business_/i],
  ["mesh-shape-parameters", /betas/i],
  ["vendor-product-name", /robocap/i],
  ...PLACES.map((p) => ["place-name", phrase(p)]),
  ...BUSINESSES.map((b) => ["business-name", phrase(b)]),
];

/**
 * The episode hashes, read at run time from the private slug map and held in
 * memory only. They are not in the repo in any form: a digest of an 8-hex value
 * is brute-forced in minutes, so it would only have been the hashes with extra
 * steps. Where the map is absent (Vercel, CI, a fresh clone) the rule is
 * skipped and the summary says so; the capture__, timestamp and seg_ rules
 * still catch a full episode name there.
 */
const SLUG_MAP = join(process.env.HANDPOSE_CACHE ?? join(homedir(), ".cache/tbrain-samples/handpose-v2"), "slug-map.private.json");

function loadEpisodeHashes() {
  if (!existsSync(SLUG_MAP)) return new Set();
  const map = JSON.parse(readFileSync(SLUG_MAP, "utf8"));
  const out = new Set();
  for (const name of Object.values(map)) {
    const m = /__([0-9a-f]{8})__/i.exec(String(name));
    if (m) out.add(m[1].toLowerCase());
  }
  return out;
}

let EPISODE_HASHES = loadEpisodeHashes();

/** Offsets of every 8-hex window, in any hex run, that is one of the episode hashes. */
function episodeHashOffsets(s) {
  const out = [];
  if (EPISODE_HASHES.size === 0) return out;
  const run = /[0-9a-f]{8,}/gi;
  let m;
  while ((m = run.exec(s))) {
    const hex = m[0].toLowerCase();
    for (let i = 0; i + 8 <= hex.length; i++) {
      if (EPISODE_HASHES.has(hex.slice(i, i + 8))) out.push(m.index + i);
    }
  }
  return out;
}

/**
 * Claims this set must not make. Matched against folded, lower-case text of
 * files that reach a reader, with code comments removed first.
 */
export const COPY_RULES = [
  // Joint order is the OpenPose / MediaPipe layout, not the mesh model's.
  ["mano-order", /mano[\s-]+order/],
  // The capture pipeline's own place taxonomy.
  ["environment-label", /environment[\s_]*l[123]\b/],
  // The numbers that would let a reader reconstruct the rig or the hand.
  ["reprojection-error", /reproj/],
  ["palm-size", /palm[\s_-]*(?:size|width|length)/],
  ["bone-lengths", /bone[\s_-]*(?:length|len)s?/],
  // Claims nobody has verified for these samples.
  ["consent-claim", /recorded per session/],
  ["no-private-residences", /no private residences/],
  ["no-faces-names-places", /no faces, names or places/],
  ["nobody-else-publishes", /nobody else publishes/],
  ["licence-scope-claim", /applies to vertices and meshes/],
  // No service levels and no prices on a sample page.
  ["reply-time", /reply within|business days?\b/],
  ["turnaround-or-price", /turnaround|\bpric(?:e|es|ing)\b|\busd\b|us\$/],
  // Strings the review or the copy deck retired.
  ["cleanest", /\bcleanest\b/],
  ["3d-preview-on-request", /3d preview on request/],
  ["explore-in-3d", /explore in 3d/],
  ["release-2", /release 2\b/],
  ["baseline-range", /\b9\s*[-–—]\s*11\s*cm\b/],
  ["median-missed", /\b1\.25\s*%/],
  // The metric is "3D pose", not frames "in frame": a 2D detection can exist
  // for a frame that has no 3D pose.
  ["in-frame", /(?<![a-z])in[\s_-]frame(?![a-z])/],
];

/**
 * "out of view" survives in one clause, the definition of a frame with no 3D
 * pose, and wherever the copy deck repeats it whole: "out of view, or detected
 * in 2D but not triangulated" (also "or was detected", and "without being
 * triangulated" in a sentence that says the hand "may have been" out of view).
 * Said alone it reads as "the hand was not there", which for 85% of those
 * frames is not what happened: a 2D detection existed.
 */
const OUT_OF_VIEW = /out of view/g;
const OUT_OF_VIEW_OK = /^,? or (?:was )?detected in 2d (?:but not|without being) triangulated/;

/**
 * A calendar date in a data file or a media file. The capture's own date is the
 * `YYYYMMDD_HHMMSS` stamp above; this is the same fact written another way.
 * Not applied to source files, whose comments quote the date a decision was made.
 */
const DATE_RULE = ["calendar-date", /(?<![0-9])20\d{2}-[01]\d-[0-3]\d(?![0-9])/];

/** Key words a data file must not carry, matched against the key split into words. */
const FORBIDDEN_KEY_WORDS = new Set([
  "city", "commune", "province", "district", "address", "business", "operator", "device",
  "gender", "handedness", "age", "betas", "episode", "calibration", "timestamp",
  "reprojection", "palm", "bone", "bones",
]);
const keyWords = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());

/* ── Scanning ───────────────────────────────────────────────────────────── */

const CODE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"]);
const BINARY = new Set([".mp4", ".mov", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".npz", ".zip", ".rrd"]);

/** Block and line comments out, newlines kept so line numbers still agree. */
function stripComments(src) {
  const blank = (m) => m.replace(/[^\n]/g, " ");
  return src.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:\\'"`])\/\/.*$/gm, "$1");
}

const at = (rel, line, col) => `${rel}:${line}:${col}`;

/**
 * Findings in one text file's content. `code` removes comments before the copy
 * rules: a comment explaining why a string is banned has to be able to name it.
 * The identifier rules see everything, comments included.
 *
 * @returns {{ at: string, rule: string }[]}
 */
export function scanText(rel, text, { code = false } = {}) {
  const found = [];
  const lines = text.split(/\r?\n/);
  const copyLines = code ? stripComments(text).split(/\r?\n/) : lines;

  lines.forEach((line, i) => {
    const folded = fold(line);
    for (const [rule, re] of ID_RULES) {
      const m = re.exec(folded);
      if (m) found.push({ at: at(rel, i + 1, m.index + 1), rule });
    }
    for (const off of episodeHashOffsets(folded)) found.push({ at: at(rel, i + 1, off + 1), rule: "episode-hash" });
    if (!code) {
      const d = DATE_RULE[1].exec(folded);
      if (d) found.push({ at: at(rel, i + 1, d.index + 1), rule: DATE_RULE[0] });
    }

    const copy = fold(copyLines[i] ?? "").toLowerCase();
    for (const [rule, re] of COPY_RULES) {
      const m = re.exec(copy);
      if (m) found.push({ at: at(rel, i + 1, m.index + 1), rule });
    }
    OUT_OF_VIEW.lastIndex = 0;
    let o;
    while ((o = OUT_OF_VIEW.exec(copy))) {
      if (!OUT_OF_VIEW_OK.test(copy.slice(o.index + o[0].length))) {
        found.push({ at: at(rel, i + 1, o.index + 1), rule: "out-of-view" });
      }
    }
  });
  return found;
}

/**
 * Findings in one binary file. Latin1 first: every byte is one character, so
 * the offsets are exact. UTF-8 second, for the diacritic spellings, which are
 * several bytes in a tag or a text chunk.
 */
export function scanBinary(rel, buf) {
  const found = [];
  const latin = buf.toString("latin1");
  for (const [rule, re] of ID_RULES) {
    const m = re.exec(latin);
    if (m) found.push({ at: `${rel}@0x${m.index.toString(16)}`, rule });
  }
  for (const off of episodeHashOffsets(latin)) found.push({ at: `${rel}@0x${off.toString(16)}`, rule: "episode-hash" });
  const date = DATE_RULE[1].exec(latin);
  if (date) found.push({ at: `${rel}@0x${date.index.toString(16)}`, rule: DATE_RULE[0] });

  const utf = fold(buf.toString("utf8"));
  for (const [rule, re] of ID_RULES.filter(([r]) => r === "place-name" || r === "business-name")) {
    const m = re.exec(utf);
    if (m && !found.some((f) => f.rule === rule)) found.push({ at: `${rel}@~${m.index} (utf-8)`, rule });
  }
  return found;
}

/** Top-level boxes of an mp4, in file order: type, start offset and size. */
export function mp4Boxes(buf) {
  const out = [];
  let pos = 0;
  while (pos + 8 <= buf.length) {
    let size = buf.readUInt32BE(pos);
    const type = buf.toString("latin1", pos + 4, pos + 8);
    let head = 8;
    if (size === 1) {
      if (pos + 16 > buf.length) break;
      size = Number(buf.readBigUInt64BE(pos + 8));
      head = 16;
    } else if (size === 0) {
      size = buf.length - pos;
    }
    out.push({ type, start: pos, size });
    if (size < head) break;
    pos += size;
  }
  return out;
}

/** The mp4 findings: faststart, and no embedded location. */
export function scanMp4(rel, buf) {
  const found = [];
  const boxes = mp4Boxes(buf);
  if (boxes[0]?.type !== "ftyp") {
    found.push({ at: rel, rule: "mp4-not-an-mp4" });
    return found;
  }
  const types = boxes.map((b) => b.type);
  const moov = types.indexOf("moov");
  const mdat = types.indexOf("mdat");
  if (moov < 0 || mdat < 0 || moov > mdat) found.push({ at: rel, rule: "mp4-not-faststart" });
  // "(c)xyz" is the QuickTime location atom, "location.ISO6709" the Apple
  // metadata key. Looked for inside `moov` only: four bytes in the media data
  // match by chance about once in two hundred files.
  if (moov >= 0) {
    const box = boxes[moov];
    const inside = buf.subarray(box.start, box.start + box.size);
    const loc = inside.indexOf(Buffer.from([0xa9, 0x78, 0x79, 0x7a]));
    if (loc >= 0) found.push({ at: `${rel}@0x${(box.start + loc).toString(16)}`, rule: "mp4-location-atom" });
    const iso = inside.indexOf("location.ISO6709", 0, "latin1");
    if (iso >= 0) found.push({ at: `${rel}@0x${(box.start + iso).toString(16)}`, rule: "mp4-location-atom" });
  }
  return found;
}

/** A published jpeg is a render: it carries no EXIF, XMP or IPTC. */
export function scanJpeg(rel, buf) {
  const found = [];
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return [{ at: rel, rule: "jpeg-not-a-jpeg" }];
  let pos = 2;
  while (pos + 4 <= buf.length && buf[pos] === 0xff) {
    const marker = buf[pos + 1];
    if (marker === 0xda || marker === 0xd9) break; // start of scan, end of image
    const len = buf.readUInt16BE(pos + 2);
    if (marker === 0xe1 || marker === 0xed) found.push({ at: `${rel}@0x${pos.toString(16)}`, rule: "jpeg-metadata" });
    pos += 2 + len;
  }
  return found;
}

/* ── Files ──────────────────────────────────────────────────────────────── */

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", ".vercel", ".turbo", ".samples-stage"]);
/** Every file or folder in the repo whose name says it is a slug map. */
function slugMapFiles(root) {
  const out = [];
  const visit = (dir) => {
    for (const name of readdirSync(dir)) {
      if (SKIP_DIRS.has(name)) continue;
      const p = join(dir, name);
      if (/slug-map/i.test(name)) out.push(p);
      let st;
      try {
        st = statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) visit(p);
    }
  };
  visit(root);
  return out;
}

const looksBinary = (buf) => buf.subarray(0, 8000).includes(0);

/** Every JSON key, by dotted path, in a parsed document. */
function* jsonKeys(value, path = "") {
  if (Array.isArray(value)) {
    // Lanes are arrays of arrays of numbers; only objects can carry a key.
    for (let i = 0; i < value.length; i++) if (value[i] && typeof value[i] === "object") yield* jsonKeys(value[i], `${path}[]`);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      yield [k, path ? `${path}.${k}` : k];
      yield* jsonKeys(v, path ? `${path}.${k}` : k);
    }
  }
}

/** The files this gate certifies, repo-relative. */
export function targets(root) {
  const rel = (p) => relative(root, p).split(sep).join("/");
  const required = [
    "src/lib/samples/handpose-metrics.json",
    "src/lib/samples/handpose-records.json",
    "src/lib/samples/handpose-downloads.json",
    "scripts/samples/handpose/curation.json",
  ];
  const files = required.map((r) => join(root, r));
  files.push(...walk(join(root, "public/samples/hand-pose")));
  for (const dir of ["clips", "posters"]) {
    const d = join(root, "public/samples", dir);
    if (existsSync(d)) files.push(...readdirSync(d).filter((n) => n.startsWith("hand-pose-")).sort().map((n) => join(d, n)));
  }
  files.push(...walk(join(root, "src/app/samples/_sections/handpose")));
  return { required: required.map((r) => join(root, r)), files: [...new Set(files)].map((p) => ({ abs: p, rel: rel(p) })) };
}

/**
 * Scan one file by what it is. The path is scanned too: a file called after an
 * episode is as much a leak as one that says so inside.
 */
export function scanFile(rel, buf) {
  const ext = extname(rel).toLowerCase();
  const found = scanText(rel, rel).map((f) => ({ ...f, at: `${rel} (path)` }));
  if (BINARY.has(ext) || looksBinary(buf)) {
    found.push(...scanBinary(rel, buf));
    if (ext === ".mp4" || ext === ".mov") found.push(...scanMp4(rel, buf));
    if (ext === ".jpg" || ext === ".jpeg") found.push(...scanJpeg(rel, buf));
    return found;
  }
  const text = buf.toString("utf8");
  found.push(...scanText(rel, text, { code: CODE.has(ext) }));
  if (ext === ".json") {
    let doc;
    try {
      doc = JSON.parse(text);
    } catch {
      found.push({ at: rel, rule: "json-invalid" });
      return found;
    }
    for (const [key, path] of jsonKeys(doc)) {
      if (keyWords(key).some((w) => FORBIDDEN_KEY_WORDS.has(w))) found.push({ at: `${rel} key ${path}`, rule: "forbidden-field" });
    }
  }
  return found;
}

/* ── Policy: what each preview tier may have on disk ────────────────────── */

function mediaPolicy(root, samples) {
  const found = [];
  const has = (p) => existsSync(join(root, p));
  const known = new Set(samples.map((s) => s.slug));

  for (const s of samples) {
    const loop = `public/samples/clips/${s.slug}.mp4`;
    const video = `public/samples/hand-pose/video/${s.slug}.mp4`;
    const poster = `public/samples/posters/${s.slug}.jpg`;
    const still = `public/samples/hand-pose/stills/${s.slug}.jpg`;
    const m = s.media ?? {};

    if (s.preview !== "video") {
      if (m.video) found.push({ at: `${s.slug} media.video`, rule: "tier-video-set" });
      if (m.loop) found.push({ at: `${s.slug} media.loop`, rule: "tier-video-set" });
      for (const f of [loop, video]) if (has(f)) found.push({ at: f, rule: "tier-video-on-disk" });
    }
    if (s.preview === "lane") {
      if (m.poster) found.push({ at: `${s.slug} media.poster`, rule: "tier-lane-has-image" });
      if (m.still) found.push({ at: `${s.slug} media.still`, rule: "tier-lane-has-image" });
      for (const f of [poster, still]) if (has(f)) found.push({ at: f, rule: "tier-lane-has-image" });
    }
  }

  // A numbered file for a sample that does not exist is somebody else's media.
  const orphan = (dir, re) => {
    const d = join(root, dir);
    if (!existsSync(d)) return;
    for (const n of readdirSync(d)) {
      const m = re.exec(n);
      if (m && !known.has(m[1])) found.push({ at: `${dir}/${n}`, rule: "orphan-media" });
    }
  };
  orphan("public/samples/clips", /^(hand-pose-\d{2})\.mp4$/);
  orphan("public/samples/posters", /^(hand-pose-\d{2})\.jpg$/);
  orphan("public/samples/hand-pose/video", /^(hand-pose-\d{2})\.mp4$/);
  orphan("public/samples/hand-pose/stills", /^(hand-pose-\d{2})\.jpg$/);
  orphan("public/samples/hand-pose/lanes", /^(hand-pose-\d{2})\.json$/);
  return found;
}

/** The records carry nothing that places them and nothing `publicSpec` would redact. */
async function recordPolicy(root) {
  const found = [];
  const file = join(root, "src/lib/samples/handpose-records.json");
  if (!existsSync(file)) return found;
  const { publicSpec } = await import(pathToFileURL(join(HERE, "../../src/lib/samples/redact.mjs")).href);
  const records = JSON.parse(readFileSync(file, "utf8"));
  for (const r of records) {
    for (const k of ["environment", "locale"]) if (r[k] !== "") found.push({ at: `${r.slug} ${k}`, rule: "record-places" });
    for (const k of ["industry", "job"]) if (r[k] != null) found.push({ at: `${r.slug} ${k}`, rule: "record-places" });
    if (JSON.stringify(publicSpec(r.spec)) !== JSON.stringify(r.spec)) found.push({ at: `${r.slug} spec`, rule: "record-spec-redacted" });
    if (r.spec.some(([label]) => label === "Operator" || label === "File")) found.push({ at: `${r.slug} spec`, rule: "record-spec-redacted" });
  }
  return found;
}

/* ── Self-test: the gate has to be seen to fail ─────────────────────────── */

function selfTest() {
  const bad = [
    "capture__x", "x 20260821_070135 y", "seg_002", "https://drive.google.com/file/d/x", "operator_12",
    "business_3", "betas: []", "Robocap", "Hà Nội", "HANOI", "hanoi_01", "ha-noi", "Thái Nguyên", "ThaiNguyen",
    "Viet-Tri", "Việt Trì", "Hải Phòng", "haiphong", "Hưng Yên", "HungYen", "Văn Giang", "Xã Văn Giang",
    "Xưởng may", "xuong may", "Signage Workshop", "signage_workshop",
    "the MANO order", "reprojection px", "palm size", "bone lengths", "Consent recorded per session",
    "No private residences", "No faces, names or places", "Reply within one business day", "Nobody else publishes a table",
    "Cleanest", "3D preview on request", "Explore in 3D", "Release 2", "9-11 cm", "9 – 11 cm", "median 1.25%",
    "hands in frame", "left_in_frame_pct", "the hand was out of view for most of the clip", "US$5", "turnaround", "pricing",
    "Environment L2: workshop", "recorded 2026-08-21", "created_at 2026-08-21T10:00:00Z",
  ];
  const good = [
    "hand-pose-13", "head-rig frame", "frame 1,215 / 2,239", "Measured, guessed, bridged or no 3D pose",
    "No 3D pose delivered for this frame (out of view, or detected in 2D but not triangulated).",
    "no 3D pose: out of view, or detected in 2D but not triangulated.",
    "the hand may have been out of view, or detected in 2D without being triangulated.", "#56B4E9", "Captured in Vietnam",
    "Fabric arranging", "about 9 cm apart", "shanoise", "Evan Giang", "Both hands, highest 3D pose share",
    "0123abcd 89abcdef", "S: [1, 0, 120]", "percentage", "segment", "captured", "frames 12026-08-211", "Environment",
  ];
  let failed = 0;
  const miss = [];
  for (const t of bad) if (scanText("t", t).length === 0) miss.push(t);
  for (const t of good) {
    const f = scanText("t", t);
    if (f.length) {
      failed++;
      console.error(`self-test: false positive on "${t}": ${f.map((x) => x.rule).join(", ")}`);
    }
  }
  // An episode hash inside a longer hex run, and inside a word — probed with a
  // stand-in hash so the self-test needs no private data.
  const real = EPISODE_HASHES;
  EPISODE_HASHES = new Set(["0badc0de"]);
  const probeHash = (h) => scanText("t", `x${h}y`).length + scanText("t", `${h}0123abcd`).length;
  if (probeHash("0badc0de") < 2) miss.push("episode hash");
  if (scanText("t", "0badc0df").length) failed++;
  EPISODE_HASHES = real;
  // Comments may name what is banned; copy may not.
  if (scanText("c.tsx", "// never write robocap or in frame", { code: true }).some((f) => f.rule === "in-frame")) failed++;
  if (scanText("c.tsx", "const t = 'hands in frame';", { code: true }).length === 0) miss.push("copy rule in code string");
  // Source comments quote dates ("Tam, 2026-09-10"); data files may not carry one.
  if (scanText("c.tsx", "// Tam, 2026-09-10: decided", { code: true }).length) failed++;
  if (!scanText("d.json", '{"x":"2026-09-10"}').some((f) => f.rule === "calendar-date")) miss.push("date in a data file");
  if (!scanBinary("b.bin", Buffer.from("xx 2026-09-10T01:02:03Z yy", "latin1")).some((f) => f.rule === "calendar-date")) miss.push("date in a binary");
  // Binary: a faststart check on a hand-built moov-after-mdat file.
  const box = (type, n, body = Buffer.alloc(0)) => {
    const b = Buffer.alloc(n);
    b.writeUInt32BE(n, 0);
    b.write(type, 4, "latin1");
    body.copy(b, 8);
    return b;
  };
  const slow = Buffer.concat([box("ftyp", 16), box("mdat", 32), box("moov", 24)]);
  const fast = Buffer.concat([box("ftyp", 16), box("moov", 24), box("mdat", 32)]);
  if (!scanMp4("slow.mp4", slow).some((f) => f.rule === "mp4-not-faststart")) miss.push("moov after mdat");
  if (scanMp4("fast.mp4", fast).length) failed++;
  const gps = Buffer.concat([box("ftyp", 16), box("moov", 24, Buffer.from([0xa9, 0x78, 0x79, 0x7a])), box("mdat", 32)]);
  if (!scanMp4("gps.mp4", gps).some((f) => f.rule === "mp4-location-atom")) miss.push("mp4 location atom");
  // The same four bytes in the media data are not a location.
  const noise = Buffer.concat([box("ftyp", 16), box("moov", 24), box("mdat", 32, Buffer.from([0xa9, 0x78, 0x79, 0x7a]))]);
  if (scanMp4("noise.mp4", noise).length) failed++;
  if (scanBinary("b.bin", Buffer.from("xx Hà Nội yy", "utf8")).length === 0) miss.push("utf-8 diacritics in binary");
  if (scanBinary("b.bin", Buffer.from("xx hanoi yy", "latin1")).length === 0) miss.push("ascii place in binary");
  const exif = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08]), Buffer.from("Exif\0\0"), Buffer.from([0xff, 0xd9])]);
  if (!scanJpeg("e.jpg", exif).some((f) => f.rule === "jpeg-metadata")) miss.push("jpeg exif");

  for (const m of miss) console.error(`self-test: not detected: ${m}`);
  if (miss.length || failed) process.exit(1);
  console.log(`check-handpose-privacy self-test: ok (${bad.length} detected, ${good.length} clean)`);
}

/* ── Main ───────────────────────────────────────────────────────────────── */

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) return selfTest();
  const rootArg = args.includes("--root") ? args[args.indexOf("--root") + 1] : null;
  const root = resolve(rootArg ?? join(HERE, "../.."));

  const findings = [];
  const { required, files } = targets(root);

  for (const r of required) {
    if (!existsSync(r)) findings.push({ at: relative(root, r), rule: "required-file-missing" });
  }
  if (!existsSync(join(root, "public/samples/hand-pose"))) findings.push({ at: "public/samples/hand-pose", rule: "required-file-missing" });

  let bytes = 0;
  let mp4 = 0;
  let metrics = null;
  for (const f of files) {
    if (!existsSync(f.abs)) continue;
    const buf = readFileSync(f.abs);
    bytes += buf.length;
    if (/\.(mp4|mov)$/i.test(f.rel)) mp4++;
    findings.push(...scanFile(f.rel, buf));
    if (f.rel === "src/lib/samples/handpose-metrics.json") {
      try {
        metrics = JSON.parse(buf.toString("utf8"));
      } catch {
        /* already reported as json-invalid */
      }
    }
  }

  if (metrics?.samples) findings.push(...mediaPolicy(root, metrics.samples));
  for (const p of slugMapFiles(root)) findings.push({ at: relative(root, p), rule: "slug-map-in-repo" });
  findings.push(...(await recordPolicy(root)));

  if (findings.length) {
    console.error(`check-handpose-privacy: FAIL, ${findings.length} finding${findings.length === 1 ? "" : "s"}`);
    for (const f of findings) console.error(`  ${f.at}  ${f.rule}`);
    console.error("A rule id names the kind of thing found, not the text. Fix the source and rebuild the data.");
    process.exit(1);
  }
  console.log(
    `check-handpose-privacy: ok (${files.length} files, ${(bytes / 1048576).toFixed(1)} MB, ${mp4} mp4 faststart, ` +
      `${ID_RULES.length + 1} identifier + ${COPY_RULES.length + 1} copy rules, 0 findings; ` +
      (EPISODE_HASHES.size
        ? `episode hashes checked: ${EPISODE_HASHES.size})`
        : "episode-hash rule skipped: no private slug map on this machine)"),
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch((e) => {
    console.error(`check-handpose-privacy: ${e.message}`);
    process.exit(1);
  });
}
