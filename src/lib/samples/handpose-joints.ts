import type { HandState } from "./handpose";

/**
 * The public 3D joints of every sample: joints and states only, no camera pixels.
 *
 * One file per sample, `/samples/hand-pose/joints/hand-pose-NN.bin`, written by
 * `scripts/samples/handpose/export-joints.py` at half the video's frame rate
 * (every second frame). Fetched in the browser when a player mounts and never
 * read from disk on the server, so `public/` stays out of the serverless bundle.
 *
 *   int16 little-endian [count][2 hands: left, right][21 joints][x y z], millimetres,
 *   then uint8 [count][2] states (0 none, 1 measured, 2 guessed, 3 bridged).
 *
 * -32768 marks a missing value. Axes are the wearer's: x right, y up, z forward,
 * origin at the head rig. The joint order is the one in `handpose.ts`.
 */

export const JOINT_COUNT = 21;
/** Left, right. */
export const HAND_COUNT = 2;
/** Floats per hand in a sampled pose: 21 joints times xyz. */
export const HAND_FLOATS = JOINT_COUNT * 3;

/** Bones as joint index pairs: the five chains from the wrist, 20 in all. */
export const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

export const THUMB_TIP = 4;
export const INDEX_TIP = 8;

export interface JointTrack {
  slug: string;
  /** Samples per second of the track (15, against the video's 30). */
  fps: number;
  count: number;
  /** Metres, [count][hand][joint][xyz]. NaN where the sample is missing. */
  pos: Float32Array;
  /** [count][hand]. */
  state: Uint8Array;
  /** Extent of every joint that is present, in metres. */
  bounds: { min: [number, number, number]; max: [number, number, number] };
  /** Mean wrist position of every present sample, a place for a camera to look. */
  centre: [number, number, number];
}

interface TrackMeta {
  slug: string;
  fps: number;
  count: number;
  missing: number;
}

const MISSING = -32768;

/** Offset into `pos` of one hand's joint 0 at sample `i`. */
export const handOffset = (i: number, hand: number) => (i * HAND_COUNT + hand) * HAND_FLOATS;

function parse(meta: TrackMeta, buf: ArrayBuffer): JointTrack {
  const { count } = meta;
  const posBytes = count * HAND_COUNT * HAND_FLOATS * 2;
  if (buf.byteLength !== posBytes + count * HAND_COUNT) throw new Error("joints: unexpected size");
  const raw = new Int16Array(buf, 0, count * HAND_COUNT * HAND_FLOATS);
  const state = new Uint8Array(buf.slice(posBytes));
  const pos = new Float32Array(raw.length);
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  const wrist = [0, 0, 0];
  let wristN = 0;
  for (let i = 0; i < raw.length; i++) {
    const v = raw[i];
    if (v === MISSING) {
      pos[i] = NaN;
      continue;
    }
    const m = v / 1000;
    pos[i] = m;
    const axis = i % 3;
    if (m < min[axis]) min[axis] = m;
    if (m > max[axis]) max[axis] = m;
  }
  for (let i = 0; i < count; i++) {
    for (let h = 0; h < HAND_COUNT; h++) {
      const o = handOffset(i, h);
      if (state[i * HAND_COUNT + h] > 0 && !Number.isNaN(pos[o])) {
        wrist[0] += pos[o];
        wrist[1] += pos[o + 1];
        wrist[2] += pos[o + 2];
        wristN++;
      }
    }
  }
  const n = Math.max(1, wristN);
  return {
    slug: meta.slug,
    fps: meta.fps,
    count,
    pos,
    state,
    bounds: { min, max },
    centre: [wrist[0] / n, wrist[1] / n, wrist[2] / n],
  };
}

const cache = new Map<string, Promise<JointTrack>>();

