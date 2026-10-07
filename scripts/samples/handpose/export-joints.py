#!/usr/bin/env python3
"""Export the public 3D joints for the in-page explorer, for video-tier samples only.

    python3 export-joints.py

Writes, per sample with curation tier "video":
  public/samples/hand-pose/joints/hand-pose-NN.bin    int16 mm, then uint8 states
  public/samples/hand-pose/joints/hand-pose-NN.json   the layout of the .bin

The page says the hands were measured in 3D, and a camera overlay alone cannot show it. This is the
"look, not use" file the spec planned for the explorer: 15 fps (every second frame) and positions
rounded to 2 mm, so it shows the motion faithfully without being the delivery. The 30 fps float pack
stays behind the passcode. Only the video tier: the explorer's clock is the camera video, so a
sample without one has no 3D view to feed.

Axes are the wearer's view, not the rig's: x to the right, y up, z forward, origin at the rig. The
rotation into that frame uses the stereo pair's mean optical axis (hp_render.rig_axes); no
calibration value is written. Frames with no 3D pose are -32768 in every coordinate, so a stray
joint value is never drawn.
"""
from __future__ import annotations

import json

import numpy as np

import hp_common as C
import hp_render as R

STEP = 2          # every second frame: 15 fps
QUANT_MM = 2      # positions rounded to 2 mm
MISSING = -32768
OUT_DIR = C.HP_DIR / "joints"


def export(sample: C.Sample) -> dict:
    hands = C.Hands(sample)
    f, d, r = R.rig_axes(sample)
    basis = np.stack([r, -d, f], 1)  # columns: right, up, forward
    frames = np.arange(0, sample.frames, STEP)
    pos = np.full((len(frames), 2, 21, 3), MISSING, np.int16)
    state = np.zeros((len(frames), 2), np.uint8)
    for h, side in enumerate(C.SIDES):
        J = hands.joints(side)[frames]                      # NaN where the state is none
        st = hands.state(side)[frames]
        mm = np.round((J @ basis) * 1000 / QUANT_MM) * QUANT_MM
        ok = np.isfinite(mm).all(axis=(1, 2)) & (st != C.NONE)
        C.check(np.abs(mm[ok]).max() < 32000, f"{sample.slug}: a joint is out of int16 range")
        pos[ok, h] = mm[ok].astype(np.int16)
        state[:, h] = np.where(ok, st, C.NONE)
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / f"{sample.slug}.bin").write_bytes(pos.astype("<i2").tobytes() + state.tobytes())
    meta = {
        "slug": sample.slug,
        "fps": C.FPS // STEP,
        "step": STEP,
        "sourceFrames": sample.frames,
        "count": int(len(frames)),
        "units": "mm",
        "quantMm": QUANT_MM,
        "missing": MISSING,
        "axes": "x right, y up, z forward, from the wearer's view; origin at the head rig",
        "layout": "int16 little-endian [count][2 hands: left, right][21 joints][xyz], then uint8 [count][2] states (0 none, 1 measured, 2 guessed, 3 bridged)",
        "jointNames": C.JOINT_NAMES,
    }
    C.dump_json(OUT_DIR / f"{sample.slug}.json", meta)
    return meta


def main():
    for sample in C.load_samples():
        if sample.preview != "video":
            continue
        m = export(sample)
        size = (OUT_DIR / f"{sample.slug}.bin").stat().st_size
        print(f"{sample.slug}: {m['count']} frames at {m['fps']} fps, {size:,} B")


if __name__ == "__main__":
    main()
