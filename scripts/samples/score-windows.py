#!/usr/bin/env python3
"""Score every half-second of a clip for how good an 8-second preview it makes.

Written after a review of the stereo and six-camera pages (2026-09-24) sent back
16 of 117 previews: seven that do not show the main action, two blurred, glared
or shaking, five where the hands cannot be read, two six-camera sessions. All
sixteen are the same mistake. `ingest-approved.py` chose its window on one
criterion — no hand cut by the frame edge — and broke ties toward the middle of
the clip. A hand resting at the side of a workbench passes that test as well as
a hand driving a saw, so the chooser was indifferent between them.

This measures what it ignored, per half-second bucket, on the preview's own
480x360 crop:

  seen, cut   whole hands in frame, and hands sliced by the edge — the existing
              `check-cut-hands.hands` criterion, imported rather than copied
  active      motion of the hands against the scene: dense optical flow in the
              skin mask, minus the frame's median flow so a turning head does
              not read as work. Hands that are present and still score low.
  sharp       variance of the Laplacian — focus and motion blur
  glare       share of pixels at or near full scale
  shake       gyro magnitude from imu.csv where the clip has one (rad/s);
              otherwise the median optical flow of the whole frame

and then ranks every 8-second window. Scores are standardised within the clip
before they are combined, so a dim workshop is not compared against a sunny
street; the raw means are kept as well, for flagging clips that are weak across
the whole corpus rather than only against themselves.

What this cannot measure is whether the motion is the TASK. "Painting a wall"
and "walking to the wall with a brush" both move the hands. So the output is
three ranked candidates per clip and a contact sheet, and a person picks.

Usage:
  python3 scripts/samples/score-windows.py --list jobs.json --out DIR [--procs 6]

jobs.json: [{"slug", "lens", "video", "imu"?: path, "pose"?: path, "flip"?: bool}]
"""

import argparse
import csv
import importlib.util
import json
import math
import os
import subprocess
import sys
from multiprocessing import Pool

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location("check_cut_hands", os.path.join(HERE, "check-cut-hands.py"))
checker = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(checker)

W, H = 480, 360
FPS = 6            # decode rate; flow runs between consecutive decoded frames
BUCKET = 0.5       # seconds per scored bucket
SECONDS = 8.0
CROP = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"


def frames(path, flip):
    vf = ("hflip,vflip," if flip else "") + f"fps={FPS},{CROP}"
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", vf, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        check=True, capture_output=True,
    ).stdout
    n = len(raw) // (W * H * 3)
    return np.frombuffer(raw[: n * W * H * 3], np.uint8).reshape(n, H, W, 3)


def gyro_series(imu, pose):
    """(seconds on the video clock, |ω|) — aligned the way ingest-approved.py aligns telemetry."""
    if not imu or not os.path.exists(imu):
        return None
    t0 = None
    if pose and os.path.exists(pose):
        with open(pose, newline="") as fh:
            rows = list(csv.DictReader(fh))
        f0 = min(rows, key=lambda r: int(r["frame"]))
        t0 = int(f0["t_ns"])
    ts, gm = [], []
    with open(imu, newline="") as fh:
        for r in csv.DictReader(fh):
            ts.append(int(r["t_ns"]))
            gm.append(math.sqrt(float(r["gx"]) ** 2 + float(r["gy"]) ** 2 + float(r["gz"]) ** 2))
    if t0 is None:
        t0 = ts[0]
    return (np.array(ts, dtype=np.float64) - t0) / 1e9, np.array(gm)


