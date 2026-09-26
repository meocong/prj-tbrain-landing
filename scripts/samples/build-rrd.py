#!/usr/bin/env python3
"""One Rerun recording per stereo sample: the preview window, explorable.

Asked for after looking at GSI's showcase (2026-09-25), where every segment
opens in a Rerun viewer — the rig in 3D, its path through the room, the hands,
and the camera streams on one timeline. This builds the same for the preview
window of every approved stereo capture, from the delivery itself:

  cameras     all four delivered lenses placed on the rig from
              `calibration.json` (`tf_static`, parent `body`); pictures from the
              mid pair only, at the preview's 480x360 crop (see VIDEO_CAMS)
  head path   `camera_pose.csv`. Measured against the gyro, the pose is the
              primary-left camera's: its angular rate matches the IMU rotated
              into primary-left to 0.07-0.09 rad/s, and misses it by 0.2-0.46
              if read as the body frame. Rows flagged unmeasured are held at
              the last measured pose, never invented.
  up          gravity, from the accelerometer over the window — the world frame
              is the first camera frame of the clip, which has no "up" of its
              own, and a scene that opens on its side reads as broken
  IMU         every sample in the window, accelerometer and gyro
  hands       ESTIMATED, and labelled so everywhere they appear. The approved
              drop does not include `wrist_trajectory.csv` (the README
              describes it; the folders carry eight files and it is not one),
              so there is no delivered hand measurement to show. MediaPipe's
              hand landmarker runs on each mid-pair lens at native resolution,
              and each landmark is triangulated from the two rays through the
              fisheye calibration. A hand is drawn in 3D only where both lenses
              found it and the rays agree (median gap under GAP_MAX); a single
              view is never promoted to 3D.

Usage:
  python3 scripts/samples/build-rrd.py [--only SLUG[,SLUG]] [--procs N] [--with-hands]

Writes public/samples/rrd/<slug>.rrd and src/lib/samples/rrd.json.
"""

import argparse
import csv
import json
import os
import subprocess
import sys
import tempfile
import time

import cv2
import numpy as np
from scipy.spatial.transform import Rotation as Rot

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
LIB = os.path.join(ROOT, "src", "lib", "samples")
PUB = os.path.join(ROOT, "public", "samples")
OUT = os.path.join(PUB, "rrd")
SRC = os.path.expanduser("~/.cache/tbrain-samples/approved/Egocentric Human Data Samples")
MODEL = os.path.expanduser("~/.cache/openai_data/mediapipe/hand_landmarker.task")

W, H = 480, 360
FPS = 30
SECONDS = 8.0
CAMS = ["mid_left", "mid_right", "primary_left", "primary_right"]
# Pictures only from the mid pair. The primary pair looks down past the chin and
# frames the wearer's mouth on nearly every clip — Tam's rule is to cut what
# identifies a person, and the page already shows only the mid pair for that
# reason. The primary lenses are still placed on the rig, as frustums.
VIDEO_CAMS = ("mid_left", "mid_right")
HAND_CAMS = ("mid_left", "mid_right")
GAP_MAX = 0.02        # m, median ray gap across the 21 landmarks
DEPTH = (0.12, 0.85)  # m from the head. Farther is not the wearer's hand: at 1.1 m the
                      # landmarker's false positives on a seated wearer's FEET got through
                      # (matt-cutting), and an arm does not reach past ~0.8 m.
PALM = (0.055, 0.13)  # m, wrist to middle-finger knuckle — an adult hand, not a towel fold
SPAN_MAX = 0.25       # m, widest pair of landmarks
SCORE_MIN = 0.6       # MediaPipe handedness score, both lenses
BONES = [(0, 1), (1, 2), (2, 3), (3, 4), (0, 5), (5, 6), (6, 7), (7, 8), (5, 9), (9, 10), (10, 11), (11, 12),
         (9, 13), (13, 14), (14, 15), (15, 16), (13, 17), (0, 17), (17, 18), (18, 19), (19, 20)]
HAND_COLOR = {"left": (80, 140, 255), "right": (190, 90, 240)}


# ── camera models ─────────────────────────────────────────────────────────