/** The track for a sample, fetched once per page and shared by every view of it. */
export function loadJointTrack(slug: string): Promise<JointTrack> {
  let p = cache.get(slug);
  if (!p) {
    const base = `/samples/hand-pose/joints/${slug}`;
    p = Promise.all([
      fetch(`${base}.json`).then((r) => (r.ok ? (r.json() as Promise<TrackMeta>) : Promise.reject(new Error(String(r.status))))),
      fetch(`${base}.bin`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status))))),
    ]).then(([meta, buf]) => parse(meta, buf));
    // A failed load is not cached, so "Try again" can try again.
    p.catch(() => cache.delete(slug));
    cache.set(slug, p);
  }
  return p;
}

/**
 * Both hands at time `t` (seconds of the video), written into `out`
 * (2 * 63 floats) and `states` (2). The track runs at half the video's rate, so
 * between two samples a hand that is present in both is blended; otherwise it
 * shows the nearer sample and nothing at all when that one has no pose.
 */
export function poseAt(track: JointTrack, t: number, out: Float32Array, states: Uint8Array) {
  const last = track.count - 1;
  const p = Math.min(last, Math.max(0, t * track.fps));
  const i0 = Math.floor(p);
  const i1 = Math.min(last, i0 + 1);
  const a = p - i0;
  const near = a < 0.5 ? i0 : i1;
  for (let h = 0; h < HAND_COUNT; h++) {
    const s0 = track.state[i0 * HAND_COUNT + h];
    const s1 = track.state[i1 * HAND_COUNT + h];
    const sn = track.state[near * HAND_COUNT + h];
    const o = h * HAND_FLOATS;
    states[h] = sn;
    if (sn === 0) continue;
    if (s0 > 0 && s1 > 0 && i0 !== i1) {
      const o0 = handOffset(i0, h);
      const o1 = handOffset(i1, h);
      for (let k = 0; k < HAND_FLOATS; k++) out[o + k] = track.pos[o0 + k] * (1 - a) + track.pos[o1 + k] * a;
    } else {
      const on = handOffset(near, h);
      for (let k = 0; k < HAND_FLOATS; k++) out[o + k] = track.pos[on + k];
    }
  }
}

/** Index of the track sample nearest to `t`. */
export const sampleIndexAt = (track: JointTrack, t: number) =>
  Math.min(track.count - 1, Math.max(0, Math.round(t * track.fps)));

export interface HandReading {
  state: HandState;
  /** Wrist, centimetres. */
  wrist: [number, number, number] | null;
  /** Thumb tip to index tip, millimetres. */
  pinchMm: number | null;
  /** Wrist speed, centimetres per second, from the samples either side. */
  speedCms: number | null;
}

const dist = (p: Float32Array, a: number, b: number) => Math.hypot(p[a] - p[b], p[a + 1] - p[b + 1], p[a + 2] - p[b + 2]);

/** What the readout shows for one hand at time `t`. A hand with no 3D pose reads as nothing. */
export function readHand(track: JointTrack, t: number, hand: number): HandReading {
  const i = sampleIndexAt(track, t);
  const state = track.state[i * HAND_COUNT + hand] as HandState;
  if (state === 0) return { state, wrist: null, pinchMm: null, speedCms: null };
  const o = handOffset(i, hand);
  const w = track.pos;
  // Central difference where both neighbours exist, one-sided where only one
  // does. Positions are quantised to 2 mm and sampled at 15 per second, so the
  // figure carries about 3 cm/s of rounding and is not worth more digits.
  const ok = (j: number) => j >= 0 && j < track.count && track.state[j * HAND_COUNT + hand] > 0;
  let lo = i - 1;
  let hi = i + 1;
  if (!ok(lo)) lo = i;
  if (!ok(hi)) hi = i;
  let speedCms: number | null = null;
  if (hi !== lo) {
    const d = dist(w, handOffset(hi, hand), handOffset(lo, hand));
    speedCms = (d * 100 * track.fps) / (hi - lo);
  }
  return {
    state,
    wrist: [w[o] * 100, w[o + 1] * 100, w[o + 2] * 100],
    pinchMm: dist(w, o + THUMB_TIP * 3, o + INDEX_TIP * 3) * 1000,
    speedCms,
  };
}
