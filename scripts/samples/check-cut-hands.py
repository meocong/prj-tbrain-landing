#!/usr/bin/env python3
"""Which preview clips cut a hand off at the edge of the frame.

Thạch, 2026-09-11: "bắt buộc phải cover tay chứ không được mất cái bàn tay dù
chỉ 1 ít." Same complaint Tam made about the posters on 2026-09-09 — "chị vào
xem thấy cắt tay" — but moved from one frame to every frame. A poster is one
still somebody chose; a preview is eight seconds that plays on hover, and half
a hand crossing the edge mid-clip reads as a mistake exactly the way half a
hand in a still does.

## The criterion

`cut-posters.py`'s, and its skin mask is imported rather than copied so there
is one definition in this repo instead of two that drift. What survived two
wrong versions there:

    the peak of a blob's distance transform is its palm. It must have a real
    radius — a wrist is thin, a palm is not — and it must sit at least its own
    radius clear of every border. The forearm may leave the frame; the palm may
    not.

Two things are different here, and both come out of scoring every frame rather
than picking the best one.

**Every blob, not the largest.** `score()` looks at the biggest skin component
because it is choosing one frame out of twenty-eight and only needs the frame
to contain one good hand. The rule this file enforces is the opposite shape: a
second hand sliced by the edge is a cut hand even when the first one is
perfect, so every hand-sized component has to pass.

**No hand is not a cut hand.** An operator reaches for a tool and their hands
leave the shot; that is work, not a framing defect. A component only has an
opinion if it is thick enough to be a palm at all. Anything thinner is a
forearm or a finger crossing the border, and those are allowed out.

## It is a heuristic

Stated as one in `cut-posters.py` and no truer here: MediaPipe does not run on
this machine (1.0.1 aborts in `TensorsToDetectionsCalculator::Open`). Skin
colour plus blob thickness is what is left. Check a run with `--montage`, which
writes a contact sheet of the worst offending frame from each failing clip, and
look at it before deleting anything.

Needs OpenCV, which lives on python3.14 here and not on the 3.9 that `python3`
resolves to:

    python3.14 scripts/samples/check-cut-hands.py --dir /tmp/stereo-in \\
        [--every 0.2] [--montage /tmp/cuts.jpg] [--json out.json]
"""

import argparse
import importlib.util
import json
import os
import sys

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

# `cut-posters.py` is not an importable module name. Load it by path.
_spec = importlib.util.spec_from_file_location("cut_posters", os.path.join(HERE, "cut-posters.py"))
cut_posters = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(cut_posters)

SAMPLES = os.path.join(ROOT, "src", "lib", "samples", "samples.json")

# A component this thin is a wrist, a forearm or a finger, not a palm. Same
# number `cut-posters.py` rejects on, for the same reason.
MIN_PALM_RADIUS = 9
# How much of its own radius the palm must keep between itself and the border.
CLEAR = 0.9
# Below this fraction of frame a blob is noise, not a hand.
MIN_AREA = 0.004


def _border_distance(h, w):
    """Distance from every pixel to the nearest edge of the frame."""
    ys = np.minimum(np.arange(h), h - 1 - np.arange(h)).astype(np.float32)
    xs = np.minimum(np.arange(w), w - 1 - np.arange(w)).astype(np.float32)
    return np.minimum(ys[:, None], xs[None, :])


def hands(bgr, _cache={}):
    """(hands seen, hands clipped by the border) in one frame.

    The test is "does a palm-sized circle fit inside this blob AND inside the
    frame", not "is the blob's thickest point near an edge". The difference is
    the whole ballgame, and the first version of this file got it wrong: a hand
    and its forearm are ONE skin component, the forearm always runs off the
    edge in head-mounted capture, and when the arm is nearer the lens than the
    hand it is also the THICKEST part of the blob. So the distance transform's
    global peak lands in the forearm, a pixel from the border, and a frame with
    two perfectly framed hands in it gets called a cut hand. That version
    flagged 108 of 110 clips; the montage it wrote is almost entirely hands
    comfortably inside the frame.

    Taking `min(distance-into-blob, distance-to-border)` asks the question that
    was meant all along. Its maximum over the blob is the radius of the largest
    circle that is inside the hand and inside the picture at once. If that
    reaches palm size, a whole hand is in shot however much arm left with it.
    """
    h, w = bgr.shape[:2]
    if _cache.get("shape") != (h, w):
        _cache["shape"], _cache["border"] = (h, w), _border_distance(h, w)
    border = _cache["border"]

    m = cut_posters.skin_mask(bgr)
    n, labels, stats, _ = cv2.connectedComponentsWithStats(m, 8)
    seen = clipped = 0
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] / float(h * w) < MIN_AREA:
            continue
        blob = (labels == i).astype(np.uint8)
        inside = cv2.distanceTransform(blob, cv2.DIST_L2, 5)
        # Is any part of this blob thick enough to be a palm at all? A wrist,
        # a finger or a bare forearm crossing the corner is not a hand and is
        # allowed to leave the shot.
        if inside.max() < MIN_PALM_RADIUS:
            continue
        seen += 1
        # The largest circle that fits in the blob AND in the frame.
        whole = float(np.minimum(inside, border).max())
        if whole < MIN_PALM_RADIUS * CLEAR:
            clipped += 1
    return seen, clipped


