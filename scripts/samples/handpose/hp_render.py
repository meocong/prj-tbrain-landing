"""Skeleton renderer for the hand-pose previews (library; the CLI is render-skeleton.py).

What it draws: the delivered 21-joint hands of one sample on a dark ground, seen
by a virtual camera. No camera pixels, no mesh, no baked legend and no text
except the L / R glyph at each wrist.

Hue says which hand (left sky blue, right orange); pattern says how the frame
was obtained:
    measured  solid bones, filled joints, filled palm
    guessed   dashed bones, hollow rings, dashed palm outline
    bridged   dotted bones, small hollow rings
    none      nothing is drawn

The soft light around the bones is blurred and added to the ground BEFORE any line
is drawn, so every bone, joint and ring keeps exactly its palette colour (an
additive glow laid over the lines would lighten them by about a fifth).

Which frame is shown on a still is chosen for how well it reads as a pair of hands:
large, apart, no crossed fingers, each palm turned towards the camera (an edge-on
palm collapses into a bar and loses its polygon) and no hand curled into a cluster.

The virtual camera
  * looks along the mean optical axis of the head rig's stereo pair, pitched down
    a little (chosen per sample) so the hands are seen from above and behind;
  * sits one metre from the hands' centre with the depth clamped, so near-camera
    perspective cannot stretch the fingers;
  * has generic intrinsics: focal length and principal point are fitted per
    sample so both hands stay inside the frame. The calibration file is read
    only to orient the camera (a direction); no calibration number is output.
"""

from __future__ import annotations

import json
import subprocess
import warnings
from dataclasses import dataclass

import cv2
import numpy as np

from hp_common import GUESSED, MEASURED, NONE, SIDES, Hands, Sample, check

# ------------------------------------------------------------------ look ----

BG_RGB = (0x0E, 0x0C, 0x24)
LEFT_RGB = (0x56, 0xB4, 0xE9)   # sky blue
RIGHT_RGB = (0xE6, 0x9F, 0x00)  # orange
SIDE_RGB = {"left": LEFT_RGB, "right": RIGHT_RGB}


def bgr(rgb):
    return (int(rgb[2]), int(rgb[1]), int(rgb[0]))


BG = bgr(BG_RGB)
COL = {s: bgr(c) for s, c in SIDE_RGB.items()}

# Finger bones (full weight) and the wrist-to-knuckle spokes (lighter, they sit inside the palm).
FINGER_BONES = [(0, 1), (1, 2), (2, 3), (3, 4),
                (5, 6), (6, 7), (7, 8),
                (9, 10), (10, 11), (11, 12),
                (13, 14), (14, 15), (15, 16),
                (17, 18), (18, 19), (19, 20)]
SPOKES = [(0, 5), (0, 9), (0, 13), (0, 17)]
ALL_BONES = FINGER_BONES + SPOKES
PALM = [0, 1, 5, 9, 13, 17]
TIPS = (4, 8, 12, 16, 20)
HAND_NOMINAL_M = 0.13          # generic hand length, only used to size line weights (not read from data)
TRAIL_FRAMES = 30
DIST = 1.0                     # virtual camera distance to the hands' centre, metres
ZMIN_FRAC = 0.25               # projection depth is clamped to this share of DIST
GLYPH_OFFSET, GLYPH_R = 21.0, 9.5   # L / R ring: centre offset behind the wrist and radius, in style units
GLYPH_REACH_M = 0.036          # the same extent as a length (framing uses it before the zoom is known)
GLOW_GAIN = 0.30               # strength of the soft light around the bones, added before the lines are drawn
# Frame choice (hand_clarity): a palm turned at least this much towards the camera (cosine of the angle between its
# normal and the ray to it) reads fully; finger extension (mean fingertip-to-wrist distance over knuckle-to-wrist
# distance, view independent) below CURL_ZERO is a hand curled into a cluster, above CURL_FULL the fingers read.
FACING_FULL = 0.60
CURL_ZERO, CURL_FULL = 0.85, 1.25
CLARITY_FLOOR = 0.02           # keeps the ordering by size when every candidate frame reads badly

# ------------------------------------------------------------ palette check -

# Machado, Oliveira & Fernandes (2009), severity 1.0, applied to linear sRGB.
MACHADO = {
    "protanopia": np.array([[0.152286, 1.052583, -0.204868],
                            [0.114503, 0.786281, 0.099216],
                            [-0.003882, -0.048116, 1.051998]]),
    "deuteranopia": np.array([[0.367322, 0.860646, -0.227968],
                              [0.280085, 0.672501, 0.047413],
                              [-0.011820, 0.042940, 0.968881]]),
}
_SRGB_TO_XYZ = np.array([[0.4124564, 0.3575761, 0.1804375],
                         [0.2126729, 0.7151522, 0.0721750],
                         [0.0193339, 0.1191920, 0.9503041]])
_D65 = np.array([0.95047, 1.0, 1.08883])


