#!/usr/bin/env node
/**
 * Re-derive the hand-pose numbers from the files that ship, and fail if any of
 * them disagree.
 *
 *   node scripts/samples/check-handpose-data.mjs [--root <dir>] [--skip-records]
 *
 * Runs in `prebuild`, after `redact-data --check`. Plain Node with no
 * dependencies, because CI installs with `npm ci --omit=dev`.
 *
 * `build-handpose-data.py` already asserts all of this when it writes the files,
 * from the private inputs. This is the same arithmetic done a second time, in a
 * second language, from only what is committed — the metrics, the lane files
 * and the CSV — so that an edit by hand to any one of them, or a stale file left
 * behind by a re-run that stopped half way, cannot reach a deploy. The page, the
 * CSV, the lanes and the sample packs are all supposed to be one count of one
 * state array, and this is where that is checked rather than hoped.
 *
 * Three independent sources for the totals, and they must agree with each other
 * and with the published figures:
 *   1. the per-sample counts in handpose-metrics.json,
 *   2. the lane files, summing the runs of each state,
 *   3. the rows of hand-pose-metrics.csv.
 *
 * Every failure is collected and printed together, so one run says everything
 * that is wrong. Exit 1 on any.
 */
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* ── The published figures ──────────────────────────────────────────────── */

/** What the page, the CSV and the copy say. The data must reproduce them exactly. */
const HEADLINE = {
  samples: 16,
  frames: 43168,
  minutes: 24.0,
  measured: 62725,
  guessed: 6411,
  bridged: 259,
  none: 16941,
  delivered: 69136,
  handSlots: 86336,
  measuredOfDeliveredPct: 90.7,
  guessedOfDeliveredPct: 9.3,
  measuredOfSlotsPct: 72.7,
  deliveredOfSlotsPct: 80.1,
};
/** Per-hand 3D pose share across the 32 hands, as quoted in the copy. */
const POSE = { min: 24.0, median: 83.6, max: 99.9, atLeast95: 9, atLeast80: 20, below50: 4 };
const BOTH_HANDS = { atLeast95: 3, from80to95: 6, below80: 7 };
const PREVIEW = { video: 14, poster: 1, lane: 1 };
const DURATION = { median: 78.6, min: 64.7, max: 203.7 };

const JOINTS = [
  "wrist",
  ...["thumb", "index", "middle", "ring", "little"].flatMap((f) => [1, 2, 3, 4].map((k) => `${f}_${k}`)),
];
const STATES = ["none", "measured", "guessed", "bridged"];
const NONE = 0, MEASURED = 1, GUESSED = 2, BRIDGED = 3;
const FPS = 30;
const STRIP_BINS = 200;
/** A strip bin takes the state with most frames in it; ties go in this order. */
const STRIP_ORDER = [MEASURED, GUESSED, BRIDGED, NONE];

/**
 * The columns of the CSV, as the header may spell them. The first name is the
 * one the builder writes today. `longest_gap` is deliberately not accepted: it
 * is the pipeline gate's figure and disagrees with the lane on 25 of 32 hands,
 * and the column is meant to be the longest run in the lane itself.
 */
const CSV_COLUMNS = [
  ["sample", ["sample"]],
  ["title", ["title"]],
  ["skill_group", ["skill_group"]],
  ["duration_s", ["duration_s"]],
  ["frames", ["frames"]],
  ["left_pose_pct", ["left_pose_pct", "left_pose_delivered_pct"]],
  ["right_pose_pct", ["right_pose_pct", "right_pose_delivered_pct"]],
  ["left_measured", ["left_measured"]],
  ["left_guessed", ["left_guessed"]],
  ["left_bridged", ["left_bridged"]],
  ["left_no_3d_pose", ["left_no_3d_pose"]],
  ["right_measured", ["right_measured"]],
  ["right_guessed", ["right_guessed"]],
  ["right_bridged", ["right_bridged"]],
  ["right_no_3d_pose", ["right_no_3d_pose"]],
  ["measured_of_delivered_pct", ["measured_of_delivered_pct"]],
  ["guessed_of_delivered_pct", ["guessed_of_delivered_pct"]],
  ["left_missed_reported_pct", ["left_missed_reported_pct"]],
  ["right_missed_reported_pct", ["right_missed_reported_pct"]],
  ["left_longest_no_pose_frames", ["left_longest_no_pose_frames"]],
  ["right_longest_no_pose_frames", ["right_longest_no_pose_frames"]],
  ["skeleton_preview", ["skeleton_preview", "public_skeleton_preview", "public_skeleton_video", "public_video_preview"]],
];
/** Columns the builder may omit without it being an error. */
const CSV_OPTIONAL = new Set(["measured_of_delivered_pct"]);

