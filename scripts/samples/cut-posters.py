#!/usr/bin/env python3
"""Pick the poster frame for each clip: the one where a whole hand is in shot.

Tam, 2026-09-09: "chị vào xem thấy cắt tay, ko thấy tay đâu cả."

Read the complaint precisely, because the obvious reading is wrong. Auditing the
118 delivery posters by eye, very few had *no* hand at all — most had a hand
running off the edge of the frame, or a torso filling the lower half with a
thumb in the corner. "Cắt tay" is hands CUT, and a frame with half a hand in it
is worse than one with none, because it looks like a mistake rather than a shot.

So the criterion is not "is there skin" but "is there a whole hand, clear of the
edges". That is what this scores.

## Why not a hand detector

MediaPipe is the right tool and does not run on this machine. 1.0.1 aborts in
`TensorsToDetectionsCalculator::Open` with "Service is unavailable" — it wants a
Metal service the sandbox has no access to — and forcing `Delegate.CPU` aborts
in the same place. The versions that still expose the old `mp.solutions` API do
not publish wheels for this Python. Both were tried before writing this.

So this is a heuristic, and it is stated as one. It is checked the only way a
heuristic can be: `--montage` writes a contact sheet of the chosen frames, and
somebody looks at it. Do not ship a run of this without looking.

## What it scores

Per candidate frame, a skin mask from two colour spaces intersected — YCrCb
(Cr 133-173, Cb 77-127) and HSV — because either alone lights up on the wood,
cardboard and terracotta these workshops are full of. Then, on the largest
connected skin component:

  size      its area as a fraction of frame, clipped at a plateau. Bigger is
            better up to a point; past it the "hand" is a torso or a wall.
  edges     a HARD REJECT if it touches the frame border, not a penalty. This is
            the whole point of the pass — a blob running off the edge is a cut
            hand, or an arm, which is the same failure — and it was a 0.35
            multiplier first, which was too weak: a bright forearm leaving the
            frame still outscored a small clean hand, and 4 of the first 12
            shipped cut. `pick` now takes the best UNCUT candidate and falls
            back to a cut one only when the whole clip is cut.
  motion    its mean absolute difference against a frame 0.4 s earlier. Hands
            move and wood does not, and this is what keeps a cardboard box from
            outscoring a hand. Rewarded, but capped and square-rooted: the first
            run without a cap picked a motion-blurred smear of a hand for
            `garment-sewing`, which is the predictable cost of paying for motion
            and nothing else.
  sharp     variance of the Laplacian over the blob, which is the correction for
            that. A blurred hand scores as a hand on every other term, so this
            is the only one that can tell them apart.
  lower     a mild bonus for sitting below the midline, where hands are in
            head-mounted capture.

Sampled across the middle 70% of each clip: the first and last seconds are
walking up to the task and walking away from it.
"""

import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLIPS = os.path.join(ROOT, "public", "samples", "clips")
POSTERS = os.path.join(ROOT, "public", "samples", "posters")
SAMPLES = os.path.join(ROOT, "src", "lib", "samples", "samples.json")

# Candidates per clip. 28 over the middle 70% of a 3-minute clip is a frame
# every ~4.5 s, which is dense enough to land on a grasp and cheap enough to run
# over 118 files.
N_CANDIDATES = 28

# How far back the motion reference sits. Long enough that a hand has moved,
# short enough that the scene has not changed.
MOTION_LAG_S = 0.4


def skin_mask(bgr):
    """Skin in YCrCb AND HSV. Either alone is a wood detector."""
    ycrcb = cv2.cvtColor(bgr, cv2.COLOR_BGR2YCrCb)
    m1 = cv2.inRange(ycrcb, (0, 133, 77), (255, 173, 127))
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    m2 = cv2.inRange(hsv, (0, 30, 60), (25, 170, 255))
    m = cv2.bitwise_and(m1, m2)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    return cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((11, 11), np.uint8))