def _to_linear(rgb8):
    c = np.asarray(rgb8, float) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def _lab(linear_rgb):
    xyz = _SRGB_TO_XYZ @ np.clip(linear_rgb, 0.0, 1.0) / _D65
    f = np.where(xyz > (6 / 29) ** 3, np.cbrt(xyz), xyz / (3 * (6 / 29) ** 2) + 4 / 29)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def delta_e76(rgb_a, rgb_b, sim=None):
    """CIELAB deltaE76 between two sRGB colours, optionally as seen with a simulated deficiency."""
    la, lb = _to_linear(rgb_a), _to_linear(rgb_b)
    if sim:
        la, lb = MACHADO[sim] @ la, MACHADO[sim] @ lb
    return float(np.linalg.norm(_lab(la) - _lab(lb)))


def check_palette(min_delta: float = 40.0) -> dict:
    """deltaE76 between the left and right colours as a deuteranope and a protanope see them."""
    out = {"normal": delta_e76(LEFT_RGB, RIGHT_RGB)}
    for sim in ("deuteranopia", "protanopia"):
        out[sim] = delta_e76(LEFT_RGB, RIGHT_RGB, sim)
    for sim in ("deuteranopia", "protanopia"):
        check(out[sim] >= min_delta, f"palette: left/right deltaE under {sim} is {out[sim]:.1f}, below {min_delta}")
    return out


# --------------------------------------------------------------- camera -----

