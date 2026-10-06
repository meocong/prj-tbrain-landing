#!/usr/bin/env python3
"""Render the public camera previews: the real mid_left video with the hand pose drawn over it.

    python3 render-overlay.py [--only 13]

Only samples whose curation tier is "video" (operator consent for a public preview on record) are
rendered. A hand-pose page with no real footage asks a buyer to trust a drawing; every comparable
dataset page shows its poses over the frames they were estimated from, and so does this one.

Inputs (private, never committed):
  <cache>/rgb/<episode>/source_mid_left.mp4   the camera the 2D joints (uv2d) are expressed in
  <research>/npz/<episode>/hands.npz          uv2d per hand, plus the state flags
  ~/.cache/tbrain-samples/models/              yunet.onnx (faces), yolox_s.onnx (people)

Anonymisation, before anything is cropped or drawn:
  * every face YuNet finds is blurred (box grown 1.9x);
  * every person YOLOX finds who is not the wearer has the upper half of the box blurred, which
    covers a head seen from behind or in profile that the face detector misses. A person box that
    holds one of the wearer's hand keypoints, or reaches the bottom edge, is the wearer's own body
    and is left alone (faces are still blurred wherever they are);
  * every region is held for HOLD frames either side, so a detector that blinks for a frame does
    not let a face through;
  * the frame is then cropped to the hands, which leaves most of the room out of the picture.
The result still has to be looked at: render, then view the contact sheet this script writes.

Outputs (same paths the skeleton renders used, so the page needs no new wiring):
  public/samples/hand-pose/video/hand-pose-NN.mp4   full length, 540x540
  public/samples/clips/hand-pose-NN.mp4             6 s card loop, 640x480, cross-faded seam
  public/samples/posters/hand-pose-NN.jpg           800x600 card poster
  public/samples/hand-pose/stills/hand-pose-NN.jpg  720x720 viewer poster
  public/samples/hand-pose/hero-13.mp4/.jpg, hero.jpg, og.jpg   for the hero sample
"""
from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

import cv2
import numpy as np

import hp_common as C
import hp_render as R

MODELS = Path("~/.cache/tbrain-samples/models").expanduser()
RGB_ROOT = C.CACHE / "rgb"
CONTACT_DIR = C.CACHE / "overlay-review"  # private: frames to look at before publishing

HOLD = 8              # frames a blur region is kept either side of a detection
FACE_GROW = 1.9
PERSON_TOP = 0.5      # share of a bystander's box, from the top, that is blurred
SMOOTH_SIGMA = 18.0   # frames; the crop drifts with the hands instead of jumping
LOOP_FRAMES = 180     # 6 s card and hero loops
XFADE = 15

# The crop is drawn at 720 (the still) and the full-length video is written at 540: real footage
# costs about 17 MB at 720 for 75 s, about 5 MB at 540, and the viewer shows it at up to 540.
CROP_SIDE, VIDEO_SIDE, CARD_W, CARD_H, HERO_W, HERO_H = 720, 540, 640, 480, 1280, 720


# ---------------------------------------------------------------- detectors -

class Detectors:
    def __init__(self, w: int, h: int):
        self.face = cv2.FaceDetectorYN.create(str(MODELS / "yunet.onnx"), "", (w, h), 0.45, 0.3, 5000)
        self.net = cv2.dnn.readNet(str(MODELS / "yolox_s.onnx"))
        s = 640
        grids, strides = [], []
        for st in (8, 16, 32):
            g = s // st
            yv, xv = np.meshgrid(np.arange(g), np.arange(g), indexing="ij")
            grids.append(np.stack((xv, yv), 2).reshape(-1, 2))
            strides.append(np.full((g * g, 1), st))
        self.grids, self.strides = np.concatenate(grids), np.concatenate(strides)

    def faces(self, im) -> list[tuple[int, int, int, int]]:
        _, f = self.face.detect(im)
        return [] if f is None else [tuple(int(v) for v in x[:4]) for x in f]

    def people(self, im, conf=0.3) -> list[tuple[int, int, int, int]]:
        h, w = im.shape[:2]
        s = 640
        r = min(s / h, s / w)
        pad = np.full((s, s, 3), 114, np.uint8)
        rs = cv2.resize(im, (int(w * r), int(h * r)))
        pad[: rs.shape[0], : rs.shape[1]] = rs
        self.net.setInput(cv2.dnn.blobFromImage(pad))
        out = self.net.forward()[0]
        out[:, :2] = (out[:, :2] + self.grids) * self.strides
        out[:, 2:4] = np.exp(out[:, 2:4]) * self.strides
        sc = out[:, 4] * out[:, 5]  # COCO class 0, person
        keep = sc > conf
        b, sc = out[keep, :4], sc[keep]
        xywh = np.stack([b[:, 0] - b[:, 2] / 2, b[:, 1] - b[:, 3] / 2, b[:, 2], b[:, 3]], 1) / r
        idx = cv2.dnn.NMSBoxes(xywh.tolist(), sc.tolist(), conf, 0.45)
        return [tuple(int(v) for v in xywh[i]) for i in np.array(idx).flatten()]


