#!/usr/bin/env python3
"""MediaPipe hand landmarks for a stretch of one lens, as JSON on stdout.

Split out of `build-rrd.py` because the two cannot share an interpreter: the
MediaPipe that installs on this machine's Python 3.14 dies opening a Metal
context even with the CPU delegate requested, and 0.10.21 — which runs — pins a
numpy that rerun-sdk 0.38 will not install beside. So this runs under its own
environment (`MP_PYTHON`, default ~/.cache/tbrain-samples/mpenv) and hands back
plain numbers.

Landmarks are in NATIVE pixels of the delivered lens. Handedness is taken as
MediaPipe gives it. It was first flipped on the assumption that the task API
labels as if for a mirrored selfie; on the head rig that put the "right" colour
on the hand at the left of every frame, so the flip was wrong here.

Usage: detect-hands.py VIDEO WIDTH HEIGHT START SPAN FPS MODEL
Prints: [[["left"|"right", [[u, v] x 21], score], ...] per frame]
"""

import json
import subprocess
import sys

import mediapipe as mp
import numpy as np
from mediapipe.tasks.python import BaseOptions, vision


def main():
    video, w, h, start, span, fps, model = sys.argv[1:8]
    w, h, fps = int(w), int(h), int(fps)
    # Streamed a frame at a time: eight seconds of 1920x1080 RGB is 1.5 GB, and
    # six builds reading whole windows at once put the machine into swap.
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-ss", start, "-i", video, "-t", span,
         "-vf", f"fps={fps}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)

    def frames():
        size = w * h * 3
        while True:
            buf = proc.stdout.read(size)
            if len(buf) < size:
                return
            yield np.frombuffer(buf, np.uint8).reshape(h, w, 3)
    opts = vision.HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model, delegate=BaseOptions.Delegate.CPU),
        running_mode=vision.RunningMode.VIDEO, num_hands=2,
        min_hand_detection_confidence=0.4, min_hand_presence_confidence=0.4, min_tracking_confidence=0.4)
    out = []
    with vision.HandLandmarker.create_from_options(opts) as lm:
        for i, f in enumerate(frames()):
            res = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray(f)),
                                      int(i * 1000 / fps))
            hs = []
            for lms, hd in zip(res.hand_landmarks, res.handedness):
                label = hd[0].category_name.lower()
                hs.append([label, [[round(p.x * w, 2), round(p.y * h, 2)] for p in lms], round(hd[0].score, 3)])
            out.append(hs)
    proc.wait()
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