/* ── Exact arithmetic ───────────────────────────────────────────────────── */

/**
 * `num / den` to one decimal, ties away from zero, in integers. The builder
 * rounds the same way (`round_half_away`), so 90.65 is 90.7 here and there, and
 * a binary-float tie is never decided by noise.
 */
const round1 = (num, den) => Math.floor((20 * num + den) / (2 * den)) / 10;
const pct1 = (num, den) => round1(100 * num, den);

/** Median of integers: the middle one, or the mean of the two middle ones as a [num, den] pair. */
function medianOf(ints) {
  const v = [...ints].sort((a, b) => a - b);
  const n = v.length;
  return n % 2 ? [v[(n - 1) / 2], 1] : [v[n / 2 - 1] + v[n / 2], 2];
}

/* ── Plumbing ───────────────────────────────────────────────────────────── */

// Not `import.meta.dirname`: this runs in `prebuild`, on whatever Node the host builds with.
const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ROOT = resolve(args.includes("--root") ? args[args.indexOf("--root") + 1] : join(HERE, "../.."));
const SKIP_RECORDS = args.includes("--skip-records");

/** @type {{ what: string, detail: string, pending?: boolean }[]} */
const fails = [];
const fail = (what, detail, pending = false) => fails.push({ what, detail, pending });
const eq = (what, actual, expected, pending = false) => {
  if (actual !== expected) fail(what, `${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`, pending);
};
const same = (what, a, b) => eq(what, JSON.stringify(a), JSON.stringify(b));

const read = (rel) => {
  const p = join(ROOT, rel);
  if (!existsSync(p)) {
    fail("file", `${rel} is missing`);
    return null;
  }
  return readFileSync(p, "utf8");
};
const readJson = (rel) => {
  const text = read(rel);
  if (text == null) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    fail("file", `${rel} is not valid JSON (${e.message})`);
    return null;
  }
};

/** RFC 4180, enough of it: quoted fields, doubled quotes, LF rows. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const fmt = (n) => n.toLocaleString("en-US");

/* ── Load ───────────────────────────────────────────────────────────────── */

const metrics = readJson("src/lib/samples/handpose-metrics.json");
const csvText = read("public/samples/hand-pose/hand-pose-metrics.csv");

const samples = metrics?.samples ?? [];
const lanes = new Map();
for (const s of samples) {
  const lane = s.lane ? readJson(`public${s.lane}`) : (fail("lane", `${s.slug}: no lane path`), null);
  if (lane) lanes.set(s.slug, lane);
}

/* The page states the lane files' size bound as a constant (DeliverySection's
   LANE_MAX_KB, "under 8 KB each") instead of measuring them, so it is held here. */
const LANE_MAX_KB = 8;
for (const s of samples) {
  const text = s.lane ? read(`public${s.lane}`) : null;
  if (text != null && Buffer.byteLength(text) >= LANE_MAX_KB * 1000) {
    fail("lane size", `${s.slug}: ${Buffer.byteLength(text)} B, over the ${LANE_MAX_KB} KB the page states`);
  }
}

/* ── 1. Shape ───────────────────────────────────────────────────────────── */