def scan(path, every):
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(1, int(round(fps * every)))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)

    scored = with_hand = bad = 0
    worst = None
    i = 0
    while i < total:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, frame = cap.read()
        if not ok:
            break
        seen, clipped = hands(frame)
        scored += 1
        if seen:
            with_hand += 1
        if clipped:
            bad += 1
            if worst is None or clipped > worst[0]:
                worst = (clipped, frame.copy())
        i += step
    cap.release()
    return scored, with_hand, bad, (worst[1] if worst else None)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default=os.path.join(ROOT, "public", "samples", "clips"))
    ap.add_argument("--every", type=float, default=0.2, help="seconds between sampled frames")
    ap.add_argument("--tier", default="stereo")
    ap.add_argument("--slugs", nargs="*")
    ap.add_argument("--json", dest="out")
    ap.add_argument("--montage", help="contact sheet of the worst frame per failing clip")
    args = ap.parse_args()

    records = json.load(open(SAMPLES))
    slugs = args.slugs or sorted(s["slug"] for s in records if s.get("tier") == args.tier)

    rows, gallery = [], []
    for slug in slugs:
        per, shot = {}, None
        for view in ("", "-right"):
            p = os.path.join(args.dir, f"{slug}{view}.mp4")
            if not os.path.exists(p):
                continue
            r = scan(p, args.every)
            if not r:
                continue
            per[view or "left"] = r[:3]
            if r[3] is not None and shot is None:
                shot = r[3]
        if not per:
            continue
        # The worse eye decides: a pair is one card, and a hand cut in the right
        # eye is on screen just as much as one cut in the left.
        scored = max(v[0] for v in per.values())
        with_hand = max(v[1] for v in per.values())
        bad = max(v[2] for v in per.values())
        rows.append({"slug": slug, "frames": scored, "with_hand": with_hand,
                     "cut": bad, "ratio": round(bad / scored, 3) if scored else 0.0})
        if bad and shot is not None:
            gallery.append((slug, shot))
        print(f"{slug:<26} frames={scored:3d}  hand={with_hand:3d}  cut={bad:3d}"
              f"  {bad / scored * 100 if scored else 0:5.1f}%", flush=True)

    clean = [r for r in rows if r["cut"] == 0]
    print(f"\n{len(rows)} clips   clean {len(clean)}   with a cut hand {len(rows) - len(clean)}")
    for lo, hi, label in [(1, 2, "one frame        "), (2, 5, "2-4 frames       "),
                          (5, 11, "5-10 frames      "), (11, 10 ** 6, "more than 10     ")]:
        print(f"  {label} {sum(1 for r in rows if lo <= r['cut'] < hi)}")

    if args.montage and gallery:
        cells = [cv2.resize(f, (240, 180)) for _, f in gallery[:24]]
        while len(cells) % 4:
            cells.append(np.zeros((180, 240, 3), np.uint8))
        grid = np.vstack([np.hstack(cells[i:i + 4]) for i in range(0, len(cells), 4)])
        cv2.imwrite(args.montage, grid, [cv2.IMWRITE_JPEG_QUALITY, 88])
        print(f"montage -> {args.montage}  ({', '.join(s for s, _ in gallery[:24])})")

    if args.out:
        json.dump(rows, open(args.out, "w"), indent=1)
        print(f"wrote {args.out}")


if __name__ == "__main__":
    sys.exit(main())
