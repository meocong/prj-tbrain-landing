#!/usr/bin/env python3
"""One review image per clip: where the preview sits now, and three alternatives.

Companion to `score-windows.py`. The scorer can rank windows by hand motion,
focus, glare and shake; it cannot tell painting a wall from walking to it. This
lays the evidence out so a person can.

Top: the whole clip as a strip, one frame every 2 s, with the current window
outlined in red and candidates A, B, C in green, blue and amber.
Below: four frames from each of the current window and the candidates, large
enough to read what the hands are doing, with the candidate's scores.

Usage:
  python3 scripts/samples/window-sheet.py --score SCORE.json --video PATH \
      [--current SECONDS] [--flip] --out OUT.jpg
"""

import argparse
import json
import subprocess

import numpy as np
from PIL import Image, ImageDraw

W, H = 480, 360
CROP = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
SECONDS = 8.0
COLORS = {"now": (230, 60, 60), "A": (60, 200, 90), "B": (70, 140, 240), "C": (240, 170, 40)}


def grab(video, t, flip, size):
    vf = ("hflip,vflip," if flip else "") + CROP + f",scale={size[0]}:{size[1]}"
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{max(0, t):.2f}", "-i", video, "-frames:v", "1",
         "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        capture_output=True,
    ).stdout
    if len(raw) < size[0] * size[1] * 3:
        return Image.new("RGB", size, (20, 20, 20))
    return Image.fromarray(np.frombuffer(raw[: size[0] * size[1] * 3], np.uint8).reshape(size[1], size[0], 3))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--score", required=True)
    ap.add_argument("--video", required=True)
    ap.add_argument("--current", type=float)
    ap.add_argument("--flip", action="store_true")
    ap.add_argument("--title", default="")
    ap.add_argument("--out", required=True)
    a = ap.parse_args()

    sc = json.load(open(a.score))
    dur = sc["duration"]
    cands = sc["candidates"]
    step = 2.0 if dur <= 90 else max(2.0, dur / 45)

    # Strip.
    tw, th = 120, 90
    times = [i * step for i in range(int(dur // step) + 1)]
    cols = 15
    rows = (len(times) + cols - 1) // cols
    strip = Image.new("RGB", (cols * tw, rows * (th + 14)), (12, 12, 16))
    d = ImageDraw.Draw(strip)
    wins = []
    if a.current is not None:
        wins.append(("now", a.current))
    for k, c in zip("ABC", cands):
        wins.append((k, c["start"]))
    for i, t in enumerate(times):
        x, y = (i % cols) * tw, (i // cols) * (th + 14)
        strip.paste(grab(a.video, t, a.flip, (tw, th)), (x, y + 14))
        d.text((x + 3, y + 1), f"{t:.0f}s", fill=(200, 200, 200))
        for name, s in wins:
            if s <= t < s + SECONDS:
                off = {"now": 0, "A": 2, "B": 4, "C": 6}[name]
                d.rectangle((x + off, y + 14 + off, x + tw - 1 - off, y + 14 + th - 1 - off), outline=COLORS[name], width=2)

    # Candidate rows.
    fw, fh = 240, 180
    blocks = []
    for name, s in wins:
        row = Image.new("RGB", (4 * fw + 250, fh), (12, 12, 16))
        rd = ImageDraw.Draw(row)
        for j, off in enumerate((1, 3, 5, 7)):
            row.paste(grab(a.video, s + off, a.flip, (fw, fh)), (250 + j * fw, 0))
        c = next((c for k, c in zip("ABC", cands) if k == name), None)
        rd.rectangle((0, 0, 8, fh), fill=COLORS[name])
        label = "NOW" if name == "now" else name
        rd.text((16, 8), f"{label}  @ {s:.1f}s", fill=(255, 255, 255))
        if c:
            for i, (k, v) in enumerate([("score", c["score"]), ("hands seen", c["seen"]), ("hand motion", c["active"]),
                                        ("sharp", c["sharp"]), ("glare", c["glare"]), ("shake", c["shake"]), ("cut", c["cut"])]):
                rd.text((16, 30 + i * 18), f"{k:12} {v}", fill=(190, 190, 190))
        blocks.append(row)

    width = max(strip.width, 4 * fw + 250)
    out = Image.new("RGB", (width, 24 + strip.height + sum(b.height + 6 for b in blocks)), (0, 0, 0))
    od = ImageDraw.Draw(out)
    od.text((6, 5), f"{a.title or sc['slug']}  · lens {sc['lens']} · {dur:.0f}s", fill=(255, 255, 0))
    out.paste(strip, (0, 24))
    y = 24 + strip.height + 6
    for b in blocks:
        out.paste(b, (0, y))
        y += b.height + 6
    out.save(a.out, quality=82)


if __name__ == "__main__":
    main()