class Cam:
    def __init__(self, c, tf):
        self.w, self.h, self.model = c["width"], c["height"], c["model"]
        self.K = np.array(c["K"], float).reshape(3, 3)
        self.D = np.array(c["D"], float)
        self.R = Rot.from_quat(tf["q_xyzw"])       # body <- camera
        self.t = np.array(tf["t"], float)
        s = max(W / self.w, H / self.h)
        self.s, self.ox, self.oy = s, (self.w * s - W) / 2, (self.h * s - H) / 2

    def to_preview(self, uv):
        return uv * self.s - [self.ox, self.oy]

    def rays(self, uv):
        """Unit rays in the camera frame for native pixels (N, 2)."""
        uv = np.asarray(uv, float).reshape(-1, 2)
        if self.model == "ds":
            fx, fy, cx, cy, xi, al = self.D
            mx, my = (uv[:, 0] - cx) / fx, (uv[:, 1] - cy) / fy
            r2 = mx * mx + my * my
            mz = (1 - al * al * r2) / (al * np.sqrt(np.clip(1 - (2 * al - 1) * r2, 0, None)) + 1 - al)
            k = (mz * xi + np.sqrt(mz * mz + (1 - xi * xi) * r2)) / (mz * mz + r2)
            v = np.stack([k * mx, k * my, k * mz - xi], 1)
        else:
            n = cv2.fisheye.undistortPoints(uv.reshape(-1, 1, 2), self.K, self.D[:4]).reshape(-1, 2)
            v = np.column_stack([n, np.ones(len(n))])
        return v / np.linalg.norm(v, axis=1, keepdims=True)

    def project(self, P):
        """Camera-frame points (N, 3) -> native pixels (N, 2); NaN behind the lens."""
        P = np.asarray(P, float).reshape(-1, 3)
        if self.model == "ds":
            fx, fy, cx, cy, xi, al = self.D
            x, y, z = P.T
            d1 = np.linalg.norm(P, axis=1)
            d2 = np.sqrt(x * x + y * y + (xi * d1 + z) ** 2)
            den = al * d2 + (1 - al) * (xi * d1 + z)
            uv = np.stack([fx * x / den + cx, fy * y / den + cy], 1)
            uv[den <= 0] = np.nan
            return uv
        out = np.full((len(P), 2), np.nan)
        ok = P[:, 2] > 0.01
        if ok.any():
            uv, _ = cv2.fisheye.projectPoints(P[ok].reshape(-1, 1, 3), np.zeros(3), np.zeros(3), self.K, self.D[:4])
            out[ok] = uv.reshape(-1, 2)
        return out

    def body_rays(self, uv):
        return self.t, self.R.apply(self.rays(uv))


# ── inputs ────────────────────────────────────────────────────────────────

def folders():
    """slug -> delivery folder, through the same mid-left file hash the ingest keyed on."""
    jobs = json.load(open(os.path.join(ROOT, ".samples-approved", "jobs-approved.json")))
    return {j["slug"]: os.path.dirname(j["video"]) for j in jobs if j["lens"] == "mid"}


def read_csv(p):
    with open(p, newline="") as fh:
        return list(csv.DictReader(fh))


def frames(path, start, span, size=None, crop=True):
    vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}" if crop else "null"
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", path, "-t", f"{span:.3f}",
           "-vf", f"fps={FPS},{vf}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    w, h = (W, H) if crop else size
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw[: n * w * h * 3], np.uint8).reshape(n, h, w, 3)


def encode(path, start, span, out):
    """The lens at the preview crop, H.264 with no B-frames so the web viewer can seek it."""
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-i", path, "-t", f"{span:.3f}", "-an",
                    "-vf", f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "32", "-bf", "0", "-g", "30",
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], check=True)


# ── hands ────────────────────────────────────────────────────────────────

MP_PYTHON = os.environ.get("MP_PYTHON", os.path.expanduser("~/.cache/tbrain-samples/mpenv/bin/python"))


HAND_CACHE = os.path.expanduser("~/.cache/tbrain-samples/hands")