def score(bgr, prev_bgr):
    h, w = bgr.shape[:2]
    m = skin_mask(bgr)
    n, labels, stats, cents = cv2.connectedComponentsWithStats(m, 8)
    if n <= 1:
        return 0.0, True, None
    idx = 1 + int(np.argmax(stats[1:, cv2.CC_STAT_AREA]))
    x, y, bw, bh, area = stats[idx]
    frac = area / float(h * w)
    if frac < 0.004:
        return 0.0, True, None

    # Size, with a plateau: a hand is a few percent of frame. A torso or a
    # sunlit wall is thirty, and is not what anybody means by "show the hands".
    size = min(frac, 0.10) / 0.10
    if frac > 0.34:
        size *= 0.25

    # The point of the pass. A blob running off the frame is a cut hand — or an
    # arm, which is the same failure wearing a different name.
    #
    # This was a 0.35 multiplier and that was too weak to do the job: a discount
    # is not a veto, and a big bright forearm running off the edge still beat a
    # small clean hand. Auditing the first full run, 4 of the first 12 shipped a
    # hand cut at the frame border — `auto-electrical`, `signboard-install`,
    # `noodle-prep`, `ceiling-panels` — which is exactly the complaint.
    #
    # It is now a hard flag, returned rather than folded into the number, and
    # `pick` takes the best UNCUT candidate. A cut frame is used only when every
    # candidate in the clip is cut, because a poster is better than no poster.
    pad = 3
    cut = bool(x <= pad or y <= pad or (x + bw) >= (w - pad) or (y + bh) >= (h - pad))

    # Hands move; wood does not.
    comp = (labels == idx).astype(np.uint8)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    if prev_bgr is None:
        motion = 0.5
    else:
        d = cv2.absdiff(gray, cv2.cvtColor(prev_bgr, cv2.COLOR_BGR2GRAY))
        motion = float(cv2.mean(d, mask=comp)[0]) / 40.0
        # Square-rooted and capped. Motion is evidence that the blob is a hand,
        # not a quality to maximise — paid linearly it buys the blurriest frame
        # in the clip, which is what the first run did.
        motion = min(motion, 1.0) ** 0.5

    # Sharpness over the blob only. The correction for the above: a smeared hand
    # passes skin, size, edges and motion, and fails only here.
    lap = cv2.Laplacian(gray, cv2.CV_64F)
    vals = lap[comp.astype(bool)]
    sharp = float(np.var(vals)) if vals.size else 0.0
    sharp = min(sharp / 90.0, 1.0)

    cy = cents[idx][1] / float(h)
    lower = 1.0 + 0.25 * max(0.0, cy - 0.45)

    s = size * (0.35 + 0.65 * motion) * (0.30 + 0.70 * sharp) * lower
    return s, cut, (int(x), int(y), int(bw), int(bh))


def pick_at(path, seconds):
    """Take the frame at a given time, no scoring. The override path."""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None
    cap.set(cv2.CAP_PROP_POS_MSEC, float(seconds) * 1000.0)
    ok, frame = cap.read()
    cap.release()
    return frame if ok else None


def _scan(cap, total, fps, n_cand):
    lo, hi = int(total * 0.15), int(total * 0.85)
    if hi <= lo:
        lo, hi = 0, max(total - 1, 1)
    idxs = np.linspace(lo, hi, min(n_cand, hi - lo)).astype(int)
    lag = max(1, int(fps * MOTION_LAG_S))
    best_clean = (0.0, None, None)
    best_any = (0.0, None, None)
    for i in idxs:
        cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, int(i) - lag))
        ok, prev = cap.read()
        if not ok:
            prev = None
        cap.set(cv2.CAP_PROP_POS_FRAMES, int(i))
        ok, frame = cap.read()
        if not ok:
            continue
        s, cut, box = score(frame, prev)
        if s > best_any[0]:
            best_any = (s, frame.copy(), box)
        if not cut and s > best_clean[0]:
            best_clean = (s, frame.copy(), box)
    return best_clean, best_any


