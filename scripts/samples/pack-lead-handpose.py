#!/usr/bin/env python3
"""The hand-pose team's Rerun recordings, made small enough to open on the page.

`harness/handpose/rerun_log.py` (prj-openai-data-worker, branch `fleet`) writes
one recording per capture: the fitted 3D hands in the rig frame (measured,
bridged and 2D-only frames told apart by colour), each camera's pose, a wrist
trail, and — per frame — the overlay camera's picture as a JPEG. The pictures
are what make them 25-77 MB: 900 JPEGs at 800 px. The hands are a few hundred
kilobytes.

So this keeps everything the pipeline measured and swaps the picture stream
for H.264, which a browser decodes in hardware:

  1. `rerun rrd filter` drops the per-frame JPEGs and their 2D keypoints;
  2. a second recording, under the SAME store id so the two merge as one,
     logs both cameras of the pair from `V3_epNN_2cam.mp4` — the pipeline's
     own render, skeleton drawn, the same 900 frames — as video assets on the
     `frame` timeline the hands use, plus a layout;
  3. `rerun rrd merge` joins them.

Nothing about the hands is recomputed. Episodes map to records by picture
(`EPISODES`); three of the nine are captures withdrawn from the page and are
skipped.

Usage:
  python3 scripts/samples/pack-lead-handpose.py [--src DIR] [--only SLUG]
"""

import argparse
import json
import os
import re
import subprocess
import tempfile

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "public", "samples", "rrd")
LIB = os.path.join(ROOT, "src", "lib", "samples")

# Matched on a frame at 10 s against the delivered hand-pose overlays (r >= 0.9);
# ep04, ep07 and ep09 are panel-installation, shoe-sewing and wrapping-selecting,
# all withdrawn.
EPISODES = {
    "02": "handpose-fabric-sewing",
    "03": "handpose-garment-sewing",
    "05": "handpose-pineapple-cutting",
    "06": "handpose-room-cleaning",
    "08": "handpose-wood-grinding",
    "10": "handpose-zipper-sewing",
}


def store_id(path):
    out = subprocess.run(["rerun", "rrd", "print", "-vv", path], capture_output=True, text=True).stdout[:4000]
    m = re.search(r'Recording,\s*"([^"]+)",\s*"([^"]+)"', out)
    return m.group(1), m.group(2)


def cams_of(path):
    out = subprocess.run(["rerun", "rrd", "print", path], capture_output=True, text=True).stdout
    return sorted(set(re.findall(r"/world/cam/([a-z_]+)/image ", out)))




def geometry(path, cams):
    """Camera positions of the pair and a sample of wrist positions, off `rrd print`."""
    out = subprocess.run(["rerun", "rrd", "print", "-vvv", path], capture_output=True, text=True).stdout
    num = r"(-?[0-9.]+(?:e-?[0-9]+)?)"
    cam_t = []
    for c in cams:
        i = re.search(rf"- /world/cam/{c} - ?\n", out)
        m = i and re.search(r"┆ \[\[" + num + ", " + num + ", " + num + r"\]\]\s*│", out[i.start():i.start() + 8000])
        if m:
            cam_t.append([float(x) for x in m.groups()])
    hands = {}
    for side in ("left", "right"):
        pts = []
        for i in [m.start() for m in re.finditer(rf"- /world/hand/{side}/points - ?\n", out)][:40]:
            for m in re.finditer(r"┆ \[\[" + num + ", " + num + ", " + num + r"\]", out[i:i + 8000]):
                pts.append([float(x) for x in m.groups()])
        hands[side] = np.median(pts, axis=0) if pts else None
    return np.array(cam_t), hands


def coverage(path):
    """Share of frames with a 3D hand, per side, from the chunk row counts."""
    out = subprocess.run(["rerun", "rrd", "print", path], capture_output=True, text=True).stdout
    rows = {"left": 0, "right": 0}
    for n, side in re.findall(r"with (\d+) rows .* - /world/hand/(left|right)/points - data columns: \[[^\]]*positions", out):
        rows[side] += int(n)
    return rows


