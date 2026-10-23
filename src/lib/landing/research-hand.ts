/**
 * The research hero's data: one recorded demonstration's 3D hand joints and
 * per-frame states — numbers only, no camera pixels.
 *
 * Copied from the hand-pose sample library (sample 13, the one with recorded
 * operator consent): public/research/hand-13/{joints.bin,joints.json,lanes.json}.
 * Format and decoding follow src/lib/samples/handpose-joints.ts on the
 * hand-pose branch, kept separate so this page does not depend on that
 * feature's production gate.
 *
 *   joints.bin  int16 LE [count][2 hands: left, right][21 joints][x y z] in mm
 *               (2 mm quantised, -32768 = missing), then uint8 [count][2]
 *               states: 0 none, 1 measured, 2 guessed, 3 bridged.
 *   axes        the wearer's: x right, y up, z forward, origin at the head rig.
 *   lanes.json  the same states at the camera's 30 fps, run-length encoded
 *               as [state, startFrame, length].
 *
 * Scale is not shown anywhere on the page: units are unconfirmed for public
 * use, so the figure draws shape and motion, never centimetres.
 */

export const DATA_BASE = "/research/hand-13";
export const JOINTS = 21;
export const HANDS = 2;
export const HAND_FLOATS = JOINTS * 3;

/** Wrist-out chains, as joint index pairs. */
export const BONES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [0, 9], [9, 10], [10, 11], [11, 12],
  [0, 13], [13, 14], [14, 15], [15, 16],
  [0, 17], [17, 18], [18, 19], [19, 20],
];

/** Tbrain's violet and the logo's blue: far enough apart in lightness to tell
    the two hands apart, and the page's own brand colours. */
export const HAND_COLORS = { left: "#6C3CF4", right: "#0EA5E9" } as const;

export type HandState = 0 | 1 | 2 | 3;
export const STATE_NAMES = ["none", "measured", "guessed", "bridged"] as const;

export interface JointTrack {
  fps: number;
  count: number;
  /** Metres, [count][hand][joint][xyz]; NaN where missing. */
  pos: Float32Array;
  /** [count][hand]. */
  state: Uint8Array;
  centre: [number, number, number];
  floor: number;
}

export interface Lanes {
  frames: number;
  fps: number;
  left: [HandState, number, number][];
  right: [HandState, number, number][];
}

const MISSING = -32768;
export const handOffset = (i: number, h: number) => (i * HANDS + h) * HAND_FLOATS;

function parse(meta: { fps: number; count: number }, buf: ArrayBuffer): JointTrack {
  const { count } = meta;
  const posBytes = count * HANDS * HAND_FLOATS * 2;
  if (buf.byteLength !== posBytes + count * HANDS) throw new Error("joints: unexpected size");
  const raw = new Int16Array(buf, 0, count * HANDS * HAND_FLOATS);
  const state = new Uint8Array(buf.slice(posBytes));
  const pos = new Float32Array(raw.length);
  let minY = Infinity;
  for (let i = 0; i < raw.length; i++) {
    const v = raw[i];
    pos[i] = v === MISSING ? NaN : v / 1000;
    if (i % 3 === 1 && v !== MISSING && pos[i] < minY) minY = pos[i];
  }
  const c = [0, 0, 0];
  let n = 0;
  for (let i = 0; i < count; i++) {
    for (let h = 0; h < HANDS; h++) {
      const o = handOffset(i, h);
      if (state[i * HANDS + h] > 0 && !Number.isNaN(pos[o])) {
        c[0] += pos[o];
        c[1] += pos[o + 1];
        c[2] += pos[o + 2];
        n++;
      }
    }
  }
  n = Math.max(1, n);
  return { fps: meta.fps, count, pos, state, centre: [c[0] / n, c[1] / n, c[2] / n], floor: minY };
}

let cache: Promise<{ track: JointTrack; lanes: Lanes }> | null = null;

export function loadHandData() {
  if (!cache) {
    cache = Promise.all([
      fetch(`${DATA_BASE}/joints.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
      fetch(`${DATA_BASE}/joints.bin`).then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(String(r.status))))),
      fetch(`${DATA_BASE}/lanes.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))),
    ]).then(([meta, buf, lanes]) => ({ track: parse(meta, buf), lanes: lanes as Lanes }));
    cache.catch(() => {
      cache = null;
    });
  }
  return cache;
}

/** Both hands at time `t` (s) into `out` (2×63) and `states` (2); blends
    between the 15 fps samples when a hand is present in both. */
