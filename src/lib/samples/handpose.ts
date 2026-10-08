import metrics from "./handpose-metrics.json";

/**
 * The hand-pose set, typed.
 *
 * Every figure on /samples/hand-pose, in its CSV and in its lanes comes out of
 * one build (`scripts/samples/handpose/build-handpose-data.py`), which reads the
 * delivery metadata and the joints and asserts the two agree. Nothing here is
 * typed in by hand: a number that needs changing is changed in the data and
 * rebuilt, so the page, the table and the download cannot disagree.
 *
 * One exclusive state per hand per frame — measured, then guessed, then
 * bridged, else no 3D pose — and every count is a count of that array. The raw
 * flags overlap (a frame can carry guessed and bridged at once), which is how
 * the first draft of this page came to print two different bridged totals for
 * the same clip.
 */

/** 0 no 3D pose, 1 measured, 2 guessed, 3 bridged. Index into `STATES`. */
export type HandState = 0 | 1 | 2 | 3;
export type StateKey = "none" | "measured" | "guessed" | "bridged";
export type Hand = "left" | "right";

export interface HandStats {
  measured: number;
  guessed: number;
  /** Exclusive: bridged frames that are neither measured nor guessed. */
  bridged: number;
  /** Frames with no 3D pose for this hand. */
  none: number;
  /** (measured + guessed) / frames, one decimal. Bridged is not counted. */
  posePct: number;
  /**
   * `missing_pct` as the pipeline reports it. The formula behind it is not yet
   * confirmed by the data team, so it is never a headline figure and always
   * printed with that caveat.
   */
  missedPct: number;
  /**
   * Longest run of frames with no 3D pose for this hand, from the state array.
   * Not the pipeline's `gate.longest_gap_frames`, which disagrees with the
   * lane on 25 of the 32 hands — a figure printed beside a lane has to be one
   * a reader can find on it.
   */
  longestNoPoseFrames: number;
}

export type Preview = "video" | "poster" | "lane";

export interface HandPoseSample {
  n: number;
  slug: string;
  title: string;
  skillGroup: string;
  frames: number;
  seconds: number;
  left: HandStats;
  right: HandStats;
  measuredOfDeliveredPct: number;
  guessedOfDeliveredPct: number;
  minPosePct: number;
  bothHandsBand: "95+" | "80-95" | "<80";
  /**
   * What may be shown in public.
   * `video` — a skeleton loop and the full-length skeleton render (consent for
   * a public preview is on record); `poster` — one skeleton still; `lane` —
   * metrics and the state lane only.
   */
  preview: Preview;
  /** A passcode-gated sample pack exists. */
  pack: boolean;
  media: {
    poster: string | null;
    still: string | null;
    loop: string | null;
    video: string | null;
    videoSeconds: number | null;
  };
  loop: { start: number; frames: number; crossfadeFrames: number } | null;
  posterFrame: number | null;
  /** Public path of the full-resolution lane file. */
  lane: string;
  /** 200 bins per hand, one state code per bin, for thumbnails. */
  strip: { left: string; right: string };
}

export interface HandPoseAggregates {
  samples: number;
  frames: number;
  seconds: number;
  minutes: number;
  handSlots: number;
  measured: number;
  guessed: number;
  bridged: number;
  none: number;
  delivered: number;
  measuredOfDeliveredPct: number;
  guessedOfDeliveredPct: number;
  measuredOfSlotsPct: number;
  deliveredOfSlotsPct: number;
  durationMedianSec: number;
  durationMinSec: number;
  durationMaxSec: number;
  pose: { min: number; median: number; max: number; atLeast95: number; atLeast80: number; below50: number };
  bothHands: { atLeast95: number; from80to95: number; below80: number };
  preview: { video: number; poster: number; lane: number };
}

export interface HandPoseMetrics {
  source: string;
  fps: number;
  jointsPerHand: number;
  jointNames: string[];
  states: StateKey[];
  aggregates: HandPoseAggregates;
  samples: HandPoseSample[];
}