if (metrics) {
  eq("fps", metrics.fps, FPS);
  eq("jointsPerHand", metrics.jointsPerHand, 21);
  same("jointNames", metrics.jointNames, JOINTS);
  same("states", metrics.states, STATES);
  eq("sample count", samples.length, HEADLINE.samples);
  samples.forEach((s, i) => {
    eq(`sample ${i + 1} number`, s.n, i + 1);
    eq(`sample ${i + 1} slug`, s.slug, `hand-pose-${String(i + 1).padStart(2, "0")}`);
  });
}

/* ── 2. Per sample, from the lane, against the metrics ──────────────────── */

/** Counts per state of a run list, and the longest run of state 0. */
function laneTotals(runs) {
  const t = [0, 0, 0, 0];
  let longestNone = 0;
  for (const [st, , len] of runs) {
    t[st] += len;
    if (st === NONE && len > longestNone) longestNone = len;
  }
  return { t, longestNone };
}

/** A hand's state at a frame, from its runs. */
function stateAt(runs, f) {
  for (const [st, a, n] of runs) if (f >= a && f < a + n) return st;
  return NONE;
}

/** The 200-bin strip, re-derived from runs with the builder's tie order. */
function stripFromRuns(runs, frames) {
  let out = "";
  for (let k = 0; k < STRIP_BINS; k++) {
    const a = Math.floor((k * frames) / STRIP_BINS);
    const b = Math.floor(((k + 1) * frames) / STRIP_BINS);
    const counts = [0, 0, 0, 0];
    for (const [st, start, len] of runs) {
      const lo = Math.max(a, start), hi = Math.min(b, start + len);
      if (hi > lo) counts[st] += hi - lo;
    }
    let best = STRIP_ORDER[0];
    for (const st of STRIP_ORDER) if (counts[st] > counts[best]) best = st;
    out += best;
  }
  return out;
}

const fromLanes = { frames: 0, measured: 0, guessed: 0, bridged: 0, none: 0 };
const perHandPose = []; // published one-decimal share of each of the 32 hands, in tenths
const minPose = [];

