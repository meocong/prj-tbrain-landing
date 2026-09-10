#!/usr/bin/env python3
"""Find the eight seconds of an episode where no hand leaves the frame.

`check-cut-hands.py` says whether a preview cuts a hand. This says where to cut
it instead. The two exist because the answer to "this clip shows half a hand"
is usually not "delete the record" — the window was picked by a blind rule (a
little way into the episode) out of four to twelve minutes of footage, and the
hands are whole for most of it.

Reads the low-resolution scout pass that `cut-r2-stereo.py --scout` leaves in a
directory: one 120-second, 288x216 clip per record, left eye only. Small
because it is only ever looked at by this file, and because 40 of them at full
size is a gigabyte of network for a decision that needs none of it.

Scores every sampled frame with `check-cut-hands.hands()` — the same criterion,
imported, so the window this picks is clean by exactly the test the QC pass
will later apply to it. Then takes the longest unbroken run of clean frames and
returns its middle. A record whose longest clean run is shorter than the
preview length has no honest eight seconds in it and is reported as such; that
is the one that deserves dropping.

    python3.14 scripts/samples/find-hand-window.py --scout /tmp/scout \\
        --map /tmp/scout-map.txt --out /tmp/window-map.txt [--every 0.5]

`--map` is the map the scout was cut from; its third column is the second the
scout starts at, so the offset this finds is added to it. `--out` is the same
shape, ready to feed back to `cut-r2-stereo.py` under `ABS_SEEK=1`.
"""

import argparse
import importlib.util
import os
import sys

import cv2

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location(
    "check_cut_hands", os.path.join(HERE, "check-cut-hands.py")
)
checker = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(checker)

PREVIEW_SECONDS = 8


def clean_runs(path, every):
    """(clean-flag per sampled frame, seconds between samples)."""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        return None
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    step = max(1, int(round(fps * every)))
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    flags = []
    i = 0
    while i < total:
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        ok, frame = cap.read()
        if not ok:
            break
        _, clipped = checker.hands(frame)
        flags.append(clipped == 0)
        i += step
    cap.release()
    return flags, every


def best_window(flags, every):
    """Middle of the longest clean run, and that run's length in seconds."""
    best_len = best_start = 0
    run_start = None
    for i, ok in enumerate(flags + [False]):
        if ok and run_start is None:
            run_start = i
        elif not ok and run_start is not None:
            if i - run_start > best_len:
                best_len, best_start = i - run_start, run_start
            run_start = None
    seconds = best_len * every
    if seconds < PREVIEW_SECONDS:
        return None, seconds
    # Centre the preview in the run, so a hand that leaves just outside it has
    # the most room on both sides before it reaches the clip.
    centre = (best_start + best_len / 2) * every
    return max(0.0, centre - PREVIEW_SECONDS / 2), seconds


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scout", required=True)
    ap.add_argument("--map", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--every", type=float, default=0.5)
    args = ap.parse_args()

    rows = [l.strip() for l in open(args.map) if l.strip()]
    kept, dropped = [], []
    for line in rows:
        slug, prefix, off, sdur, edur = line.split("|")
        clip = os.path.join(args.scout, f"{slug}.mp4")
        if not os.path.exists(clip):
            dropped.append((slug, "no scout clip"))
            continue
        got = clean_runs(clip, args.every)
        if not got:
            dropped.append((slug, "unreadable scout"))
            continue
        flags, every = got
        inner, run = best_window(flags, every)
        if inner is None:
            dropped.append((slug, f"longest clean run {run:.1f}s"))
            print(f"{slug:<26} DROP   longest clean run {run:5.1f}s", flush=True)
            continue
        seek = float(off) + inner
        kept.append(f"{slug}|{prefix}|{seek:.2f}|{sdur}|{edur}")
        print(f"{slug:<26} @{seek:9.2f}s  clean run {run:5.1f}s "
              f"({sum(flags)}/{len(flags)} frames)", flush=True)

    open(args.out, "w").write("\n".join(kept) + ("\n" if kept else ""))
    print(f"\nrecoverable {len(kept)}   no clean window {len(dropped)}")
    for slug, why in dropped:
        print(f"  drop {slug:<26} {why}")
    print(f"wrote {args.out}")


if __name__ == "__main__":
    sys.exit(main())