def detect(path, cam, start, span):
    """Per frame: list of (label, native landmarks (21,2), score). See detect-hands.py.

    Cached per lens and window: detection is most of a build's time and does not
    change when only the recording's layout does."""
    os.makedirs(HAND_CACHE, exist_ok=True)
    key = os.path.join(HAND_CACHE, f"{os.path.basename(os.path.dirname(path))}__{os.path.basename(path)}__{start:.3f}_{span:.3f}.json")
    if os.path.exists(key):
        raw = open(key).read()
    else:
        raw = subprocess.run([MP_PYTHON, os.path.join(HERE, "detect-hands.py"), path, str(cam.w), str(cam.h),
                              f"{start:.3f}", f"{span:.3f}", str(FPS), MODEL], check=True, capture_output=True, text=True).stdout
        with open(key, "w") as fh:
            fh.write(raw)
    return [[(label, np.array(uv), score) for label, uv, score in fr] for fr in json.loads(raw)]


def triangulate(cl, cr, a, b):
    o1, d1 = cl.body_rays(a)
    o2, d2 = cr.body_rays(b)
    w0 = o1 - o2
    bb = np.sum(d1 * d2, 1)
    d = np.sum(d1 * w0, 1)
    e = np.sum(d2 * w0, 1)
    den = 1 - bb * bb
    s = (bb * e - d) / den
    t = (e - bb * d) / den
    p1, p2 = o1 + s[:, None] * d1, o2 + t[:, None] * d2
    return (p1 + p2) / 2, np.linalg.norm(p1 - p2, axis=1), np.minimum(s, t)


def hands3d(dets, cams):
    """Per frame: {label: (21,3) body-frame} for hands both mid lenses agree on.

    Left and right are decided by geometry, not by MediaPipe's handedness. On
    the head rig that label flipped between frames on one and the same hand
    (bar-welding: "left" at 2.0 s, "right" at 3.3 s), which draws as a hand
    changing colour mid-task. Two hands: the one further to the rig's left is
    the left hand. One hand: it keeps the label of the nearest wrist in the
    frame before if that is within reach, else it takes its side of the rig.
    The rig's left-right axis is the primary pair's baseline, left lens to
    right lens, both from `tf_static`."""
    cl, cr = cams["mid_left"], cams["mid_right"]
    pl, pr = cams["primary_left"].t, cams["primary_right"].t
    axis = (pr - pl) / np.linalg.norm(pr - pl)
    centre = (pl + pr) / 2
    side = lambda P: float(np.dot(P[0] - centre, axis))          # landmark 0 is the wrist
    out, prev = [], {}
    for L, R in zip(*dets):
        pairs = []
        for i, (_, ua, sa) in enumerate(L):
            for j, (_, ub, sb) in enumerate(R):
                if min(sa, sb) < SCORE_MIN:
                    continue
                P, gap, rng = triangulate(cl, cr, ua, ub)
                g = float(np.median(gap))
                dist = float(np.median(np.linalg.norm(P, axis=1)))
                palm = float(np.linalg.norm(P[9] - P[0]))
                span = float(np.max(np.linalg.norm(P[:, None] - P[None], axis=2)))
                if (g < GAP_MAX and DEPTH[0] < dist < DEPTH[1] and (rng > 0).all()
                        and PALM[0] < palm < PALM[1] and span < SPAN_MAX):
                    pairs.append((g, i, j, P))
        pairs.sort(key=lambda p: p[0])
        used_l, used_r, hands = set(), set(), []
        for g, i, j, P in pairs:
            if i in used_l or j in used_r:
                continue
            used_l.add(i), used_r.add(j)
            # One physical hand seen twice by one lens gives two pairs a few mm apart.
            if all(np.linalg.norm(P[0] - Q[0]) > 0.04 for Q in hands):
                hands.append(P)
        hands = hands[:2]
        frame = {}
        if len(hands) == 2:
            a, b = sorted(hands, key=side)
            frame = {"left": a, "right": b}
        elif hands:
            P = hands[0]
            near = min(prev.items(), key=lambda kv: np.linalg.norm(kv[1][0] - P[0]), default=None)
            if near is not None and np.linalg.norm(near[1][0] - P[0]) < 0.08:
                frame = {near[0]: P}
            else:
                frame = {"right" if side(P) > 0 else "left": P}
        out.append(frame)
        prev = frame or prev
    return smooth(out)