for (const s of samples) {
  const lane = lanes.get(s.slug);
  const tag = s.slug;
  eq(`${tag} seconds`, s.seconds, round1(s.frames, FPS));
  eq(`${tag} frames > 0`, Number.isInteger(s.frames) && s.frames > 0, true);

  const doc = { left: s.left, right: s.right };
  if (lane) {
    eq(`${tag} lane slug`, lane.slug, s.slug);
    eq(`${tag} lane frames`, lane.frames, s.frames);
    eq(`${tag} lane fps`, lane.fps, FPS);
    same(`${tag} lane states`, lane.states, STATES);
  }

  for (const hand of ["left", "right"]) {
    const h = doc[hand];
    const where = `${tag} ${hand}`;
    const slotSum = h.measured + h.guessed + h.bridged + h.none;
    eq(`${where} counts add up to the frames`, slotSum, s.frames);
    eq(`${where} posePct`, h.posePct, pct1(h.measured + h.guessed, s.frames));
    perHandPose.push(Math.round(h.posePct * 10));

    if (!lane) continue;
    const runs = lane[hand];
    if (!Array.isArray(runs) || runs.length === 0) {
      fail(`${where} lane`, "no runs");
      continue;
    }
    // Covers [0, frames) exactly, adjacent runs differ, states are known.
    let cursor = 0;
    let prev = -1;
    let ok = true;
    for (const [st, start, len] of runs) {
      if (![0, 1, 2, 3].includes(st) || !Number.isInteger(start) || !Number.isInteger(len) || len < 1) ok = false;
      if (start !== cursor) ok = false;
      if (st === prev) ok = false;
      cursor = start + len;
      prev = st;
    }
    if (!ok) fail(`${where} lane`, "runs have a gap, an overlap, a repeated state or a bad value");
    eq(`${where} lane covers the frames`, cursor, s.frames);

    const { t, longestNone } = laneTotals(runs);
    eq(`${where} lane measured`, t[MEASURED], h.measured);
    eq(`${where} lane guessed`, t[GUESSED], h.guessed);
    eq(`${where} lane bridged`, t[BRIDGED], h.bridged);
    eq(`${where} lane none`, t[NONE], h.none);
    fromLanes.measured += t[MEASURED];
    fromLanes.guessed += t[GUESSED];
    fromLanes.bridged += t[BRIDGED];
    fromLanes.none += t[NONE];

    // The longest run with no 3D pose is read off the lane, not the pipeline gate.
    if (h.longestNoPoseFrames === undefined) {
      fail(`${where} longestNoPoseFrames`, "missing from the metrics (they still carry the gate's longestGapFrames)", true);
    } else {
      eq(`${where} longestNoPoseFrames`, h.longestNoPoseFrames, longestNone);
    }
    if ("longestGapFrames" in h) {
      fail(`${where} longestGapFrames`, "the pipeline gate's figure is still in the published metrics", true);
    }
    eq(`${where} strip`, s.strip?.[hand], stripFromRuns(runs, s.frames));
  }
  if (lane) fromLanes.frames += lane.frames;

  // Derived per-sample figures.
  const meas = s.left.measured + s.right.measured;
  const gues = s.left.guessed + s.right.guessed;
  eq(`${tag} measuredOfDeliveredPct`, s.measuredOfDeliveredPct, pct1(meas, meas + gues));
  eq(`${tag} guessedOfDeliveredPct`, s.guessedOfDeliveredPct, pct1(gues, meas + gues));
  const min = Math.min(s.left.posePct, s.right.posePct);
  minPose.push(min);
  eq(`${tag} minPosePct`, s.minPosePct, min);
  eq(`${tag} bothHandsBand`, s.bothHandsBand, min >= 95 ? "95+" : min >= 80 ? "80-95" : "<80");
  eq(`${tag} preview tier`, ["video", "poster", "lane"].includes(s.preview), true);
  eq(`${tag} pack implies video`, !s.pack || s.preview === "video", true);

  // Media: what is declared exists, and what is not declared is null.
  const m = s.media ?? {};
  const want = {
    poster: s.preview !== "lane",
    still: s.preview !== "lane",
    loop: s.preview === "video",
    video: s.preview === "video",
  };
  for (const [kind, needed] of Object.entries(want)) {
    if (needed) {
      if (!m[kind]) fail(`${tag} media.${kind}`, "declared null on a tier that needs it");
      else if (!existsSync(join(ROOT, "public", m[kind]))) fail(`${tag} media.${kind}`, `${m[kind]} is not on disk`);
    } else if (m[kind] != null) {
      fail(`${tag} media.${kind}`, "set on a tier that has none");
    }
  }
  if (s.preview === "video") {
    eq(`${tag} videoSeconds`, m.videoSeconds, s.seconds);
    const lp = s.loop;
    if (!lp) fail(`${tag} loop`, "missing");
    else {
      eq(`${tag} loop at least 2 s`, lp.frames >= 2 * FPS, true);
      eq(`${tag} loop inside the sample`, lp.start >= 0 && lp.start + lp.frames + lp.crossfadeFrames <= s.frames, true);
    }
  } else {
    eq(`${tag} loop`, s.loop, null);
  }
  if (s.preview !== "lane" && lane) {
    // The poster frame is one where both hands are measured, so the still is not an empty ground.
    const f = s.posterFrame;
    const bothMeasured = Number.isInteger(f) && f >= 0 && f < s.frames && stateAt(lane.left, f) === MEASURED && stateAt(lane.right, f) === MEASURED;
    eq(`${tag} poster frame has both hands measured`, bothMeasured, true);
  }
  eq(`${tag} lane path`, s.lane, `/samples/hand-pose/lanes/${s.slug}.json`);
}

/* ── 3. Totals, three ways ──────────────────────────────────────────────── */

const fromMetrics = { frames: 0, measured: 0, guessed: 0, bridged: 0, none: 0 };
for (const s of samples) {
  fromMetrics.frames += s.frames;
  for (const h of [s.left, s.right]) {
    fromMetrics.measured += h.measured;
    fromMetrics.guessed += h.guessed;
    fromMetrics.bridged += h.bridged;
    fromMetrics.none += h.none;
  }
}