export const HANDPOSE = metrics as unknown as HandPoseMetrics;
export const HP_SAMPLES = HANDPOSE.samples;
export const HP_AGG = HANDPOSE.aggregates;
export const HP_FPS = HANDPOSE.fps;

export const HANDPOSE_SLUG = "hand-pose";
export const HANDPOSE_PATH = "/samples/hand-pose";
export const HANDPOSE_CSV = "/samples/hand-pose/hand-pose-metrics.csv";

export function handPoseSample(slug: string): HandPoseSample | null {
  return HP_SAMPLES.find((s) => s.slug === slug) ?? null;
}

/** "#13" — the number a buyer quotes back to us. */
export const sampleNo = (s: Pick<HandPoseSample, "n">) => `#${String(s.n).padStart(2, "0")}`;

/* ── State vocabulary ───────────────────────────────────────────────────────
   One source for every surface that names a state: the page legend, the modal
   legend, the lane's readout, the table's text alternative. Hue says which
   hand; the drawing style says how the frame was obtained, so colour is never
   the only cue (WCAG 1.4.1). */

export const STATES: StateKey[] = ["none", "measured", "guessed", "bridged"];

export const STATE_LABEL: Record<StateKey, string> = {
  measured: "Measured",
  guessed: "Guessed",
  bridged: "Bridged",
  none: "No 3D pose",
};

/** How each state is drawn, in words — the non-colour cue, spelled out. */
export const STATE_DRAWING: Record<StateKey, string> = {
  measured: "Solid bones, filled joints",
  guessed: "Dashed bones, hollow joints",
  bridged: "Dotted bones, small rings",
  none: "Left empty",
};

export const STATE_DEFINITION: Record<StateKey, string> = {
  measured: "Both cameras saw the hand; its 21 joints were triangulated.",
  guessed:
    "One camera saw the hand. The pose is a single-camera estimate scaled to the wearer's measured hand size. Flagged in every file.",
  bridged: "A short gap between two measured frames, filled in and flagged. Counted on its own, not in the 3D pose share.",
  none: "No 3D pose delivered for this frame (out of view, or detected in 2D but not triangulated).",
};

/** Lower-case state names for running text: the readout, aria-valuetext, sentences. */
export const STATE_WORD: Record<StateKey, string> = {
  measured: "measured",
  guessed: "guessed",
  bridged: "bridged",
  none: "no 3D pose",
};

export const HAND_LABEL: Record<Hand, string> = { left: "Left", right: "Right" };

/**
 * Hand hues, as CSS custom properties declared under `.samples-scope` in
 * globals.css. Okabe-Ito sky blue and orange on the dark ground, stepped darker
 * on the light one so they still clear 3:1 as graphics. Skeleton renders are
 * media and keep the dark-ground pair in both themes.
 */
export const HAND_COLOR: Record<Hand, string> = {
  left: "var(--hp-left)",
  right: "var(--hp-right)",
};

/* ── Joints ─────────────────────────────────────────────────────────────────
   Wrist, then thumb, index, middle, ring and little, four joints each,
   numbered outwards from the wrist — the 21-point layout the OpenPose and
   MediaPipe hand models use. It is NOT the native MANO order, and the page
   must never say it is. Read off the data (20 constant-length bones, distance
   from the wrist rising along each chain), so the keys are published and
   per-joint anatomical names are not: those would be an inference. */

export const FINGERS = ["thumb", "index", "middle", "ring", "little"] as const;

export const JOINTS: { index: number; key: string; finger: string; position: number | null }[] = [
  { index: 0, key: "wrist", finger: "wrist", position: null },
  ...FINGERS.flatMap((finger, f) =>
    [1, 2, 3, 4].map((position) => ({
      index: 1 + f * 4 + (position - 1),
      key: `${finger}_${position}`,
      finger,
      position,
    })),
  ),
];

/* ── The passcode sample pack ───────────────────────────────────────────────
   What `hand-pose-NN-pack.zip` holds, for the page's field table and the
   record's spec rows. Written by `scripts/samples/handpose/pack-handpose-assets.py`;
   keep the two in step. Arrays run the whole clip, one row per frame. */