def score_clip(job):
    slug, lens = job["slug"], job["lens"]
    fr = frames(job["video"], job.get("flip", False))
    n = len(fr)
    per = int(round(BUCKET * FPS))
    buckets = []
    small_prev = None
    gyro = gyro_series(job.get("imu"), job.get("pose"))
    for b in range(0, n, per):
        chunk = fr[b : b + per]
        t = b / FPS
        mid = chunk[len(chunk) // 2]
        seen, cut = checker.hands(mid)
        gray = cv2.cvtColor(mid, cv2.COLOR_BGR2GRAY)
        sharp = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        glare = float((mid.max(axis=2) >= 250).mean())
        act, glob = [], []
        for f in chunk:
            small = cv2.cvtColor(cv2.resize(f, (W // 2, H // 2)), cv2.COLOR_BGR2GRAY)
            if small_prev is not None:
                flow = cv2.calcOpticalFlowFarneback(small_prev, small, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                med = np.median(flow.reshape(-1, 2), axis=0)
                resid = np.linalg.norm(flow - med, axis=2)
                glob.append(float(np.linalg.norm(med)))
                mask = cv2.resize(checker.cut_posters.skin_mask(f), (W // 2, H // 2)) > 0
                mask = cv2.dilate(mask.astype(np.uint8), np.ones((7, 7), np.uint8)) > 0
                act.append(float(resid[mask].mean()) if mask.sum() > 200 else 0.0)
            small_prev = small
        shake = None
        if gyro is not None:
            gt, gm = gyro
            sel = (gt >= t) & (gt < t + BUCKET)
            shake = float(gm[sel].mean()) if sel.any() else None
        buckets.append({
            "t": round(t, 2), "seen": int(seen), "cut": int(cut),
            "active": round(float(np.mean(act)) if act else 0.0, 4),
            "sharp": round(sharp, 1), "glare": round(glare, 4),
            "glob": round(float(np.mean(glob)) if glob else 0.0, 4),
            "shake": None if shake is None else round(shake, 4),
        })
    return {"slug": slug, "lens": lens, "duration": round(n / FPS, 2), "buckets": buckets,
            "hasImu": gyro is not None}


def z(xs):
    a = np.array(xs, dtype=np.float64)
    sd = a.std()
    return (a - a.mean()) / sd if sd > 1e-9 else np.zeros_like(a)


def rank(clip):
    """Top windows by a within-clip standardised score. Returns the list, best first."""
    bs = clip["buckets"]
    k = int(round(SECONDS / BUCKET))
    if len(bs) < 2:
        return []
    k = min(k, len(bs))
    shake_raw = [b["shake"] if b["shake"] is not None else b["glob"] for b in bs]
    za, zs, zg, zk = z([b["active"] for b in bs]), z([b["sharp"] for b in bs]), z([b["glare"] for b in bs]), z(shake_raw)
    out = []
    for s in range(0, len(bs) - k + 1):
        w = slice(s, s + k)
        seen = np.mean([b["seen"] > 0 for b in bs[w]])
        cut = sum(b["cut"] for b in bs[w])
        score = (1.0 * za[w].mean() + 1.2 * seen + 0.4 * zs[w].mean()
                 - 0.5 * zk[w].mean() - 0.6 * zg[w].mean() - 0.8 * cut)
        out.append({
            "start": bs[s]["t"], "score": round(float(score), 3), "cut": int(cut),
            "seen": round(float(seen), 2),
            "active": round(float(np.mean([b["active"] for b in bs[w]])), 3),
            "sharp": round(float(np.mean([b["sharp"] for b in bs[w]])), 1),
            "glare": round(float(np.mean([b["glare"] for b in bs[w]])), 4),
            "shake": round(float(np.mean(shake_raw[w])), 4),
        })
    out.sort(key=lambda o: -o["score"])
    # Three candidates that do not overlap by more than half a window.
    picked = []
    for o in out:
        if all(abs(o["start"] - p["start"]) >= SECONDS / 2 for p in picked):
            picked.append(o)
        if len(picked) == 3:
            break
    return picked


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--procs", type=int, default=6)
    a = ap.parse_args()
    jobs = json.load(open(a.list))
    os.makedirs(a.out, exist_ok=True)
    todo = [j for j in jobs if not os.path.exists(os.path.join(a.out, f"{j['slug']}__{j['lens']}.json"))]
    print(f"{len(jobs)} jobs, {len(todo)} to score", flush=True)
    with Pool(a.procs) as pool:
        for i, res in enumerate(pool.imap_unordered(score_clip, todo), 1):
            res["candidates"] = rank(res)
            with open(os.path.join(a.out, f"{res['slug']}__{res['lens']}.json"), "w") as fh:
                json.dump(res, fh)
            best = res["candidates"][0] if res["candidates"] else {}
            print(f"[{i:3}/{len(todo)}] {res['slug']:30} {res['lens']:13} best @{best.get('start')} score {best.get('score')}", flush=True)


if __name__ == "__main__":
    main()