def _qrot(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def rig_axes(sample: Sample):
    """(forward, down, right) of the stereo pair's mean optical axis, in the delivered joint frame.

    Only directions are taken from the calibration file; nothing from it is returned
    as a number or written anywhere."""
    try:
        with open(sample.calibration_path, encoding="utf-8") as fh:
            cams = json.load(fh)["cameras"]
    except OSError:
        raise SystemExit(f"{sample.slug}: cannot read the rig orientation") from None
    fs, ds = [], []
    for k in ("mid_left", "mid_right"):
        R = _qrot(cams[k]["T_body_cam"]["quaternion_xyzw"])
        fs.append(R[:, 2])
        ds.append(R[:, 1])
    f = np.mean(fs, 0)
    f /= np.linalg.norm(f)
    d = np.mean(ds, 0)
    d -= f * (d @ f)
    d /= np.linalg.norm(d)
    return f, d, np.cross(d, f)


def view_basis(axes, pitch_deg: float):
    """Pitch the wearer's view down by `pitch_deg` about the right axis (look from above and behind)."""
    f, d, r = axes
    t = np.deg2rad(pitch_deg)
    v = f * np.cos(t) + d * np.sin(t)          # viewing direction (depth axis)
    down = -f * np.sin(t) + d * np.cos(t)      # image down
    return v, down, r


def unit_coords(P, basis, target):
    """Perspective coordinates at unit focal length; depth is clamped so near points cannot blow up."""
    v, down, right = basis
    Q = np.asarray(P, np.float64) - target
    z = np.maximum(DIST + Q @ v, ZMIN_FRAC * DIST)
    return np.stack([(Q @ right) / z, (Q @ down) / z], -1).astype(np.float32)


def with_glyph(U):
    """(..., 21, 2) -> (..., 22, 2): the 22nd point is where the L / R ring ends, so framing keeps it inside."""
    w = U[..., 0, :]
    a = w - U[..., 9, :]
    n = np.linalg.norm(a, axis=-1, keepdims=True)
    a = a / np.maximum(n, 1e-9)
    return np.concatenate([U, (w + a * (GLYPH_REACH_M / DIST))[..., None, :]], axis=-2)


@dataclass
class Cam:
    basis: tuple
    target: np.ndarray
    fx: float          # pixels per metre at the target depth (DIST = 1 m)
    cx: float
    cy: float
    W: int
    H: int
    pitch: float = 0.0

    def project(self, P):
        u = unit_coords(P, self.basis, self.target)
        return np.stack([self.cx + self.fx * u[..., 0], self.cy + self.fx * u[..., 1]], -1)

    @property
    def hand_px(self) -> float:
        return self.fx / DIST * HAND_NOMINAL_M

    def resized(self, W, H):
        """The same view at another output size of the same aspect (framing in proportion)."""
        k = H / self.H
        return Cam(self.basis, self.target, self.fx * k, self.cx * k, self.cy * k, W, H, self.pitch)

    def zoomed(self, k, about):
        ax, ay = about
        return Cam(self.basis, self.target, self.fx * k, ax + (self.cx - ax) * k, ay + (self.cy - ay) * k,
                   self.W, self.H, self.pitch)


class View:
    """One sample's delivered joints and states with the rig orientation (what every camera looks at)."""

    def __init__(self, sample: Sample, hands: Hands):
        self.sample, self.hands, self.frames = sample, hands, hands.frames
        self.state = {s: hands.state(s) for s in SIDES}
        self.J = {s: hands.joints(s) for s in SIDES}          # NaN wherever the state is none
        self.axes = rig_axes(sample)
        pts = np.concatenate([self.J[s][self.state[s] != NONE].reshape(-1, 3) for s in SIDES])
        self.target = np.median(pts, axis=0)
        self.drawn = np.flatnonzero((self.state["left"] != NONE) | (self.state["right"] != NONE))
        self.both_measured = np.flatnonzero((self.state["left"] == MEASURED) & (self.state["right"] == MEASURED))

    def basis(self, pitch):
        return view_basis(self.axes, pitch)

    def unit(self, basis):
        return {s: with_glyph(unit_coords(self.J[s], basis, self.target)) for s in SIDES}


def _extents(P, idx):
    """Per-frame bounding box of everything drawn (both hands, glyph point included)."""
    lo = np.full((len(idx), 2), np.nan)
    hi = np.full((len(idx), 2), np.nan)
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        for s in SIDES:
            a = P[s][idx]
            lo = np.fmin(lo, np.nanmin(a, axis=1))
            hi = np.fmax(hi, np.nanmax(a, axis=1))
    return lo, hi


def fit_camera(U, idx, W, H, basis, target, pitch, box, target_pct=96.3) -> tuple[Cam, float]:
    """The largest zoom that keeps everything drawn inside `box` on >= `target_pct` % of the frames `idx`.

    U = unit coordinates (View.unit); box = (x0, y0, x1, y1) in output pixels; the scene is centred
    in the box. Returns the camera and the % achieved by this estimate."""
    lo, hi = _extents(U, idx)
    x0, y0, x1, y1 = box
    eps = 0.5  # px of slack: a frame that just touches the box edge is inside
    best = None
    for p in (3, 2.5, 2, 1.7, 1.5, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05, 0.0):
        u0, u1 = np.percentile(lo[:, 0], p), np.percentile(hi[:, 0], 100 - p)
        v0, v1 = np.percentile(lo[:, 1], p), np.percentile(hi[:, 1], 100 - p)
        fx = min((x1 - x0) / max(u1 - u0, 1e-6), (y1 - y0) / max(v1 - v0, 1e-6))
        cx = (x0 + x1) / 2 - fx * (u0 + u1) / 2
        cy = (y0 + y1) / 2 - fx * (v0 + v1) / 2
        inside = ((cx + fx * lo[:, 0] >= x0 - eps) & (cx + fx * hi[:, 0] <= x1 + eps) &
                  (cy + fx * lo[:, 1] >= y0 - eps) & (cy + fx * hi[:, 1] <= y1 + eps))
        pct = 100.0 * float(inside.mean())
        best = (Cam(basis, target, float(fx), float(cx), float(cy), W, H, pitch), pct)
        if pct >= target_pct:
            break
    return best


def hull_area(p) -> float:
    return float(cv2.contourArea(cv2.convexHull(np.asarray(p, np.float32))))


def choose_pitch(view: View, W=540, H=540, pitches=(20, 30, 40, 50), margin=0.06) -> float:
    """The pitch that shows the hands biggest: median 2-D hull area of the both-measured frames
    after the framing fit, per candidate pitch."""
    both = view.both_measured[::4]
    if len(both) == 0:
        return float(pitches[len(pitches) // 2])
    m = margin * min(W, H)
    box = (m, m, W - m, H - m)
    best, best_score = pitches[0], -1.0
    for th in pitches:
        basis = view.basis(th)
        U = view.unit(basis)
        cam, _ = fit_camera(U, view.drawn, W, H, basis, view.target, th, box)
        area = float(np.median([sum(hull_area(U[s][i, :21] * cam.fx) for s in SIDES) for i in both]))
        if area > best_score:
            best, best_score = th, area
    return float(best)


# ---------------------------------------------------------------- scene -----

def style_scale(cam: Cam) -> float:
    """Line weights grow with the hands on screen (a hand of ~110 px gets the 3 px bones of the spec)."""
    return float(np.clip(cam.hand_px / 110.0, 0.8, 2.4))


class Scene:
    """A View through one camera: pixel coordinates of every joint for every frame.

    P[side] is (frames, 22, 2); row 21 is where the L / R ring ends (used for framing checks only)."""

    def __init__(self, view: View, cam: Cam):
        self.view, self.cam = view, cam
        self.frames = view.frames
        self.state = view.state
        s = style_scale(cam)
        self.P = {}
        for side in SIDES:
            p = cam.project(view.J[side]).astype(np.float32)          # (N,21,2), NaN where no pose
            away = p[:, 0] - p[:, 9]
            n = np.linalg.norm(away, axis=-1, keepdims=True)
            away = np.where(n > 1e-3, away / np.maximum(n, 1e-9), np.array([0.0, 1.0], np.float32))
            far = p[:, 0] + away * (GLYPH_OFFSET + GLYPH_R) * s
            self.P[side] = np.concatenate([p, far[:, None, :]], axis=1)

    def inside_mask(self, idx, box, eps=0.5):
        lo, hi = _extents(self.P, idx)
        x0, y0, x1, y1 = box
        return (lo[:, 0] >= x0 - eps) & (hi[:, 0] <= x1 + eps) & (lo[:, 1] >= y0 - eps) & (hi[:, 1] <= y1 + eps)

    def inside_pct(self, idx, box) -> float:
        return 100.0 * float(self.inside_mask(idx, box).mean())


def fit_scene(view: View, pitch, idx, W, H, box, target_pct=96.3, min_pct=96.0):
    """Fit a camera to the frames `idx`, then verify it exactly (joints, bones and the L / R ring)
    and back the zoom off until at least `min_pct` % of the frames are fully inside `box`."""
    basis = view.basis(pitch)
    cam, _ = fit_camera(view.unit(basis), idx, W, H, basis, view.target, pitch, box, target_pct)
    centre = ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)
    sc = Scene(view, cam)
    pct = sc.inside_pct(idx, box)
    for _ in range(60):
        if pct >= min_pct:
            break
        cam = cam.zoomed(0.99, centre)
        sc = Scene(view, cam)
        pct = sc.inside_pct(idx, box)
    check(pct >= min_pct, f"{view.sample.slug}: could not frame the hands inside the frame on {min_pct}% of frames")
    return sc, pct


# -------------------------------------------------------------- painter -----

def _s16(p):
    return (int(round(float(p[0]) * 16)), int(round(float(p[1]) * 16)))


def _line(img, p, q, col, w):
    cv2.line(img, _s16(p), _s16(q), col, int(w), cv2.LINE_AA, 4)


def _circ(img, c, r, col, thick):
    cv2.circle(img, _s16(c), int(round(r * 16)), col, thick if thick < 0 else int(thick), cv2.LINE_AA, 4)


def _dashed(img, p, q, col, w, dash, gap):
    p = np.asarray(p, float)
    q = np.asarray(q, float)
    L = float(np.linalg.norm(q - p))
    if L < 1e-3:
        return
    u = (q - p) / L
    t = 0.0
    while t < L:
        _line(img, p + u * t, p + u * min(t + dash, L), col, w)
        t += dash + gap


def _dotted(img, p, q, col, r, step):
    p = np.asarray(p, float)
    q = np.asarray(q, float)
    n = max(int(np.linalg.norm(q - p) / step), 1)
    for k in range(n + 1):
        _circ(img, p + (q - p) * k / n, r, col, -1)


def _seg_dist(c, A, B):
    """Distance from point c to each segment A[i]-B[i]."""
    d = B - A
    t = np.clip(((c - A) * d).sum(1) / np.maximum((d * d).sum(1), 1e-9), 0.0, 1.0)
    return np.linalg.norm(A + d * t[:, None] - c, axis=1)


def _lerp(c0, c1, a):
    return tuple(int(round(x0 + (x1 - x0) * a)) for x0, x1 in zip(c0, c1))


def _blend_poly(img, pts, col, alpha):
    """Translucent polygon fill, blended on its bounding box only."""
    h, w = img.shape[:2]
    x0 = max(int(np.floor(pts[:, 0].min())) - 2, 0)
    y0 = max(int(np.floor(pts[:, 1].min())) - 2, 0)
    x1 = min(int(np.ceil(pts[:, 0].max())) + 3, w)
    y1 = min(int(np.ceil(pts[:, 1].max())) + 3, h)
    if x1 <= x0 or y1 <= y0:
        return
    roi = img[y0:y1, x0:x1]
    ov = roi.copy()
    q = np.round((pts - [x0, y0]) * 16).astype(np.int32)
    cv2.fillPoly(ov, [q], col, cv2.LINE_AA, 4)
    cv2.addWeighted(ov, alpha, roi, 1 - alpha, 0, roi)


class Painter:
    """Draws frames of a Scene. One per output size; the ground is built once."""

    def __init__(self, W: int, H: int):
        self.W, self.H = W, H
        self.bg = self._ground(W, H)

    @staticmethod
    def _ground(W, H):
        """#0E0C24 with a very faint grid and a vignette."""
        img = np.zeros((H, W, 3), np.uint8)
        img[:] = BG
        step = H / 15
        ov = img.copy()
        grid_col = (0xC7, 0xE5, 0x00)
        for i in range(1, int(W / step) + 1):
            x = int(round(i * step))
            cv2.line(ov, (x, 0), (x, H), grid_col, 1)
        for i in range(1, 15):
            y = int(round(i * step))
            cv2.line(ov, (0, y), (W, y), grid_col, 1)
        cv2.addWeighted(ov, 0.045, img, 0.955, 0, img)
        yy, xx = np.mgrid[0:H, 0:W]
        rr = np.hypot((xx - W / 2) / (W / 2), (yy - H / 2) / (H / 2)) / 1.3
        return (img * (1 - 0.35 * np.clip(rr, 0, 1) ** 2)[..., None]).astype(np.uint8)

    # ---- one hand -----------------------------------------------------------
    def _glyph_centre(self, p, s, avoid):
        """Where the L / R ring goes: behind the wrist, away from the fingers. For stills (`avoid` = the
        bones of every drawn hand as (A, B) endpoint arrays) it steps round the wrist to the free spot
        nearest that direction, inside the frame."""
        w = p[0]
        away = w - p[9]
        n = float(np.hypot(*away))
        away = away / n if n > 1e-3 else np.array([0.0, 1.0])
        off, r = GLYPH_OFFSET * s, GLYPH_R * s
        if avoid is None:
            return w + away * off
        base = np.arctan2(away[1], away[0])
        best, best_score = None, -1e9
        for reach, pen in ((1.0, 0.0), (1.7, 0.3)):      # the usual spot first, then one further out
            for k in (0, 1, -1, 2, -2, 3, -3, 4):
                ang = base + k * np.pi / 4
                c = w + off * reach * np.array([np.cos(ang), np.sin(ang)])
                if c[0] - r < 2 or c[0] + r > self.W - 2 or c[1] - r < 2 or c[1] + r > self.H - 2:
                    continue
                clearance = float(np.min(_seg_dist(c, avoid[0], avoid[1]))) - r
                score = min(clearance, 1.2 * r) - (0.02 * abs(k) + pen) * r
                if score > best_score:
                    best, best_score = c, score
        return best if best is not None else w + away * off

    @staticmethod
    def _halo(glow, side, st, p, s):
        """The light behind the bones, drawn into `glow` (blurred and added to the ground before any line is drawn)."""
        col = COL[side]
        if st == MEASURED:
            for a, b in SPOKES:
                _line(glow, p[a], p[b], col, max(2, int(round(3 * s))))
            for a, b in FINGER_BONES:
                _line(glow, p[a], p[b], col, max(4, int(round(7 * s))))
        elif st == GUESSED:
            for a, b in FINGER_BONES:
                _line(glow, p[a], p[b], col, max(3, int(round(4 * s))))

    def _hand(self, img, side, st, p, s, avoid=None):
        col = COL[side]
        w_b = max(2, int(round(3 * s)))
        w_s = max(1, int(round(2 * s)))
        if st == MEASURED:
            poly = p[PALM]
            _blend_poly(img, poly, col, 0.20)
            cv2.polylines(img, [np.round(poly * 16).astype(np.int32)], True, _lerp(BG, col, 0.78),
                          max(1, int(round(1.4 * s))), cv2.LINE_AA, 4)
            for a, b in SPOKES:
                _line(img, p[a], p[b], _lerp(BG, col, 0.72), w_s)
            for a, b in FINGER_BONES:
                _line(img, p[a], p[b], col, w_b)
            for k in range(21):
                _circ(img, p[k], (4.4 if k == 0 else 3.9 if k in TIPS else 3.3) * s, col, -1)
        elif st == GUESSED:
            poly = p[PALM]
            _blend_poly(img, poly, col, 0.09)
            for a, b in zip(PALM, PALM[1:] + PALM[:1]):
                _dashed(img, p[a], p[b], _lerp(BG, col, 0.7), max(1, int(round(1.4 * s))), 5 * s, 4 * s)
            for a, b in SPOKES:
                _dashed(img, p[a], p[b], _lerp(BG, col, 0.7), w_s, 6 * s, 5 * s)
            for a, b in FINGER_BONES:
                _dashed(img, p[a], p[b], col, max(2, int(round(2.6 * s))), 6 * s, 4.5 * s)
            for k in range(21):
                r = 3.4 * s
                _circ(img, p[k], r, BG, -1)
                _circ(img, p[k], r, col, max(1, int(round(1.5 * s))))
        else:  # bridged
            for a, b in ALL_BONES:
                _dotted(img, p[a], p[b], col, 1.3 * s, 5.0 * s)
            for k in range(21):
                r = 2.4 * s
                _circ(img, p[k], r, BG, -1)
                _circ(img, p[k], r, col, max(1, int(round(1.2 * s))))
        # the L / R glyph sits behind the wrist, away from the fingers
        c = self._glyph_centre(p, s, avoid)
        _circ(img, c, GLYPH_R * s, BG, -1)
        _circ(img, c, GLYPH_R * s, col, max(1, int(round(1.5 * s))))
        t = "L" if side == "left" else "R"
        th = max(1, int(round(1.5 * s)))
        (tw, tht), _ = cv2.getTextSize(t, cv2.FONT_HERSHEY_SIMPLEX, 0.46 * s, th)
        cv2.putText(img, t, (int(round(c[0] - tw / 2)), int(round(c[1] + tht / 2))), cv2.FONT_HERSHEY_SIMPLEX,
                    0.46 * s, col, th, cv2.LINE_AA)

    # ---- trail --------------------------------------------------------------
    def _trail(self, img, sc: Scene, side, i, s, fade=None):
        col = COL[side]
        pts = [(k, sc.P[side][k, 0]) for k in range(max(0, i - TRAIL_FRAMES), i + 1)
               if sc.state[side][k] != NONE and np.isfinite(sc.P[side][k, 0]).all()]
        if len(pts) < 2:
            return
        w = max(1, int(round(2 * s)))
        for a in range(len(pts) - 1):
            if pts[a + 1][0] - pts[a][0] > 3:
                continue
            al = 0.55 * ((a + 1) / len(pts)) ** 1.5
            if fade is not None:
                mid = (pts[a][1] + pts[a + 1][1]) / 2
                al *= fade(mid[0], mid[1])
            if al <= 0.01:
                continue
            _line(img, pts[a][1], pts[a + 1][1], _lerp(BG, col, al), w)

    # ---- frame --------------------------------------------------------------
    def frame(self, sc: Scene, i: int, fade=None, still=False) -> np.ndarray:
        """Render frame i. `fade(x, y) -> 0..1` optionally attenuates the wrist trails (hero compositions);
        `still` lets the L / R rings move off the hands (they stay put in video, where they must not jump)."""
        s = style_scale(sc.cam)
        img = self.bg.copy()
        for side in SIDES:
            self._trail(img, sc, side, i, s, fade)
        drawn = {side: (int(sc.state[side][i]), sc.P[side][i, :21]) for side in SIDES
                 if sc.state[side][i] != NONE and np.isfinite(sc.P[side][i, :21]).all()}
        return self.hands(img, drawn, s, still)

    def hands(self, img: np.ndarray, drawn: dict, s: float, still=False) -> np.ndarray:
        """Draw the hands of one frame onto `img`: first the soft light behind the bones, added to the ground,
        then every line, joint and ring on top of it, so they keep exactly their palette colour.
        `drawn` maps a side to (state, (21, 2) pixel joints); `s` is the style scale."""
        glow = np.zeros_like(img)
        for side, (st, p) in drawn.items():
            self._halo(glow, side, st, p, s)
        img = cv2.add(img, (cv2.GaussianBlur(glow, (0, 0), 7 * s) * GLOW_GAIN).astype(np.uint8))
        for side, (st, p) in drawn.items():
            avoid = None
            if still:
                segs = [(q[a], q[b]) for _, q in drawn.values() for a, b in ALL_BONES]
                avoid = (np.array([x[0] for x in segs]), np.array([x[1] for x in segs]))
            self._hand(img, side, st, p, s, avoid)
        return img


def loop_frame(painter: Painter, sc: Scene, start: int, frames: int, xfade: int, j: int, fade=None):
    """Frame j (0 <= j < frames) of the seamless loop over source frames [start, start + frames + xfade).

    out[j] = R(start + j) for j >= xfade. The first `xfade` frames dissolve the continuation of the
    clip, R(start + frames + j), into the head, R(start + j), so the last frame flows into the first
    one exactly as the source's own next frame would."""
    a = painter.frame(sc, start + j, fade)
    if j < xfade:
        b = painter.frame(sc, start + frames + j, fade)
        w = (j + 1) / (xfade + 1)
        a = cv2.addWeighted(b, 1 - w, a, w, 0)
    return a


def crossfade_loop(painter: Painter, sc: Scene, start: int, frames: int, xfade: int, fade=None, phase: int = 0):
    """The frames of the loop in order, starting `phase` frames in (the loop is cyclic, so any phase is seamless)."""
    for i in range(frames):
        yield loop_frame(painter, sc, start, frames, xfade, (i + phase) % frames, fade)


# ---------------------------------------------------------- frame choice ----

def _hull(p):
    return cv2.convexHull(np.asarray(p, np.float32))


# finger chains as (joint, joint, chain) segments, for counting fingers that cross each other on screen
_CHAINS = [[0, 1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16], [17, 18, 19, 20]]
_SEGS = [(a, b, ci) for ci, ch in enumerate(_CHAINS) for a, b in zip(ch, ch[1:])]


_SEG_A = np.array([a for a, _, _ in _SEGS])
_SEG_B = np.array([b for _, b, _ in _SEGS])
_SEG_CHAIN = np.array([ci for _, _, ci in _SEGS])


def _orient(a, b, c):
    return (c[..., 1] - a[..., 1]) * (b[..., 0] - a[..., 0]) - (b[..., 1] - a[..., 1]) * (c[..., 0] - a[..., 0])


def _crossing_matrix(A1, B1, A2, B2):
    """(n1, n2) bool: segment i of the first set properly crosses segment j of the second (all in pixels)."""
    a1, b1, a2, b2 = A1[:, None], B1[:, None], A2[None], B2[None]
    return (_orient(a1, b1, a2) * _orient(a1, b1, b2) < 0) & (_orient(a2, b2, a1) * _orient(a2, b2, b1) < 0)


def finger_crossings(p) -> int:
    """How many pairs of bones from different fingers of one hand cross on screen (a tangle reads badly)."""
    A, B = np.asarray(p, np.float64)[_SEG_A], np.asarray(p, np.float64)[_SEG_B]
    return int((_crossing_matrix(A, B, A, B) & (_SEG_CHAIN[:, None] < _SEG_CHAIN[None])).sum())


def hand_crossings(p_left, p_right) -> int:
    """How many bones of the left hand cross a bone of the right hand on screen (hands laced into each other)."""
    L, R = np.asarray(p_left, np.float64), np.asarray(p_right, np.float64)
    return int(_crossing_matrix(L[_SEG_A], L[_SEG_B], R[_SEG_A], R[_SEG_B]).sum())


def palm_facing(J, cam_pos) -> float:
    """|cos| of the angle between a hand's palm normal and the ray from the camera to the palm (3-D joints J,
    (21, 3)): 1 = palm seen square-on, 0 = edge-on, where the palm polygon collapses into a line."""
    J = np.asarray(J, np.float64)
    n = np.cross(J[17] - J[5], J[[5, 9, 13, 17]].mean(0) - J[0])
    ray = J[[0, 5, 9, 13, 17]].mean(0) - cam_pos
    return float(abs(n @ ray) / max(np.linalg.norm(n) * np.linalg.norm(ray), 1e-12))


def finger_extension(J) -> float:
    """Mean distance from the wrist to the four fingertips over the wrist-to-middle-knuckle distance (3-D, so it does
    not depend on the viewpoint): about 1.4 for a relaxed hand, below 1 for a hand curled into a cluster."""
    J = np.asarray(J, np.float64)
    tips = np.linalg.norm(J[[8, 12, 16, 20]] - J[0], axis=1).mean()
    return float(tips / max(np.linalg.norm(J[9] - J[0]), 1e-12))


def hand_clarity(sc: Scene, i: int) -> float:
    """0..1: how well the worse of the two hands of frame i reads as a hand. A palm turned away from the camera
    (seen edge-on it is a bar, with no palm polygon) and fingers curled into a cluster both score low; a palm
    within about 53 degrees of square-on with relaxed fingers scores 1."""
    cam_pos = sc.cam.target - sc.cam.basis[0] * DIST
    worst = 1.0
    for s in SIDES:
        J = sc.view.J[s][i]
        face = min(palm_facing(J, cam_pos) / FACING_FULL, 1.0)
        curl = min(max((finger_extension(J) - CURL_ZERO) / (CURL_FULL - CURL_ZERO), 0.0), 1.0)
        worst = min(worst, face * curl)
    return worst


def _frame_score(P, k, overlap_power, clarity=1.0, tangle_penalty=0.5):
    """sqrt(area_L * area_R) of the two 2-D hulls at zoom k, reduced by how much the hands overlap, by bones crossing
    each other on screen (fingers of one hand, and one hand's bones over the other's) and by a palm turned away or a
    hand curled up (`clarity`, see hand_clarity)."""
    hulls = [_hull(P[s][:21]) for s in SIDES]
    areas = [float(cv2.contourArea(h)) * k * k for h in hulls]
    inter = float(cv2.intersectConvexConvex(hulls[0], hulls[1])[0])
    overlap = min(inter / max(min(cv2.contourArea(h) for h in hulls), 1e-6), 1.0)
    tangle = sum(finger_crossings(P[s][:21]) for s in SIDES) + hand_crossings(P["left"][:21], P["right"][:21])
    return (float(np.sqrt(areas[0] * areas[1])) * (1.0 - overlap) ** overlap_power / (1.0 + tangle_penalty * tangle)
            * max(clarity, CLARITY_FLOOR))


def pick_frame(sc: Scene, cand, box, also=(), tight=None, overlap_power=2.0, trail_need=10, with_score=False):
    """Best frame among `cand`: both hands measured (and for `trail_need` frames before, so the wrist
    trails are complete), everything inside `box` under this scene (and inside every (scene, box) of
    `also`), hands large, open, not overlapping, each palm turned towards the camera and no hand curled
    into a cluster (hand_clarity).

    tight = (target_box, max_zoom): the frame will get its own camera, zoomed to fill `target_box` but
    by at most `max_zoom` times this scene's zoom; frames are then scored at that zoom and the
    inside tests on `sc` are skipped."""
    best, best_i = -1.0, None
    for i in cand:
        i = int(i)
        if i < trail_need:
            continue
        if not all(sc.state[s][i - trail_need:i + 1].min() == MEASURED for s in SIDES):
            continue
        if tight is None:
            if not bool(sc.inside_mask([i], box)[0]):
                continue
            k = 1.0
        else:
            tb, kmax = tight
            full = np.concatenate([sc.P[s][i] for s in SIDES])  # hands and L / R rings
            k = min((tb[2] - tb[0]) / max(np.ptp(full[:, 0]), 1e-6), (tb[3] - tb[1]) / max(np.ptp(full[:, 1]), 1e-6), kmax)
        if not all(bool(o.inside_mask([i], b)[0]) for o, b in also):
            continue
        score = _frame_score({s: sc.P[s][i] for s in SIDES}, k, overlap_power, hand_clarity(sc, i))
        if score > best:
            best, best_i = score, i
    return (best_i, best) if with_score else best_i


def fit_single(view: View, pitch, frame, W, H, box, max_hand_px):
    """A camera for one still: the pair of hands (and L / R rings) fill `box`, with the hands at most
    `max_hand_px` long on screen so a compact pair is not blown up."""
    basis = view.basis(pitch)
    cam, _ = fit_camera(view.unit(basis), np.array([frame]), W, H, basis, view.target, pitch, box, 100.0)
    if cam.hand_px > max_hand_px:
        cam = cam.zoomed(max_hand_px / cam.hand_px, ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2))
    sc = Scene(view, cam)
    pct = sc.inside_pct(np.array([frame]), box)
    check(pct == 100.0, f"{view.sample.slug}: the still does not fit its frame")
    return sc


_PAINTERS: dict = {}


def draw(sc: Scene, i: int, fade=None, still=False) -> np.ndarray:
    """Render frame i of a scene (one painter, hence one background, per output size)."""
    key = (sc.cam.W, sc.cam.H)
    if key not in _PAINTERS:
        _PAINTERS[key] = Painter(*key)
    return _PAINTERS[key].frame(sc, i, fade, still)


def best_frame(sc: Scene, cand, box, **kw):
    """The poster frame among `cand` (see pick_frame): both hands measured, inside `box`, large and clear."""
    return pick_frame(sc, cand, box, **kw)


# ------------------------------------------------------ rendered colour check -

def _flat_hand(x0: float, y0: float):
    """A flat, open 21-point hand in pixels (wrist at x0, y0, fingers up), for the colour check."""
    p = np.zeros((21, 2), np.float32)
    p[0] = (x0, y0)
    p[1:5] = [(x0 - 25, y0 - 20), (x0 - 45, y0 - 45), (x0 - 58, y0 - 68), (x0 - 66, y0 - 88)]
    for base, dx, dy, lean in ((5, -27, -80, -4), (9, -9, -85, 0), (13, 9, -82, 4), (17, 26, -74, 8)):
        for k in range(4):
            p[base + k] = (x0 + dx + lean * k, y0 + dy - 26 * k)
    return p


def check_rendered_colours(max_delta: float = 3.0) -> dict:
    """Draw a flat open hand of each colour through the painter, as measured, and compare the colour of its finger
    bones with the palette colour: median CIELAB deltaE76 over the twelve finger bones. The soft light around the
    bones must not lighten the lines, so the colours of the legend are the colours that are drawn."""
    painter = Painter(540, 540)
    drawn = {"left": (MEASURED, _flat_hand(150, 480)), "right": (MEASURED, _flat_hand(390, 480))}
    img = painter.hands(painter.bg.copy(), drawn, 1.0)
    out = {}
    for side, (_, p) in drawn.items():
        cores = []
        for a, b in FINGER_BONES[4:]:               # index to little finger; the thumb chain is skipped
            m = (p[a] + p[b]) / 2
            cores.append(img[int(round(float(m[1]))), int(round(float(m[0])))][::-1])
        out[side] = delta_e76(tuple(np.median(np.array(cores), axis=0)), SIDE_RGB[side])
        check(out[side] <= max_delta, f"rendered {side} bones differ from the palette colour by deltaE76 {out[side]:.1f}")
    return out


# ----------------------------------------------------------------- output ---

def write_jpeg(path, img, quality: int):
    """JPEG without metadata (OpenCV writes none); 4:4:4 so thin coloured lines keep their colour."""
    path.parent.mkdir(parents=True, exist_ok=True)
    ok = cv2.imwrite(str(path), img, [cv2.IMWRITE_JPEG_QUALITY, int(quality), cv2.IMWRITE_JPEG_OPTIMIZE, 1,
                                      cv2.IMWRITE_JPEG_SAMPLING_FACTOR, cv2.IMWRITE_JPEG_SAMPLING_FACTOR_444])
    check(ok, f"could not write {path.name}")


# Encoding of every published mp4. The last three options keep it free of tags: no creation time, no
# encoder string in the container (bitexact + an emptied encoder tag) and no x264 settings SEI in the
# stream (NAL type 6 removed).
FFMPEG_ARGS = ["-map_metadata", "-1", "-fflags", "+bitexact", "-flags:v", "+bitexact",
               "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", "30",
               "-g", "30", "-keyint_min", "30", "-sc_threshold", "0", "-an", "-movflags", "+faststart",
               "-metadata:s:v:0", "encoder=", "-bsf:v", "filter_units=remove_types=6"]


class VideoWriter:
    """Pipes BGR frames to ffmpeg (libx264, 30 fps, no audio, no metadata, moov first)."""

    def __init__(self, path, W, H):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.path, self.W, self.H, self.n = path, W, H, 0
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}",
               "-r", "30", "-i", "-", *FFMPEG_ARGS, str(path)]
        self.p = subprocess.Popen(cmd, stdin=subprocess.PIPE)

    def write(self, img):
        check(img.shape == (self.H, self.W, 3) and img.dtype == np.uint8, "video frame has the wrong shape")
        self.p.stdin.write(np.ascontiguousarray(img).tobytes())
        self.n += 1

    def close(self):
        self.p.stdin.close()
        rc = self.p.wait()
        check(rc == 0, f"ffmpeg failed while writing {self.path.name}")

    def __enter__(self):
        return self

    def __exit__(self, *a):
        if a[0] is None:
            self.close()
        else:
            self.p.kill()
