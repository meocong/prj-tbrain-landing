import { HP_FPS, STATES, STATE_WORD, stateAt, type Run } from "@/lib/samples/handpose";

/**
 * Frame arithmetic for the record viewer, kept apart from the components so the
 * slider, the readout, the video sync and the run table all use ONE definition of
 * "which frame is this" and "what does that frame say".
 *
 * A frame `f` covers the half-open span [f / fps, (f + 1) / fps) of the clip, and
 * the lane draws it as [f / N, (f + 1) / N) of its width. Everything below follows
 * from that.
 */

/** Height of one hand's row on the lane, and of the same row where the lane is the whole preview. */
export const LANE_ROW = 22;
export const LANE_ROW_HERO = 36;

/** Keep a frame inside the clip. Also rounds, so a stray fraction cannot index a run. */
export const clampFrame = (frame: number, frames: number) =>
  Math.min(frames - 1, Math.max(0, Math.round(frame)));

/**
 * Where a seek to `frame` aims: the middle of the frame, not its first instant.
 * `currentTime` snaps to a decoded frame boundary in some engines, and a target
 * sitting exactly on `f / fps` can land on frame f - 1 when the division rounds
 * down; half a frame of slack lands on f in all of them.
 */
export const frameMidTime = (frame: number) => (frame + 0.5) / HP_FPS;

/**
 * The frame a playback position falls in. The epsilon (a thousandth of a frame)
 * is for positions that ARE a frame boundary: frame 123 starts at 4.1 s, and
 * 4.1 * 30 is 122.99999999999999, which floors to the frame before. 47 of the
 * first 2,300 frames are like that.
 */
export const frameOfTime = (seconds: number, frames: number) =>
  clampFrame(Math.floor(seconds * HP_FPS + 1e-3), frames);

/** The state word ("measured", "no 3D pose") a hand has at a frame. */
export const stateWordAt = (runs: Run[], frame: number) => STATE_WORD[STATES[stateAt(runs, frame)]];

/**
 * The slider's `aria-valuetext`. Digits are not grouped on purpose: a screen
 * reader reads "1,215" as "one, two hundred fifteen" in some voices.
 */
export function valueText(frame: number, frames: number, seconds: string, left: string, right: string) {
  return `frame ${frame} of ${frames}, ${seconds} s, left ${left}, right ${right}`;
}