/** The CSV: header against the known columns, then each row against the metrics. */
const fromCsv = { frames: 0, measured: 0, guessed: 0, bridged: 0, none: 0 };
if (csvText != null) {
  if (!csvText.endsWith("\n") || csvText.includes("\r")) fail("csv", "must be LF rows with a trailing newline");
  const rows = parseCsv(csvText);
  const header = rows[0] ?? [];
  const index = {};
  const known = new Map(CSV_COLUMNS.flatMap(([logical, names]) => names.map((n) => [n, logical])));
  for (const [i, name] of header.entries()) {
    if (/longest_gap/.test(name)) {
      fail("csv", `column "${name}" is the pipeline gate's figure; publish *_longest_no_pose_frames from the lane`, true);
      continue;
    }
    const logical = known.get(name);
    if (!logical) fail("csv", `unknown column "${name}"`);
    else index[logical] = i;
  }
  for (const [logical] of CSV_COLUMNS) {
    if (index[logical] === undefined && !CSV_OPTIONAL.has(logical)) {
      fail("csv", `column ${logical} is missing`, /longest_no_pose/.test(logical));
    }
  }
  const body = rows.slice(1).filter((r) => r.length > 1 || r[0] !== "");
  eq("csv rows", body.length, samples.length);
  const col = (r, logical) => (index[logical] === undefined ? undefined : r[index[logical]]);
  const oneDecimal = (v) => typeof v === "string" && /^\d+\.\d$/.test(v);
  const integer = (v) => typeof v === "string" && /^\d+$/.test(v);

  body.forEach((r, i) => {
    const s = samples[i];
    if (!s) return;
    const tag = `csv ${s.slug}`;
    if (r.length !== header.length) fail(tag, "ragged row");
    const id = col(r, "sample");
    eq(`${tag} sample`, id === s.slug || Number(String(id).replace(/\D/g, "")) === s.n, true);
    eq(`${tag} title`, col(r, "title"), s.title);
    eq(`${tag} skill_group`, col(r, "skill_group"), s.skillGroup);
    const pct = (logical, v) => {
      if (index[logical] === undefined) return;
      if (!oneDecimal(col(r, logical))) fail(tag, `${logical} is not printed to one decimal`);
      else eq(`${tag} ${logical}`, Number(col(r, logical)), v);
    };
    const count = (logical, v) => {
      if (index[logical] === undefined) return;
      if (!integer(col(r, logical))) fail(tag, `${logical} is not an exact integer`);
      else eq(`${tag} ${logical}`, Number(col(r, logical)), v);
    };
    pct("duration_s", s.seconds);
    count("frames", s.frames);
    pct("left_pose_pct", s.left.posePct);
    pct("right_pose_pct", s.right.posePct);
    for (const hand of ["left", "right"]) {
      count(`${hand}_measured`, s[hand].measured);
      count(`${hand}_guessed`, s[hand].guessed);
      count(`${hand}_bridged`, s[hand].bridged);
      count(`${hand}_no_3d_pose`, s[hand].none);
      pct(`${hand}_missed_reported_pct`, s[hand].missedPct);
      if (s[hand].longestNoPoseFrames !== undefined) count(`${hand}_longest_no_pose_frames`, s[hand].longestNoPoseFrames);
    }
    pct("measured_of_delivered_pct", s.measuredOfDeliveredPct);
    pct("guessed_of_delivered_pct", s.guessedOfDeliveredPct);
    const flag = col(r, "skeleton_preview");
    eq(`${tag} skeleton_preview`, flag, s.preview === "video" ? "yes" : "no");

    fromCsv.frames += Number(col(r, "frames"));
    for (const hand of ["left", "right"]) {
      fromCsv.measured += Number(col(r, `${hand}_measured`));
      fromCsv.guessed += Number(col(r, `${hand}_guessed`));
      fromCsv.bridged += Number(col(r, `${hand}_bridged`));
      fromCsv.none += Number(col(r, `${hand}_no_3d_pose`));
    }
  });
}

