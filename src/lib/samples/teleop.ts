import fs from "node:fs";
import path from "node:path";

/**
 * One teleoperation episode, opened up.
 *
 * Every other category sells what a camera saw. This one sells a row per frame:
 * sixteen numbers for the state the arms were in, sixteen for the action
 * commanded, thirty times a second. The page showed three videos and said "16
 * dimensional" in a caption, which is the fact and not the product.
 *
 * Read from `episode_000000.parquet` in the LeRobot set — 1,444 rows, kept at
 * every sixth so 241 survive, rounded to three decimals. The full frame is 370
 * KB of JSON for a chart 900 px wide; three decimals is below a pixel at any
 * scale this draws at.
 *
 * The segment map is the dataset's own `meta/modality.json`, not a guess:
 * state[0:7] left arm, [7:14] right arm, [14:15] left gripper, [15:16] right
 * gripper, and action laid out identically.
 */

export interface TeleopSegment {
  name: string;
  start: number;
  end: number;
}

export interface TeleopEpisode {
  episode: number;
  frames: number;
  fps: number;
  durationSec: number;
  segments: TeleopSegment[];
  t: number[];
  state: number[][];
  action: number[][];
}

export function teleopEpisode(): TeleopEpisode | null {
  try {
    // Written by `ingest-approved.py` from the approved LeRobot set: the
    // episode the page plays, every frame, with the segment map derived from
    // the feature names in `meta/info.json`.
    const p = path.join(process.cwd(), "public", "samples", "telemetry", "teleop-anatomy.json");
    return JSON.parse(fs.readFileSync(p, "utf8")) as TeleopEpisode;
  } catch {
    return null;
  }
}

/**
 * Below this, a segment did not move: sensor noise on a stationary joint, not
 * motion. Measured on episodes 0 and 5, the left arm's state stays inside
 * ±0.003 rad and its action is identically 0.0.
 */
export const INERT_EPS = 0.02;

/** One channel as a 0-100 polyline, plus what it actually spans. */
export interface Channel {
  /** Column index in the 16-wide vector. */
  i: number;
  state: string;
  action: string;
  min: number;
  max: number;
}

/**
 * Whether a segment was commanded at all in this episode.
 *
 * The set is described as bimanual and the rig is; the recording is not. Across
 * episodes 0 and 5 the left arm's action is exactly 0.0 for every frame and its
 * state never leaves ±0.003 rad. Drawing seven flat lines would look like a
 * rendering fault, and saying nothing would let a buyer plan a bimanual policy
 * on a single-arm recording.
 */
export function isInert(ep: TeleopEpisode, seg: TeleopSegment): boolean {
  // Per channel, not pooled across the segment. A parked arm holds each joint
  // at its own constant angle, so the pooled range is the spread BETWEEN seven
  // still joints — 0.19 rad on the approved set's right arm — and a pooled test
  // called it moving and drew seven flat lines.
  return maxSpan(ep.state, seg) < INERT_EPS && maxSpan(ep.action, seg) < INERT_EPS;
}

/** Largest single-channel range inside a segment. */
function maxSpan(rows: number[][], seg: TeleopSegment): number {
  let widest = 0;
  for (let c = seg.start; c < seg.end; c++) {
    let lo = Infinity;
    let hi = -Infinity;
    for (const row of rows) {
      if (row[c] < lo) lo = row[c];
      if (row[c] > hi) hi = row[c];
    }
    if (hi - lo > widest) widest = hi - lo;
  }
  return widest;
}

/**
 * The state half of a segment carries no reading while the action half moves.
 *
 * The approved set's wrist-pose columns: action holds the commanded wrist
 * position and orientation, state holds (0, 0, 0) and the identity quaternion on
 * every frame. Drawn as two series that reads as an arm failing to follow its
 * command; the truth is that the dataset does not record the measured wrist pose
 * at all, and a buyer planning to train on it needs to know that.
 */
export function stateUnrecorded(ep: TeleopEpisode, seg: TeleopSegment): boolean {
  return maxSpan(ep.state, seg) < INERT_EPS && maxSpan(ep.action, seg) >= INERT_EPS;
}

/**
 * Channels for one segment, on a scale shared across that segment.
 *
 * Shared within a segment and not across all sixteen: the seven arm joints are
 * radians and comparable, the gripper is not, and one scale over both would
 * flatten every joint to hold a gripper that moves through a different range.
 */
export function channelsFor(ep: TeleopEpisode, seg: TeleopSegment): Channel[] {
  const cols = Array.from({ length: seg.end - seg.start }, (_, k) => seg.start + k);

  let lo = Infinity;
  let hi = -Infinity;
  for (const row of [...ep.state, ...ep.action]) {
    for (const c of cols) {
      if (row[c] < lo) lo = row[c];
      if (row[c] > hi) hi = row[c];
    }
  }
  const span = hi - lo || 1;
  const n = ep.t.length;
  const line = (rows: number[][], c: number) =>
    rows
      .map((row, k) => `${((k / (n - 1)) * 100).toFixed(2)},${(100 - ((row[c] - lo) / span) * 100).toFixed(2)}`)
      .join(" ");

  return cols.map((c) => ({
    i: c,
    state: line(ep.state, c),
    action: line(ep.action, c),
    min: lo,
    max: hi,
  }));
}