export function poseAt(track: JointTrack, t: number, out: Float32Array, states: Uint8Array) {
  const last = track.count - 1;
  const p = Math.min(last, Math.max(0, t * track.fps));
  const i0 = Math.floor(p);
  const i1 = Math.min(last, i0 + 1);
  const a = p - i0;
  const near = a < 0.5 ? i0 : i1;
  for (let h = 0; h < HANDS; h++) {
    const s0 = track.state[i0 * HANDS + h];
    const s1 = track.state[i1 * HANDS + h];
    const sn = track.state[near * HANDS + h];
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

/** Share of the clip's frames with a measured pose, per hand, from the lanes. */
export function measuredShare(lanes: Lanes) {
  const share = (runs: Lanes["left"]) => runs.reduce((s, [st, , len]) => s + (st === 1 ? len : 0), 0) / lanes.frames;
  return { left: share(lanes.left), right: share(lanes.right) };
}

/** A moment where both hands are measured, for the still frame under reduced motion. */
export const STILL_T = 529 / 15;

/* ── Derived signals (computed in the browser from the joint track) ───────
   Both are normalised to 0..1 against the clip's own 5th–95th percentile:
   the joints' absolute scale is unconfirmed, so the figure shows shape over
   time, never millimetres. NaN where the hand has no measured pose. */

const THUMB_TIP = 4;
const INDEX_TIP = 8;

function normalise(v: Float32Array) {
  const ok = Array.from(v).filter((x) => !Number.isNaN(x)).sort((a, b) => a - b);
  if (!ok.length) return v;
  const lo = ok[Math.floor(ok.length * 0.05)];
  const hi = ok[Math.floor(ok.length * 0.95)];
  const span = Math.max(1e-6, hi - lo);
  const out = new Float32Array(v.length);
  for (let i = 0; i < v.length; i++) out[i] = Number.isNaN(v[i]) ? NaN : Math.min(1, Math.max(0, (v[i] - lo) / span));
  return out;
}

export interface Derived {
  /** Thumb-tip to index-tip distance — the signal a two-jaw gripper's opening is retargeted from. */
  aperture: Float32Array;
  /** Wrist speed between neighbouring samples. */
  speed: Float32Array;
  /** Which hand the signals follow (0 left, 1 right): the one measured most often. */
  hand: number;
}

export function derive(track: JointTrack): Derived {
  let best = 0;
  let bestN = -1;
  for (let h = 0; h < HANDS; h++) {
    let n = 0;
    for (let i = 0; i < track.count; i++) if (track.state[i * HANDS + h] === 1) n++;
    if (n > bestN) {
      bestN = n;
      best = h;
    }
  }
  const ap = new Float32Array(track.count);
  const sp = new Float32Array(track.count);
  const p = track.pos;
  for (let i = 0; i < track.count; i++) {
    const measured = track.state[i * HANDS + best] === 1;
    const o = handOffset(i, best);
    if (!measured || Number.isNaN(p[o])) {
      ap[i] = NaN;
      sp[i] = NaN;
      continue;
    }
    const a = o + THUMB_TIP * 3;
    const b = o + INDEX_TIP * 3;
    ap[i] = Math.hypot(p[a] - p[b], p[a + 1] - p[b + 1], p[a + 2] - p[b + 2]);
    const j = i - 1;
    if (j >= 0 && track.state[j * HANDS + best] === 1) {
      const q = handOffset(j, best);
      sp[i] = Math.hypot(p[o] - p[q], p[o + 1] - p[q + 1], p[o + 2] - p[q + 2]) * track.fps;
    } else sp[i] = NaN;
  }
  // Light smoothing so 2 mm quantisation does not read as jitter.
  const smooth = (v: Float32Array) => {
    const out = new Float32Array(v.length);
    for (let i = 0; i < v.length; i++) {
      let s = 0;
      let n = 0;
      for (let k = -2; k <= 2; k++) {
        const x = v[i + k];
        if (x !== undefined && !Number.isNaN(x)) {
          s += x;
          n++;
        }
      }
      out[i] = Number.isNaN(v[i]) || !n ? NaN : s / n;
    }
    return out;
  };
  return { aperture: normalise(smooth(ap)), speed: normalise(smooth(sp)), hand: best };
}

/** SVG path for a 0..1 series over `width`×`height`, broken at NaN gaps. */
export function seriesPath(v: Float32Array, width: number, height: number, pad = 2) {
  let d = "";
  let pen = false;
  const n = v.length;
  for (let i = 0; i < n; i++) {
    const y = v[i];
    if (Number.isNaN(y)) {
      pen = false;
      continue;
    }
    const x = (i / (n - 1)) * width;
    const yy = pad + (1 - y) * (height - pad * 2);
    d += `${pen ? "L" : "M"}${x.toFixed(1)} ${yy.toFixed(1)}`;
    pen = true;
  }
  return d;
}