for (const [source, got] of [["metrics", fromMetrics], ["lanes", fromLanes], ["csv", fromCsv]]) {
  for (const key of ["frames", "measured", "guessed", "bridged", "none"]) {
    eq(`${source}: ${key}`, got[key], HEADLINE[key]);
  }
  eq(`${source}: hand-slots`, got.measured + got.guessed + got.bridged + got.none, HEADLINE.handSlots);
  eq(`${source}: delivered`, got.measured + got.guessed, HEADLINE.delivered);
}

/* ── 4. The aggregates block, against the same arithmetic ───────────────── */

const agg = metrics?.aggregates;
if (agg) {
  const delivered = fromMetrics.measured + fromMetrics.guessed;
  const slots = 2 * fromMetrics.frames;
  const frameCounts = samples.map((s) => s.frames);
  const [mNum, mDen] = medianOf(frameCounts);
  const [pNum, pDen] = medianOf(perHandPose); // tenths: one decimal is a whole number of them
  const expected = {
    samples: samples.length,
    frames: fromMetrics.frames,
    seconds: round1(fromMetrics.frames, FPS),
    minutes: round1(fromMetrics.frames, FPS * 60),
    handSlots: slots,
    measured: fromMetrics.measured,
    guessed: fromMetrics.guessed,
    bridged: fromMetrics.bridged,
    none: fromMetrics.none,
    delivered,
    measuredOfDeliveredPct: pct1(fromMetrics.measured, delivered),
    guessedOfDeliveredPct: pct1(fromMetrics.guessed, delivered),
    measuredOfSlotsPct: pct1(fromMetrics.measured, slots),
    deliveredOfSlotsPct: pct1(delivered, slots),
    durationMedianSec: round1(mNum, mDen * FPS),
    durationMinSec: round1(Math.min(...frameCounts), FPS),
    durationMaxSec: round1(Math.max(...frameCounts), FPS),
  };
  for (const [k, v] of Object.entries(expected)) eq(`aggregates.${k}`, agg[k], v);

  const pose = [...perHandPose].sort((a, b) => a - b);
  same("aggregates.pose", agg.pose, {
    min: pose[0] / 10,
    median: Math.floor((2 * pNum + pDen) / (2 * pDen)) / 10,
    max: pose[pose.length - 1] / 10,
    atLeast95: pose.filter((p) => p >= 950).length,
    atLeast80: pose.filter((p) => p >= 800).length,
    below50: pose.filter((p) => p < 500).length,
  });
  same("aggregates.bothHands", agg.bothHands, {
    atLeast95: minPose.filter((m) => m >= 95).length,
    from80to95: minPose.filter((m) => m >= 80 && m < 95).length,
    below80: minPose.filter((m) => m < 80).length,
  });
  same("aggregates.preview", agg.preview, {
    video: samples.filter((s) => s.preview === "video").length,
    poster: samples.filter((s) => s.preview === "poster").length,
    lane: samples.filter((s) => s.preview === "lane").length,
  });

  // And the published figures: what the copy says.
  for (const [k, v] of Object.entries(HEADLINE)) {
    if (k === "samples" || k === "frames" || k in expected) eq(`published ${k}`, agg[k], v);
  }
  same("published pose", agg.pose, POSE);
  same("published bothHands", agg.bothHands, BOTH_HANDS);
  same("published preview", agg.preview, PREVIEW);
  eq("published median duration", agg.durationMedianSec, DURATION.median);
  eq("published shortest", agg.durationMinSec, DURATION.min);
  eq("published longest", agg.durationMaxSec, DURATION.max);
}

/* ── 5. The downloads manifest ──────────────────────────────────────────── */