def smooth(seq, k=2, jump=0.06):
    """Median over ±k frames per landmark; a frame that leaps from that median is dropped, not bent."""
    out = [dict() for _ in seq]
    for label in ("left", "right"):
        have = np.array([label in f for f in seq])
        arr = np.full((len(seq), 21, 3), np.nan)
        for i, f in enumerate(seq):
            if label in f:
                arr[i] = f[label]
        for i in np.where(have)[0]:
            win = arr[max(0, i - k): i + k + 1]
            med = np.nanmedian(win, axis=0)
            if np.nanmedian(np.linalg.norm(arr[i] - med, axis=1)) < jump:
                out[i][label] = med
    return out


# ── review sheet ─────────────────────────────────────────────────────────

QC_DIR = os.environ.get("RRD_QC")


def qc_sheet(slug, tmp, qc, n):
    """Six instants x three lenses with the estimated hands drawn, for a person to judge."""
    at = [int(n * f) for f in (0.08, 0.25, 0.42, 0.58, 0.75, 0.92)]
    rows = []
    for c in VIDEO_CAMS:
        fr = frames(os.path.join(tmp, f"{c}.mp4"), 0, 999)
        tiles = []
        for i in at:
            img = cv2.cvtColor(fr[min(i, len(fr) - 1)], cv2.COLOR_RGB2BGR).copy()
            for label in ("left", "right"):
                uv = qc.get((c, i, label))
                if uv is None:
                    continue
                col = HAND_COLOR[label][::-1]
                for a, b in BONES:
                    if not (np.isnan(uv[a]).any() or np.isnan(uv[b]).any()):
                        cv2.line(img, tuple(int(x) for x in uv[a]), tuple(int(x) for x in uv[b]), col, 2)
            cv2.putText(img, f"{c} {i / FPS:.1f}s", (6, 16), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 255, 255), 1)
            tiles.append(cv2.resize(img, (W // 2, H // 2)))
        rows.append(np.hstack(tiles))
    os.makedirs(QC_DIR, exist_ok=True)
    cv2.imwrite(os.path.join(QC_DIR, f"{slug}.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 80])


# ── one recording ─────────────────────────────────────────────────────────

def build(job):
    import rerun as rr
    import rerun.blueprint as rrb

    slug, folder, start, span, with_hands = job
    cal = json.load(open(os.path.join(folder, "calibration.json")))
    cams = {c: Cam(cal["cameras"][c], cal["tf_static"][c]) for c in CAMS}

    # Pose: primary-left in the clip's first-frame world. Held across unmeasured rows.
    pose = read_csv(os.path.join(folder, "camera_pose.csv"))
    by = {int(r["frame"]): r for r in pose}
    f0 = min(by)
    t0 = int(by[f0]["t_ns"])
    n = int(round(span * FPS))
    poses, last = [], None
    for k in range(n):
        r = by.get(f0 + int(round(start * FPS)) + k)
        if r and r["measured"] in ("1", "True", "true"):
            last = (np.array([float(r[a]) for a in "xyz"]), Rot.from_quat([float(r[a]) for a in ("qx", "qy", "qz", "qw")]))
        poses.append(last)
    first = next((p for p in poses if p is not None), (np.zeros(3), Rot.identity()))
    poses = [p or first for p in poses]
    measured = sum(1 for k in range(n) if (r := by.get(f0 + int(round(start * FPS)) + k)) and r["measured"] in ("1", "True", "true"))

    body_from_pl = (cams["primary_left"].R, cams["primary_left"].t)          # body <- primary-left
    pl_from_body = (body_from_pl[0].inv(), -body_from_pl[0].inv().apply(body_from_pl[1]))

    # IMU over the window, on the video clock (same device clock, per the README).
    imu = read_csv(os.path.join(folder, "imu.csv"))
    it = (np.array([int(r["t_ns"]) for r in imu]) - t0) / 1e9 - start
    sel = (it >= 0) & (it < span)
    acc = np.array([[float(r[a]) for a in ("ax", "ay", "az")] for r in imu])[sel]
    gyr = np.array([[float(r[a]) for a in ("gx", "gy", "gz")] for r in imu])[sel]
    it = it[sel]

    # Up: the accelerometer's mean over the window, in world coordinates. A head
    # rig reads +g (specific force) when still, and the window mean is dominated by it.
    Rw = [p[1] * pl_from_body[0] for p in poses]                            # world <- body, per frame
    idx = np.clip((it * FPS).astype(int), 0, n - 1)
    up_w = np.mean([Rw[i].apply(a) for i, a in zip(idx, acc)], axis=0)
    up_w /= np.linalg.norm(up_w)
    align, _ = Rot.align_vectors([[0, 0, 1]], [up_w])                         # scene <- world
    origin = poses[0][0]

    rr.init("tbrain_sample", recording_id=slug)
    with tempfile.TemporaryDirectory() as tmp:
        rr.log("world", rr.ViewCoordinates.RIGHT_HAND_Z_UP, static=True)
        rr.log("world/scene", rr.Transform3D(mat3x3=align.as_matrix(), translation=-align.apply(origin)), static=True)

        # The path, whole, then a marker that walks it.
        path = np.array([p[0] for p in poses])
        rr.log("world/scene/path", rr.LineStrips3D([path], colors=[(245, 180, 60)], radii=[0.004]), static=True)

        # Cameras on the rig.
        for c, cam in cams.items():
            ent = f"world/scene/head/body/{c}"
            rr.log(ent, rr.Transform3D(translation=cam.t, quaternion=rr.Quaternion(xyzw=cam.R.as_quat())), static=True)
            K = cam.K.copy() if cam.model != "ds" else np.array([[cam.D[0], 0, cam.D[2]], [0, cam.D[1], cam.D[3]], [0, 0, 1]])
            K[:2] *= cam.s
            K[0, 2] -= cam.ox
            K[1, 2] -= cam.oy
            rr.log(ent, rr.Pinhole(image_from_camera=K, resolution=[W, H], camera_xyz=rr.ViewCoordinates.RDF,
                                   image_plane_distance=0.05), static=True)
            if c not in VIDEO_CAMS:
                continue
            mp4 = os.path.join(tmp, f"{c}.mp4")
            encode(os.path.join(folder, f"source_{c}.mp4"), start, span, mp4)
            asset = rr.AssetVideo(path=mp4)
            rr.log(f"{ent}/video", asset, static=True)
            ts = asset.read_frame_timestamps_nanos()
            rr.send_columns(f"{ent}/video", indexes=[rr.TimeColumn("time", duration=ts * 1e-9)],
                            columns=rr.VideoFrameReference.columns_nanos(ts))
        rr.log("world/scene/head/body", rr.Transform3D(translation=pl_from_body[1],
                                                       quaternion=rr.Quaternion(xyzw=pl_from_body[0].as_quat())), static=True)

        tcol = rr.TimeColumn("time", duration=np.arange(n) / FPS)
        rr.send_columns("world/scene/head", indexes=[tcol], columns=rr.Transform3D.columns(
            translation=path, quaternion=np.array([p[1].as_quat() for p in poses])))
        rr.send_columns("world/scene/now", indexes=[tcol], columns=rr.Points3D.columns(positions=path).partition([1] * n))
        rr.log("world/scene/now", rr.Points3D.from_fields(radii=[0.015], colors=[(245, 180, 60)]), static=True)

        # IMU.
        itc = rr.TimeColumn("time", duration=it)
        for name, arr, unit in (("accel", acc, "m/s²"), ("gyro", gyr, "rad/s")):
            for k, ax in enumerate("xyz"):
                rr.log(f"imu/{name}/{ax}", rr.SeriesLines(names=f"{ax} ({unit})",
                                                         colors=[[(230, 90, 90), (90, 200, 120), (90, 140, 240)][k]]), static=True)
                rr.send_columns(f"imu/{name}/{ax}", indexes=[itc], columns=rr.Scalars.columns(scalars=arr[:, k]))

        # Hands — estimated.
        hands_frames = 0
        qc = {}
        if with_hands:
            dets = [detect(os.path.join(folder, f"source_{c}.mp4"), cams[c], start, span) for c in HAND_CAMS]
            m = min(len(dets[0]), len(dets[1]), n)
            dets = [d[:m] for d in dets]
            h3 = hands3d(dets, cams)
            rr.log("world/scene/head/body/hands_estimated", rr.TextDocument(
                "Estimated, not delivered: MediaPipe hand landmarks on the mid stereo pair, "
                "triangulated through the delivered fisheye calibration. Drawn only where both lenses agree."), static=True)
            # Columnar, one chunk per entity for the whole window; a frame with
            # no hand is an empty row. Bones are not stored: the annotation
            # context names the 21 keypoints and their connections once, and the
            # viewer draws the skeleton from the points.
            rr.log("world/scene", rr.AnnotationContext([
                rr.ClassDescription(info=rr.AnnotationInfo(id=k, label=f"{label} hand (estimated)", color=HAND_COLOR[label]),
                                    keypoint_connections=BONES)
                for k, label in enumerate(("left", "right"))]), static=True)
            tcol = rr.TimeColumn("time", duration=np.arange(len(h3)) / FPS)
            hands_frames = sum(bool(fr) for fr in h3)
            for k, label in enumerate(("left", "right")):
                ent = f"world/scene/head/body/hands_estimated/{label}"
                pts, ids, lens = [], [], []
                per_cam = {c: ([], [], []) for c in VIDEO_CAMS}
                for i, fr in enumerate(h3):
                    P = fr.get(label)
                    if P is None:
                        lens.append(0)
                        for c in VIDEO_CAMS:
                            per_cam[c][2].append(0)
                        continue
                    pts.extend(P), ids.extend(range(21)), lens.append(21)
                    for c in VIDEO_CAMS:
                        cam = cams[c]
                        uv = cam.to_preview(cam.project(cam.R.inv().apply(P - cam.t)))
                        ok = ~np.isnan(uv).any(1) & (uv[:, 0] >= 0) & (uv[:, 0] < W) & (uv[:, 1] >= 0) & (uv[:, 1] < H)
                        p2, i2, n2 = per_cam[c]
                        if ok.sum() >= 10:
                            qc[(c, i, label)] = uv
                            p2.extend(uv[ok]), i2.extend(np.where(ok)[0].tolist()), n2.append(int(ok.sum()))
                        else:
                            n2.append(0)
                rr.log(ent, rr.Points3D.from_fields(radii=[0.004], class_ids=[k], show_labels=False), static=True)
                rr.send_columns(ent, indexes=[tcol], columns=rr.Points3D.columns(
                    positions=np.array(pts, np.float32).reshape(-1, 3), keypoint_ids=np.array(ids, np.uint16)).partition(lens))
                for c in VIDEO_CAMS:
                    p2, i2, n2 = per_cam[c]
                    e2 = f"world/scene/head/body/{c}/hand_{label}"
                    rr.log(e2, rr.Points2D.from_fields(radii=[1.5], class_ids=[k], show_labels=False), static=True)
                    rr.send_columns(e2, indexes=[tcol], columns=rr.Points2D.columns(
                        positions=np.array(p2, np.float32).reshape(-1, 2), keypoint_ids=np.array(i2, np.uint16)).partition(n2))

        # A viewpoint behind and above the wearer, looking where the rig looks,
        # riding with the head. Rerun's own default frames the bounding box,
        # which on an 8-second window is a few centimetres of path and puts the
        # eye inside the image planes.
        fwd = align.apply(poses[0][1].apply([0, 0, 1]))
        fwd[2] = 0
        fwd = fwd / (np.linalg.norm(fwd) or 1)
        eye = rrb.EyeControls3D(position=(-0.7 * fwd + [0, 0, 0.4]).tolist(), look_target=(0.35 * fwd + [0, 0, -0.25]).tolist(),
                                eye_up=[0, 0, 1], tracking_entity="world/scene/head")
        # The 3D view draws the rig and what it measured; the pictures live in
        # the four camera panes. Textured image planes in 3D hid everything else.
        contents = ["+ world/**"] + [f"- world/scene/head/body/{c}/{x}" for c in CAMS for x in ("video", "hand_left", "hand_right")]
        cam_view = lambda c, label: rrb.Spatial2DView(name=label, origin=f"world/scene/head/body/{c}")
        bp = rrb.Blueprint(
            rrb.Horizontal(
                rrb.Spatial3DView(name="Rig, head path" + (" and hands (estimated)" if with_hands else ""), origin="world",
                                  contents=contents, eye_controls=eye,
                                  background=rrb.Background(color=(22, 22, 26))),
                rrb.Vertical(
                    rrb.Horizontal(cam_view("mid_left", "left eye"), cam_view("mid_right", "right eye")),
                    rrb.TimeSeriesView(name="Accelerometer (m/s²)", origin="imu/accel"),
                    rrb.TimeSeriesView(name="Gyroscope (rad/s)", origin="imu/gyro"),
                    row_shares=[2, 1, 1],
                ),
                column_shares=[5, 6],
            ),
            rrb.TimePanel(state="collapsed", timeline="time", play_state="playing", loop_mode="all"),
            rrb.BlueprintPanel(state="collapsed"),
            rrb.SelectionPanel(state="collapsed"),
            auto_views=False,
        )
        if QC_DIR and with_hands:
            qc_sheet(slug, tmp, qc, n)
        dest = os.path.join(OUT, f"{slug}.rrd")
        rr.save(dest, default_blueprint=bp)
        rr.disconnect()
    return slug, {"bytes": os.path.getsize(dest), "poseMeasured": round(measured / n, 3),
                  "handFrames": round(hands_frames / n, 3) if with_hands else None,
                  "rig": "B" if cams["mid_left"].model == "ds" else "A"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only")
    ap.add_argument("--procs", type=int, default=6)
    # Off by default: the estimate is MediaPipe as the method, which the hand-pose
    # brief reserves as the ruler. Kept for comparison runs, not for the page.
    ap.add_argument("--with-hands", action="store_true")
    ap.add_argument("--job", help=argparse.SUPPRESS)
    a = ap.parse_args()
    if a.job:
        _, info = build(tuple(json.loads(a.job)))
        print(json.dumps(info))
        return
    os.makedirs(OUT, exist_ok=True)
    samples = json.load(open(os.path.join(LIB, "samples.json")))
    live = [r["slug"] for r in samples if r["modality"] == "egocentric" and r.get("tier") == "stereo"]
    if a.only:
        live = [s for s in live if s in a.only.split(",")]
    where = folders()
    jobs = []
    for s in live:
        tel = json.load(open(os.path.join(PUB, "telemetry", f"{s}.json")))
        span = len(tel["rows"]) / 30.0
        jobs.append((s, where[s], float(tel["offsetSec"]), span, a.with_hands))
    idx_path = os.path.join(LIB, "rrd.json")
    index = json.load(open(idx_path)) if os.path.exists(idx_path) and a.only else {}
    # One child process per recording: rerun's recording stream and a
    # multiprocessing Pool worker hung together on macOS, so each job gets a
    # fresh interpreter and reports one JSON line back.
    pending, running, done = list(jobs), [], 0
    while pending or running:
        while pending and len(running) < a.procs:
            j = pending.pop(0)
            p = subprocess.Popen([sys.executable, __file__, "--job", json.dumps(j)], stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, text=True)
            running.append((j[0], p))
        for slug, p in list(running):
            if p.poll() is None:
                continue
            running.remove((slug, p))
            done += 1
            out, err = p.communicate()
            if p.returncode:
                print(f"[{done:3}/{len(jobs)}] {slug:30} FAILED\n{err[-800:]}", flush=True)
                continue
            info = json.loads(out.strip().splitlines()[-1])
            index[slug] = info
            print(f"[{done:3}/{len(jobs)}] {slug:30} {info['bytes']/1e6:5.2f} MB  pose {info['poseMeasured']:.0%}  hands {info['handFrames']}", flush=True)
        time.sleep(0.2)
    index = {k: index[k] for k in sorted(index) if k in {r['slug'] for r in samples}}
    with open(idx_path, "w") as fh:
        json.dump(index, fh, indent=2)
        fh.write("\n")


if __name__ == "__main__":
    main()