export const PACK_FILES: { name: string; what: string }[] = [
  { name: "joints.npz", what: "Joints, states and flags for both hands, one row per frame" },
  { name: "hand-pose-NN.rrd", what: "Both hands in 3D for Rerun, no camera pixels" },
  { name: "metadata.json", what: "The sample's metrics and the state glossary" },
  { name: "README.txt", what: "Field table, coordinate frame, joint order and a loader" },
  { name: "SHA256SUMS", what: "Checksums for every file above" },
];

export const PACK_FIELDS: { name: string; shape: string; dtype: string; unit: string; meaning: string }[] = [
  {
    name: "left_joints, right_joints",
    shape: "(N, 21, 3)",
    dtype: "float32",
    unit: "metres",
    meaning: "Joint positions in the head-rig frame. NaN where the state is 0.",
  },
  {
    name: "left_state, right_state",
    shape: "(N,)",
    dtype: "uint8",
    unit: "—",
    meaning:
      "One exclusive state per frame: 0 no 3D pose, 1 measured, 2 guessed, 3 bridged. Where raw flags overlap, measured wins, then guessed, then bridged. Every count on this page is computed from it.",
  },
  {
    name: "left_only2d, right_only2d",
    shape: "(N,)",
    dtype: "bool",
    unit: "—",
    meaning:
      "The pipeline's 2D-only flag: a 2D hand detection exists for the frame but no 3D pose was triangulated. Set on most frames with no 3D pose, and on some guessed frames.",
  },
  {
    name: "left_view_count, right_view_count",
    shape: "(N,)",
    dtype: "uint8",
    unit: "—",
    meaning: "Camera views the pipeline counted for the frame. Use the state array, not this field, to tell measured from guessed.",
  },
  {
    name: "left_confidence, right_confidence",
    shape: "(N,)",
    dtype: "float32",
    unit: "—",
    meaning: "The pipeline's confidence score. Not a calibrated probability. NaN where the state is 0.",
  },
  { name: "joint_names", shape: "(21,)", dtype: "str", unit: "—", meaning: "Joint keys in array order (table above)." },
  { name: "fps", shape: "()", dtype: "int", unit: "frames/s", meaning: "30. Frame i is at i / 30 seconds." },
];

/* ── Lanes ──────────────────────────────────────────────────────────────── */

/** [state, start frame, length]. Runs cover the clip exactly. */
export type Run = [HandState, number, number];

export interface HandPoseLane {
  slug: string;
  frames: number;
  fps: number;
  states: StateKey[];
  left: Run[];
  right: Run[];
}

/** State of a hand at a frame. Binary search: a lane can hold a few hundred runs. */
export function stateAt(runs: Run[], frame: number): HandState {
  let lo = 0;
  let hi = runs.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const [st, start, len] = runs[mid];
    if (frame < start) hi = mid - 1;
    else if (frame >= start + len) lo = mid + 1;
    else return st;
  }
  return 0;
}

/** A 200-character strip back into runs, in bins. */
export function stripRuns(strip: string): Run[] {
  const out: Run[] = [];
  for (let i = 0; i < strip.length; i++) {
    const st = Number(strip[i]) as HandState;
    const last = out[out.length - 1];
    if (last && last[0] === st) last[2] += 1;
    else out.push([st, i, 1]);
  }
  return out;
}

/* ── Formatting ─────────────────────────────────────────────────────────────
   Percentages to one decimal everywhere, counts exact. */

export const fmtPct = (v: number) => `${v.toFixed(1)}%`;
export const fmtCount = (v: number) => v.toLocaleString("en-US");
export const fmtSec = (v: number) => `${v.toFixed(1)} s`;

/** Rounded to the nearest second first, so 74.6 s reads 1:15 and 59.7 s never reads "0:60". */
export function mmss(totalSec: number) {
  const t = Math.round(totalSec);
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/** Frame index to seconds at the set's frame rate. */
export const frameToSec = (frame: number) => frame / HP_FPS;