def pick(path):
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    if total <= 0:
        cap.release()
        return None

    # Two passes. The coarse one is 28 candidates and answers most clips; when
    # it finds no frame with a hand clear of the border, the dense one looks
    # again at 4x. A clip where the operator's arm is in shot almost constantly
    # still has moments between reaches, and at one sample every 4.5 s the
    # coarse pass walks straight past them — 46 of 118 came back "cut only"
    # before this existed, and most of them were sampling, not the footage.
    best_clean, best_any = _scan(cap, total, fps, N_CANDIDATES)
    if best_clean[1] is None:
        best_clean, best_any2 = _scan(cap, total, fps, N_CANDIDATES * 4)
        if best_any[1] is None:
            best_any = best_any2
    cap.release()
    # An uncut hand at any score beats a cut one at any score. Falling back to
    # `best_any` only when the whole clip is cut is what makes that a rule
    # rather than a preference.
    return (best_clean if best_clean[1] is not None else best_any) + (
        (best_clean[1] is None),)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--modality", default="egocentric")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--montage", default="")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--out", default=POSTERS)
    args = ap.parse_args()

    rows = json.load(open(SAMPLES))
    slugs = [r["slug"] for r in rows if r["modality"] == args.modality]
    if args.limit:
        slugs = slugs[: args.limit]

    # Hand-picked timestamps win over the score, always.
    #
    # This exists because the heuristic below has a ceiling and it is honest
    # about where it is: it can find skin that moves and is clear of the edges,
    # and it cannot tell a good sales frame from an adequate one. When somebody
    # watches a clip and says "01:23, that one" — which is what Tam asked for
    # with "samples em chọn cho chị cái nào ổn hoặc bảo Trâm / team chọn" — that
    # answer should cost one line of JSON, not an argument with a scorer.
    #
    #   { "cowl-installation": 84.5, "table-cleaning": 12 }   slug -> seconds
    ov_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                           "poster-overrides.json")
    overrides = json.load(open(ov_path)) if os.path.exists(ov_path) else {}

    picked, skipped, forced, cutonly = [], [], 0, []
    for slug in slugs:
        clip = os.path.join(CLIPS, f"{slug}.mp4")
        if not os.path.exists(clip):
            skipped.append((slug, "no clip"))
            continue
        if slug in overrides:
            frame = pick_at(clip, overrides[slug])
            if frame is None:
                skipped.append((slug, f"override {overrides[slug]}s unreadable"))
                continue
            if not args.dry_run:
                os.makedirs(args.out, exist_ok=True)
                cv2.imwrite(os.path.join(args.out, f"{slug}.jpg"), frame,
                            [cv2.IMWRITE_JPEG_QUALITY, 88])
            picked.append((slug, None, None))
            forced += 1
            print(f"  {slug:<26} override @ {overrides[slug]}s", flush=True)
            continue
        res = pick(clip)
        if not res or res[1] is None:
            skipped.append((slug, "no candidate"))
            continue
        s, frame, box, was_cut = res
        if was_cut:
            cutonly.append(slug)
        if not args.dry_run:
            os.makedirs(args.out, exist_ok=True)
            cv2.imwrite(os.path.join(args.out, f"{slug}.jpg"), frame,
                        [cv2.IMWRITE_JPEG_QUALITY, 88])
        picked.append((slug, round(s, 3), box))
        print(f"  {slug:<26} {s:5.3f}{'  CUT-ONLY' if was_cut else ''}", flush=True)

    print(f"\npicked {len(picked)} / {len(slugs)}   ({forced} by override)   skipped {len(skipped)}")
    for s, why in skipped:
        print(f"  skip {s}: {why}")
    if cutonly:
        print(f"\nno uncut frame anywhere in {len(cutonly)} clip(s) - these still "
              f"show a hand at the border and want a manual override:")
        for s in cutonly:
            print(f"  {s}")

    if args.montage and picked:
        take = [p[0] for p in picked[:12]]
        ins = []
        for t in take:
            ins += ["-i", os.path.join(args.out, f"{t}.jpg")]
        n = len(take)
        fc = "".join(f"[{i}]scale=240:180[v{i}];" for i in range(n))
        rows_n = (n + 3) // 4
        for r in range(rows_n):
            cells = "".join(f"[v{i}]" for i in range(r * 4, min(n, r * 4 + 4)))
            fc += f"{cells}hstack={min(4, n - r*4)}[r{r}];"
        fc += "".join(f"[r{r}]" for r in range(rows_n)) + f"vstack={rows_n}"
        subprocess.run(["ffmpeg", "-y", "-v", "error", *ins, "-filter_complex", fc,
                        "-q:v", "4", args.montage], check=True)
        print(f"montage -> {args.montage}")


if __name__ == "__main__":
    sys.exit(main())