const downloads = readJson("src/lib/samples/handpose-downloads.json");
const staged = [];
if (downloads) {
  const entries = downloads.samples ?? {};
  for (const [slug, e] of Object.entries(entries)) {
    const s = samples.find((x) => x.slug === slug);
    if (!s) {
      fail(`downloads ${slug}`, "is not a hand-pose sample");
      continue;
    }
    if (!s.pack) fail(`downloads ${slug}`, "has an entry but the sample has no pack: the object would be reachable");
    staged.push(slug);
    for (const key of ["preview", "metadata", "full"]) {
      if (!e[key]) fail(`downloads ${slug}`, `${key} is missing (the vault and the record read all three)`);
    }
    const n = String(s.n).padStart(2, "0");
    if (e.preview) {
      eq(`downloads ${slug} preview.object`, e.preview.object, `samples/hand-pose/packs/hand-pose-${n}-pack.zip`);
      eq(`downloads ${slug} preview.contentType`, e.preview.contentType, "application/zip");
      eq(`downloads ${slug} preview.bytes`, Number.isInteger(e.preview.bytes) && e.preview.bytes > 0, true);
    }
    if (e.metadata) {
      eq(`downloads ${slug} metadata.object`, e.metadata.object, `samples/hand-pose/metadata/hand-pose-${n}.metadata.json`);
      eq(`downloads ${slug} metadata.contentType`, e.metadata.contentType, "application/json");
    }
    if (e.full) {
      eq(`downloads ${slug} full.object`, e.full.object, null);
      eq(`downloads ${slug} full.bytes`, e.full.bytes, null);
    }
  }
}
// A pack that is not uploaded yet is a to-do, not an error: the record shows
// "Sample pack behind access" and the download falls back to a request.
const unstaged = samples.filter((s) => s.pack && !staged.includes(s.slug)).map((s) => s.slug);

/* ── 6. The catalogue records are a pure function of the metrics ────────── */

let recordsNote = "records not checked";
if (!SKIP_RECORDS && metrics) {
  try {
    execFileSync(process.execPath, [join(HERE, "handpose/build-handpose-records.mjs"), "--check"], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    recordsNote = "records up to date";
  } catch (e) {
    fail("records", String(e.stderr || e.stdout || e.message).trim().split("\n")[0]);
  }
}

/* ── Report ─────────────────────────────────────────────────────────────── */

if (fails.length) {
  const pending = fails.filter((f) => f.pending);
  console.error(`check-handpose-data: FAIL, ${fails.length} assertion${fails.length === 1 ? "" : "s"}`);
  for (const f of fails.filter((x) => !x.pending)) console.error(`  ${f.what}: ${f.detail}`);
  if (pending.length) {
    // One line per kind, not per hand: 32 hands say the same thing 32 times.
    const kinds = new Map();
    for (const f of pending) {
      const key = `${f.what.replace(/^hand-pose-\d+ (left|right) /, "<hand> ")}: ${f.detail}`;
      kinds.set(key, [...(kinds.get(key) ?? []), f.what.split(" ").slice(0, 2).join(" ")]);
    }
    console.error(`  pending, waiting on the data pipeline (${pending.length}):`);
    for (const [key, who] of kinds) console.error(`    ${key}${who.length > 1 ? ` (${who.length}x, first ${who[0]})` : ""}`);
  }
  process.exit(1);
}

const a = metrics.aggregates;
console.log(
  `check-handpose-data: ok, ${a.samples} samples, ${fmt(a.frames)} frames, ${a.minutes.toFixed(1)} min, ` +
    `${fmt(a.measured)} measured, ${fmt(a.guessed)} guessed, ${fmt(a.delivered)} delivered of ${fmt(a.handSlots)} hand-frames ` +
    `(${a.measuredOfDeliveredPct} / ${a.guessedOfDeliveredPct} / ${a.measuredOfSlotsPct} / ${a.deliveredOfSlotsPct} %); ` +
    `metrics, lanes and CSV agree, ${recordsNote}` +
    (unstaged.length ? `; pack not staged yet: ${unstaged.join(", ")}` : `; ${staged.length} pack${staged.length === 1 ? "" : "s"} staged`),
);