def pack(ep, slug, src, tmp):
    import rerun as rr
    import rerun.blueprint as rrb

    rrd = os.path.join(src, f"V3_ep{ep}.rrd")
    mp4 = os.path.join(src, f"V3_ep{ep}_2cam.mp4")
    app, rec = store_id(rrd)
    cams = cams_of(rrd)            # the overlay pair: mid on most, primary on two
    rows = coverage(rrd)

    lean = os.path.join(tmp, "lean.rrd")
    drop = []
    for c in cams:
        drop += ["--drop-entity", f"/world/cam/{c}/image"]
    # Dropping `image` drops its children too? No — entities are independent,
    # so the keypoints go by name. The Pinhole on `image` goes with it, which
    # is fine: the video gets its own entity below.
    for c in cams:
        for s in ("left", "right"):
            drop += ["--drop-entity", f"/world/cam/{c}/image/kp2d_{s}"]
    subprocess.run(["rerun", "rrd", "filter", rrd, *drop, "-o", lean], check=True, capture_output=True)

    # The render is the pair side by side at 1920x540; split and re-encode each
    # half as seekable H.264.
    vids = []
    for i, c in enumerate(cams[:2]):
        v = os.path.join(tmp, f"{c}.mp4")
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", mp4, "-an",
                        "-vf", f"crop=iw/2:ih:{i}*iw/2:0,scale=560:-2",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "32", "-bf", "0", "-g", "30",
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", v], check=True)
        vids.append((c, v))

    extra = os.path.join(tmp, "video.rrd")
    rr.init(app, recording_id=rec)
    for c, v in vids:
        asset = rr.AssetVideo(path=v)
        rr.log(f"video/{c}", asset, static=True)
        ts = asset.read_frame_timestamps_nanos()
        rr.send_columns(f"video/{c}",
                        indexes=[rr.TimeColumn("frame", sequence=np.arange(len(ts)))],
                        columns=rr.VideoFrameReference.columns_nanos(ts))
    # The view is set from where this capture's hands are, not from axis names:
    # the two rigs log different body frames, and on the upside-down six-camera
    # sessions the lens called "left" sat on the right. Forward is from the
    # lenses to the hands; the wearer's right is from the left hand to the
    # right one; up is their cross product. The eye sits behind and above the
    # lenses.
    cam_t, hands = geometry(rrd, cams)
    centre = cam_t.mean(axis=0)
    both = [h for h in hands.values() if h is not None]
    target = np.mean(both, axis=0)
    fwd = (target - centre) / np.linalg.norm(target - centre)
    if hands["left"] is not None and hands["right"] is not None:
        right = hands["right"] - hands["left"]
    else:
        right = cam_t[-1] - cam_t[0]
    right = right - fwd * np.dot(right, fwd)
    right /= np.linalg.norm(right)
    up = np.cross(right, fwd)
    eye = centre - 0.35 * fwd + 0.22 * up
    label = {"mid_left": "left eye", "mid_right": "right eye",
             "primary_left": "left eye", "primary_right": "right eye"}
    bp = rrb.Blueprint(
        rrb.Horizontal(
            # The hands are logged in the rig's body frame, the IMU's. Its axes
            # are not camera-style despite the RDF tag on `world`: the lenses
            # sit at +y, apart along z, and gravity on the approved captures of
            # the same rig family reads along +x/-y. So "up" is set from that,
            # and the eye sits behind and above the lenses, looking at where the
            # hands actually are in this capture.
            rrb.Spatial3DView(name="Hands in 3D, rig frame", origin="world",
                              background=rrb.Background(color=(22, 22, 26)),
                              eye_controls=rrb.EyeControls3D(position=eye.tolist(), look_target=target.tolist(),
                                                             eye_up=up.tolist())),
            rrb.Vertical(*[rrb.Spatial2DView(name=label.get(c, c), origin=f"video/{c}") for c, _ in vids]),
            column_shares=[3, 2],
        ),
        rrb.TimePanel(state="collapsed", timeline="frame", play_state="playing", loop_mode="all"),
        rrb.BlueprintPanel(state="collapsed"),
        rrb.SelectionPanel(state="collapsed"),
        auto_views=False,
    )
    rr.save(extra, default_blueprint=bp)
    rr.disconnect()

    dest = os.path.join(OUT, f"{slug}.rrd")
    subprocess.run(["rerun", "rrd", "merge", lean, extra, "-o", dest], check=True, capture_output=True)
    frames = 900
    return {
        "bytes": os.path.getsize(dest),
        "poseMeasured": None,
        "handFrames": round(max(rows.values()) / frames, 3),
        "rig": "six-camera",
        "source": "handpose-pipeline",
        "handsLeft": round(rows["left"] / frames, 3),
        "handsRight": round(rows["right"] / frames, 3),
        "seconds": 30,
        "pair": cams,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=os.path.expanduser("~/.cache/tbrain-samples/lead-handpose/result"))
    ap.add_argument("--only")
    a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    idx_path = os.path.join(LIB, "rrd.json")
    index = json.load(open(idx_path)) if os.path.exists(idx_path) else {}
    for ep, slug in EPISODES.items():
        if a.only and slug != a.only:
            continue
        with tempfile.TemporaryDirectory() as tmp:
            info = pack(ep, slug, a.src, tmp)
        index[slug] = info
        print(f"ep{ep} -> {slug:28} {info['bytes']/1e6:5.2f} MB  L {info['handsLeft']:.0%}  R {info['handsRight']:.0%}  pair {info['pair']}")
    with open(idx_path, "w") as fh:
        json.dump(dict(sorted(index.items())), fh, indent=2)
        fh.write("\n")


if __name__ == "__main__":
    main()