def grow(box, k):
    x, y, w, h = box
    cx, cy = x + w / 2, y + h / 2
    return (int(cx - w * k / 2), int(cy - h * k / 2), int(w * k), int(h * k))


def contains_any(box, pts, need=3) -> bool:
    x, y, w, h = box
    return bool(((pts[:, 0] >= x) & (pts[:, 0] <= x + w) & (pts[:, 1] >= y) & (pts[:, 1] <= y + h)).sum() >= need)


def blur_regions(im, regions):
    h, w = im.shape[:2]
    for x, y, bw, bh in regions:
        x0, y0, x1, y1 = max(0, x), max(0, y), min(w, x + bw), min(h, y + bh)
        if x1 - x0 < 4 or y1 - y0 < 4:
            continue
        roi = im[y0:y1, x0:x1]
        # Pixelate, then blur: nothing of a face survives either step alone being undone.
        small = cv2.resize(roi, (max(1, (x1 - x0) // 14), max(1, (y1 - y0) // 14)), interpolation=cv2.INTER_AREA)
        roi = cv2.resize(small, (x1 - x0, y1 - y0), interpolation=cv2.INTER_NEAREST)
        k = max(15, ((min(x1 - x0, y1 - y0) // 3) | 1))
        im[y0:y1, x0:x1] = cv2.GaussianBlur(roi, (k, k), 0)


# ---------------------------------------------------------------- drawing ---

def _dash(img, p, q, col, w, on, off):
    p, q = np.asarray(p, float), np.asarray(q, float)
    d = np.linalg.norm(q - p)
    if d < 1:
        return
    u = (q - p) / d
    t = 0.0
    while t < d:
        a, b = p + u * t, p + u * min(t + on, d)
        cv2.line(img, tuple(np.int32(a)), tuple(np.int32(b)), col, w, cv2.LINE_AA)
        t += on + off


def draw_hand(img, P, state, side, s):
    """P: (21, 2) in output pixels. Same vocabulary as the skeleton renders and the legend."""
    col = R.COL[side]
    dark = (20, 16, 14)
    lw = max(2, int(round(2.6 * s)))
    if state == C.MEASURED:
        poly = np.int32(P[R.PALM])
        ov = img.copy()
        cv2.fillPoly(ov, [poly], col, cv2.LINE_AA)
        cv2.addWeighted(ov, 0.18, img, 0.82, 0, img)
        for a, b in R.ALL_BONES:  # a dark rim first, so the line reads on a bright frame
            cv2.line(img, tuple(np.int32(P[a])), tuple(np.int32(P[b])), dark, lw + 3, cv2.LINE_AA)
        for a, b in R.ALL_BONES:
            cv2.line(img, tuple(np.int32(P[a])), tuple(np.int32(P[b])), col, lw, cv2.LINE_AA)
        for k in range(21):
            cv2.circle(img, tuple(np.int32(P[k])), int(round(3.6 * s)) + 1, dark, -1, cv2.LINE_AA)
            cv2.circle(img, tuple(np.int32(P[k])), int(round(3.6 * s)), col, -1, cv2.LINE_AA)
    elif state == C.GUESSED:
        for a, b in R.ALL_BONES:
            _dash(img, P[a], P[b], dark, lw + 3, 7 * s, 5 * s)
            _dash(img, P[a], P[b], col, lw, 7 * s, 5 * s)
        for k in range(21):
            cv2.circle(img, tuple(np.int32(P[k])), int(round(3.6 * s)), dark, -1, cv2.LINE_AA)
            cv2.circle(img, tuple(np.int32(P[k])), int(round(3.6 * s)), col, max(1, int(1.6 * s)), cv2.LINE_AA)
    elif state == C.BRIDGED:
        for a, b in R.ALL_BONES:
            _dash(img, P[a], P[b], col, max(2, lw - 1), 1.5 * s, 5 * s)
        for k in range(21):
            cv2.circle(img, tuple(np.int32(P[k])), int(round(2.4 * s)), col, max(1, int(1.2 * s)), cv2.LINE_AA)
    else:
        return
    # The ringed L / R at the wrist, as in every other surface of the set.
    c = (int(P[0][0]), int(P[0][1] + 18 * s))
    r = int(round(9 * s))
    cv2.circle(img, c, r, dark, -1, cv2.LINE_AA)
    cv2.circle(img, c, r, col, max(1, int(1.6 * s)), cv2.LINE_AA)
    t = "L" if side == "left" else "R"
    fs = 0.45 * s
    (tw, th), _ = cv2.getTextSize(t, cv2.FONT_HERSHEY_SIMPLEX, fs, max(1, int(1.5 * s)))
    cv2.putText(img, t, (c[0] - tw // 2, c[1] + th // 2), cv2.FONT_HERSHEY_SIMPLEX, fs, col, max(1, int(1.5 * s)), cv2.LINE_AA)


# ---------------------------------------------------------------- crop ------

def smooth(a: np.ndarray, sigma: float) -> np.ndarray:
    """Gaussian smoothing over time; gaps (NaN) are filled by interpolation first."""
    a = a.astype(float)
    idx = np.arange(len(a))
    ok = np.isfinite(a)
    a = np.interp(idx, idx[ok], a[ok]) if ok.any() else np.zeros_like(a)
    r = int(3 * sigma)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    return np.convolve(np.pad(a, r, mode="edge"), k, mode="valid")


def crop_track(uv: dict, state: dict, frames: int, w: int, h: int):
    cx, cy, ext = np.full(frames, np.nan), np.full(frames, np.nan), np.full(frames, np.nan)
    for i in range(frames):
        pts = [uv[s][i] for s in C.SIDES if state[s][i] != C.NONE and np.isfinite(uv[s][i]).all()]
        if pts:
            P = np.concatenate(pts)
            lo, hi = P.min(0), P.max(0)
            cx[i], cy[i] = (lo + hi) / 2
            ext[i] = max(hi - lo)
    side = np.clip(smooth(ext, SMOOTH_SIGMA) * 1.75, 640, h)
    return smooth(cx, SMOOTH_SIGMA), smooth(cy, SMOOTH_SIGMA), side


def window(cx, cy, cw, ch, w, h):
    x0 = int(round(min(max(cx - cw / 2, 0), w - cw)))
    y0 = int(round(min(max(cy - ch / 2, 0), h - ch)))
    return x0, y0, int(round(cw)), int(round(ch))


# ---------------------------------------------------------------- encode ----

def encoder(path: Path, w: int, h: int, crf: int):
    path.parent.mkdir(parents=True, exist_ok=True)
    return subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", "30", "-i", "-",
         "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-preset", "slow", "-crf", str(crf),
         "-g", "30", "-keyint_min", "30", "-sc_threshold", "0", "-an", "-movflags", "+faststart",
         "-map_metadata", "-1", "-fflags", "+bitexact", "-flags:v", "+bitexact", str(path)],
        stdin=subprocess.PIPE)


def jpeg(path: Path, img, q=84):
    path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(path), img, [cv2.IMWRITE_JPEG_QUALITY, q])


# ---------------------------------------------------------------- main ------

def render(sample: C.Sample, plan: dict):
    slug = sample.slug
    src = RGB_ROOT / sample.episode / "source_mid_left.mp4"
    C.check(src.exists(), f"{slug}: camera video not in the private cache (rgb/)")
    hands = C.Hands(sample)
    frames = sample.frames
    state = {s: hands.state(s) for s in C.SIDES}
    uv = {s: hands.per_frame(s, "uv2d", np.float32, np.nan) for s in C.SIDES}

    cap = cv2.VideoCapture(str(src))
    W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    C.check(int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) >= frames, f"{slug}: camera video is shorter than the delivery")
    det = Detectors(W, H)

    # Pass 1: detect on every frame.
    regions = [[] for _ in range(frames)]
    for i in range(frames):
        ok, im = cap.read()
        C.check(ok, f"{slug}: could not decode frame {i}")
        wearer = np.concatenate([uv[s][i] for s in C.SIDES if np.isfinite(uv[s][i]).all()] or [np.zeros((0, 2))])
        for f in det.faces(im):
            regions[i].append(grow(f, FACE_GROW))
        for p in det.people(im):
            # The wearer is in every frame of a head-worn camera: their arms hold the hand
            # keypoints, and their lap and chest reach the bottom edge. Blurring those would
            # blur the work itself. Anyone else stands further off, above that edge.
            if len(wearer) and contains_any(grow(p, 1.15), wearer, need=1):
                continue
            if p[1] + p[3] > 0.92 * H:
                continue
            x, y, w, h = p
            regions[i].append((x - w // 10, y - h // 20, int(w * 1.2), int(h * PERSON_TOP)))
        if i % 300 == 0:
            print(f"{slug}: detected {i}/{frames}", flush=True)
    held = [sum(regions[max(0, i - HOLD): i + HOLD + 1], []) for i in range(frames)]

    cx, cy, side = crop_track(uv, state, frames, W, H)
    loop = plan.get("loop") or {"start": frames // 2, "frames": 60}
    mid = loop["start"] + loop["frames"] // 2
    a0 = int(min(max(mid - LOOP_FRAMES // 2, 0), frames - LOOP_FRAMES))
    poster_f = int(plan.get("posterFrame") or mid)
    hero = sample.n == C.HERO_SAMPLE

    out_video = encoder(C.media_file("video", slug), VIDEO_SIDE, VIDEO_SIDE, 31)
    card_frames, hero_frames, review = [], [], []
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
    for i in range(frames):
        ok, im = cap.read()
        blur_regions(im, held[i])

        def view(cw, ch, ow, oh, shift=0.0):
            x0, y0, w0, h0 = window(cx[i] - shift * cw, cy[i], cw, ch, W, H)
            img = cv2.resize(im[y0:y0 + h0, x0:x0 + w0], (ow, oh), interpolation=cv2.INTER_AREA)
            s = ow / w0
            for sd in C.SIDES:
                if state[sd][i] != C.NONE and np.isfinite(uv[sd][i]).all():
                    draw_hand(img, (uv[sd][i] - [x0, y0]) * s, state[sd][i], sd, max(1.0, ow / 540))
            return img

        sq = view(side[i], side[i], CROP_SIDE, CROP_SIDE)
        out_video.stdin.write(cv2.resize(sq, (VIDEO_SIDE, VIDEO_SIDE), interpolation=cv2.INTER_AREA).tobytes())
        if i == poster_f:
            jpeg(C.media_file("still", slug), sq, 84)
            jpeg(C.media_file("poster", slug), view(side[i] * 4 / 3, side[i], 800, 600), 84)
        if a0 <= i < a0 + LOOP_FRAMES:
            card_frames.append(view(min(side[i] * 4 / 3, W), side[i], CARD_W, CARD_H))
            if hero:
                hch = min(H, side[i] * 1.1)
                hero_frames.append(view(min(hch * 16 / 9, W), hch, HERO_W, HERO_H, shift=0.18))
        if i % 150 == 0:
            review.append(cv2.resize(sq, (360, 360)))
    out_video.stdin.close()
    out_video.wait()

    def write_loop(path, seq, w, h, crf):
        n = len(seq) - XFADE
        enc = encoder(path, w, h, crf)
        for k in range(n):
            f = seq[k]
            if k < XFADE:  # the last XFADE frames dissolve into the first, so the seam does not jump
                t = k / XFADE
                f = cv2.addWeighted(seq[k], t, seq[n + k], 1 - t, 0)
            enc.stdin.write(f.tobytes())
        enc.stdin.close()
        enc.wait()
        return n

    n = write_loop(C.media_file("loop", slug), card_frames, CARD_W, CARD_H, 27)
    if hero:
        write_loop(C.HP_DIR / "hero-13.mp4", hero_frames, HERO_W, HERO_H, 27)
        first = cv2.addWeighted(hero_frames[0], 0.0, hero_frames[n], 1.0, 0)  # frame 0 of the loop as written
        jpeg(C.HP_DIR / "hero-13.jpg", first, 84)
        jpeg(C.HP_DIR / "hero.jpg", cv2.resize(first, (1600, 900), interpolation=cv2.INTER_CUBIC), 84)
        og = cv2.resize(first, (1200, 675), interpolation=cv2.INTER_AREA)[22:652]
        jpeg(C.HP_DIR / "og.jpg", og, 84)

    CONTACT_DIR.mkdir(parents=True, exist_ok=True)
    rows = [np.hstack(review[k:k + 4] + [np.zeros_like(review[0])] * (4 - len(review[k:k + 4]))) for k in range(0, len(review), 4)]
    cv2.imwrite(str(CONTACT_DIR / f"{slug}-sheet.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 80])
    blurred = sum(1 for r in held if r)
    print(f"{slug}: {frames} frames, blur on {blurred} frames, loop {a0}+{n}, poster {poster_f}", flush=True)
    return {"loop": {"start": a0, "frames": n, "crossfadeFrames": XFADE}, "posterFrame": poster_f}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", type=int, action="append")
    args = ap.parse_args()
    plan = json.loads(C.RENDER_PLAN_JSON.read_text())
    for sample in C.load_samples():
        if sample.preview != "video" or (args.only and sample.n not in args.only):
            continue
        entry = plan["samples"][sample.slug]
        got = render(sample, entry)
        entry.update(got)
        entry["note"] = "camera video with the 2D hand pose drawn over it; faces and bystanders blurred"
    C.RENDER_PLAN_JSON.write_text(json.dumps(plan, indent=2) + "\n")


if __name__ == "__main__":
    main()
