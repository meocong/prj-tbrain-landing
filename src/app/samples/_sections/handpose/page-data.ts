import {
  HANDPOSE,
  HP_AGG,
  HP_SAMPLES,
  fmtCount,
  type Hand,
  type HandPoseSample,
  type HandStats,
} from "@/lib/samples/handpose";

/**
 * Everything the category page derives from the metrics, in one place.
 *
 * Nothing on the page is typed in: a figure is read from `HP_AGG` or
 * `HP_SAMPLES`, or computed here from them, so the page, the CSV and the viewer
 * cannot disagree and a re-run of the data build moves all of them together.
 * The few constants below are facts about the rig, not about the data.
 */

/** Samples in sample-number order, whatever order the file happens to hold them. */
export const SAMPLES: HandPoseSample[] = [...HP_SAMPLES].sort((a, b) => a.n - b.n);

export const HANDS: Hand[] = ["left", "right"];

/** The two cameras of the head rig's stereo pair that the joints are triangulated from. */
export const STEREO_CAMERAS = 2;

/** "08", the form the table and the chips print a sample number in. */
export const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * The sample the page leads with: 13, whose operator consented to a public
 * preview and whose camera video is the hero's and the category card's
 * (`faceMedia` in categories.ts). The hero loop, the workspace and the caption
 * all point at it, so they cannot name different samples. Falls back to the
 * first sample with a video, then the first sample.
 */
export const FEATURED: HandPoseSample =
  SAMPLES.find((s) => s.n === 13 && s.preview === "video") ?? SAMPLES.find((s) => s.preview === "video") ?? SAMPLES[0];

const WORDS = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
  "nineteen", "twenty",
];

/** "sixteen" for 16; the digits past twenty, where a word stops reading well. */
export const numberWord = (n: number) => WORDS[n] ?? String(n);

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** "13 and 14", "a, b and c". */
export function joinAnd(items: (string | number)[]) {
  const list = items.map(String);
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/** "1 frame", "105 frames". */
export const framesLabel = (n: number) => `${fmtCount(n)} ${n === 1 ? "frame" : "frames"}`;

/** Guessed frames as a share of the frames delivered (measured + guessed) for one hand. */
export function guessedShare(h: HandStats): number {
  const delivered = h.measured + h.guessed;
  return delivered > 0 ? (h.guessed / delivered) * 100 : 0;
}

/** Frames with no 3D pose, as a share of all the clip's frames. */
export const noPosePct = (h: HandStats, frames: number) => (h.none / frames) * 100;

/**
 * Longest run with no 3D pose, in frames, or null when the metrics file
 * predates the field. The pipeline's own `longest_gap_frames` is never used in
 * its place: it disagrees with the lane on 25 of 32 hands, and a figure printed
 * beside a lane has to be one a reader can find on it.
 */
export function longestRun(h: HandStats): number | null {
  const v = (h as Partial<HandStats>).longestNoPoseFrames;
  return typeof v === "number" ? v : null;
}

/** What the card, the table and the viewer call a sample's public media. */
export const previewLabel = (s: HandPoseSample) =>
  s.preview === "video" ? "Video preview" : "Preview on request";

/* ── Per-hand points ──────────────────────────────────────────────────────── */

export interface HandPoint {
  sample: HandPoseSample;
  hand: Hand;
  value: number;
}

/** All 32 hands, one point each, for a metric. */
export function handPoints(metric: (h: HandStats) => number): HandPoint[] {
  return SAMPLES.flatMap((sample) => HANDS.map((hand) => ({ sample, hand, value: metric(sample[hand]) })));
}

export function median(values: number[]): number {
  const v = [...values].sort((a, b) => a - b);
  if (v.length === 0) return 0;
  const mid = v.length >> 1;
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/* ── Start here ───────────────────────────────────────────────────────────── */

export interface StartChip {
  /** The rule, in the words a reader would use for it. */
  label: string;
  sample: HandPoseSample;
  /** The figure that earned the sample its place. */
  sub: string;
}

const poseSub = (s: HandPoseSample) =>
  `${s.left.posePct.toFixed(1)}% / ${s.right.posePct.toFixed(1)}% with a 3D pose`;

/**
 * Where to begin, chosen by rule over all sixteen samples (every one opens with
 * its lane and its numbers, so none is held back for lacking media).
 *
 * The rules are applied in order and a sample an earlier chip already took is
 * skipped, so two chips never name the same sample. The first is the one with
 * footage; the other three are the extremes a buyer wants to see for
 * themselves: where both hands are best covered, where the most frames were
 * guessed, and where coverage is lowest. None is called "cleanest": the pose
 * share is coverage, and the page's own argument is that coverage is not
 * quality.
 */
export function startHere(): StartChip[] {
  const best = (score: (s: HandPoseSample) => number, dir: 1 | -1) =>
    SAMPLES.reduce((a, s) => (score(s) * dir > score(a) * dir ? s : a), SAMPLES[0]);

  const rules: { label: string; pick: () => HandPoseSample | undefined; sub: (s: HandPoseSample) => string }[] = [
    { label: "Video preview", pick: () => SAMPLES.find((s) => s.preview === "video"), sub: poseSub },
    { label: "Both hands, highest 3D pose share", pick: () => best((s) => s.minPosePct, 1), sub: poseSub },
    {
      label: "Highest guessed share",
      pick: () => best((s) => s.guessedOfDeliveredPct, 1),
      sub: (s) => `${s.guessedOfDeliveredPct.toFixed(1)}% of delivered`,
    },
    { label: "Lowest 3D pose share", pick: () => best((s) => s.minPosePct, -1), sub: poseSub },
  ];

  const used = new Set<string>();
  const out: StartChip[] = [];
  for (const r of rules) {
    const sample = r.pick();
    if (!sample || used.has(sample.slug)) continue;
    used.add(sample.slug);
    out.push({ label: r.label, sample, sub: r.sub(sample) });
  }
  return out;
}

/* ── Rig facts and aggregate shares not carried by HP_AGG ─────────────────── */

/** Bridged and no-3D-pose frames as shares of every hand-frame, from the counts. */
export const BRIDGED_OF_SLOTS_PCT = (HP_AGG.bridged / HP_AGG.handSlots) * 100;
export const NONE_OF_SLOTS_PCT = (HP_AGG.none / HP_AGG.handSlots) * 100;

export const JOINTS_PER_HAND = HANDPOSE.jointsPerHand;

/**
 * The sentence the spec requires wherever accuracy could be inferred, word for
 * word: once under the numbers' legend and once in the FAQ. One constant, so
 * the two cannot drift.
 */
export const NO_GROUND_TRUTH =
  "These are vision-estimated poses with self-consistency checks. No marker-based ground truth was captured, so we report coverage and misses, not joint error. Validate on your own held-out data.";
