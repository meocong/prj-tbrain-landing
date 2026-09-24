#!/usr/bin/env python3
"""Build the sample library from the approved delivery set, and nothing else.

Thạch, 2026-09-23: "mình phải clear tất cả cái cũ và đẩy data chuẩn để fill vào
trang samples đã được cấp trên duyệt." The page design is approved; the records
behind it were collected from several places over two weeks and are not. This
replaces them with one set — the Drive folder `1J9IqP3AD7s62jeK32l3bZ4qjz09lRznZ`,
the same drop that answers the vendor questionnaire — so every card on the page
traces to a delivery a customer has already accepted.

## What the set holds, and how each part lands

    Egocentric Human Data Samples/<task>__<hash>/
        source_{primary,mid}_{left,right}.mp4   four of the rig's six lenses,
                                                copied out of the mcap untouched
        imu.csv          every IMU sample, m/s² and rad/s, ~200 Hz
        camera_pose.csv  6-DoF head pose per video frame, with a `measured` flag
        calibration.json, metadata.json, SHA256SUMS

    Teleoperated Data Samples/<nnn>/            LeRobot v3.0, one session each
        meta/{info,stats}.json, meta/tasks.parquet, meta/episodes/…parquet
        data/chunk-000/file-000.parquet          state + action, 40 wide
        videos/observation.images.cam_{head,left,right}/chunk-000/file-000.mp4

Egocentric: one record per clip, tier `stereo6`. Both rigs in the set are six
cameras in three stereo pairs and deliver the primary and mid pairs, so every
record lays out on `LENS_PLACES` with the outer two left as holes — which is the
true picture of what shipped.

Teleoperation: one record per session. All eleven are the same task on the
same robot, and a card per episode would be 134 copies of one sentence.

## What is deliberately NOT carried over from metadata.json

`samples.json` is imported by client components, so anything written into it
ships in the JavaScript bundle whether or not a page renders it. `redact.mjs`
filters at render and cannot help with that. So this script writes an allow-
list of rows, never the metadata wholesale: no business name or id, no geohash,
no city, no NAICS code, no operator / device / kit / episode ids, no rig model
string. That is Tam's rule of 2026-09-09 — "cái gì có thể định vị nó là ai,
người nào, ở đâu thì cắt" — applied at the source instead of at the glass.

`operator_job` is taken from `_catalogue.differs.operator_job.catalogue_now`
where the set records one: 22 clips were relabelled after delivery, the
container is a snapshot, and the catalogue is the current answer.

## The preview window

Eight seconds, chosen by the same criterion the QC pass enforces
(`check-cut-hands.hands`): a hand may not be cut by the frame edge, even
partly. The scan runs on the preview's own crop at the preview's own size,
because that checker measures palms in absolute pixels. Among windows with no
cut hand, the one with the most frames showing a whole hand wins; a clip with
no clean window takes the least-bad one and is reported.

Usage:
    python3 scripts/samples/ingest-approved.py [--src DIR] [--only SLUG] [--dry]
"""

import argparse
import csv
import glob
import importlib.util
import json
import math
import os
import re
import subprocess
import sys
from collections import Counter

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
PUB = os.path.join(ROOT, "public", "samples")
CLIPS = os.path.join(PUB, "clips")
POSTERS = os.path.join(PUB, "posters")
TELEMETRY = os.path.join(PUB, "telemetry")
STAGE = os.path.join(ROOT, ".samples-approved")  # not .samples-stage: stage-packs.mjs deletes that on exit

_spec = importlib.util.spec_from_file_location("check_cut_hands", os.path.join(HERE, "check-cut-hands.py"))
checker = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(checker)

W, H = 480, 360
SECONDS = 8.0
SCOUT_FPS = 2
TELEM_HZ = 30
CROP = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"

# View suffixes as `rig-views.ts` names them. The base file — the card face,
# the poster, and the lens the preview window is chosen on — is MID-left, not
# primary-left. Measured across the set: the primary pair frames the wearer's
# chest and chin on nearly every clip, with the work at the top edge, while the
# mid pair frames the hands on the work. `rigLayout` reads the `primary-left`
# view as the signal to lay the base out in mid-left's place.
EGO_VIEWS = [
    ("", "source_mid_left.mp4"),
    ("primary-left", "source_primary_left.mp4"),
    ("primary-right", "source_primary_right.mp4"),
    ("mid-right", "source_mid_right.mp4"),
]
BASE_SOURCE = EGO_VIEWS[0][1]
TELE_VIEWS = [("", "cam_head"), ("left", "cam_left"), ("right", "cam_right")]


# ── small helpers ──────────────────────────────────────────────────────────

def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=codec_name,width,height,r_frame_rate",
         "-show_entries", "format=duration", "-of", "json", path],
        check=True, capture_output=True, text=True,
    ).stdout
    j = json.loads(out)
    s = j["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return {
        "codec": s["codec_name"],
        "w": int(s["width"]),
        "h": int(s["height"]),
        "fps": round(int(num) / int(den)),
        "dur": float(j["format"]["duration"]),
    }


def human_bytes(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit in ("B", "KB") or n >= 10 else f"{n:.1f} {unit}"
        n /= 1024.0


def sentence(s):
    s = re.sub(r"\s+", " ", (s or "").strip()).rstrip(".")
    return s[:1].upper() + s[1:] if s else s


def mmss(sec):
    sec = int(round(sec))
    return f"{sec // 60} min {sec % 60:02d} s" if sec >= 60 else f"{sec} s"


def scout(path, start=0.0, dur=None):
    """Frames at SCOUT_FPS, on the preview crop, as (time, bgr) pairs."""
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{start:.3f}", "-i", path]
    if dur is not None:
        cmd += ["-t", f"{dur:.3f}"]
    cmd += ["-vf", f"fps={SCOUT_FPS},{CROP}", "-f", "rawvideo", "-pix_fmt", "bgr24", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    n = len(raw) // (W * H * 3)
    frames = np.frombuffer(raw[: n * W * H * 3], np.uint8).reshape(n, H, W, 3)
    return [(start + i / SCOUT_FPS, f) for i, f in enumerate(frames)]


def pick_window(path, total):
    """(start, poster_offset, report) — see the module docstring."""
    span = min(SECONDS, total)
    scored = [(t, *checker.hands(f)) for t, f in scout(path)]
    best = None
    step = 1.0 / SCOUT_FPS
    s = 0.0
    while s + span <= total + 1e-6:
        inside = [r for r in scored if s <= r[0] < s + span]
        bad = sum(1 for _, seen, cut in inside if cut)
        good = sum(1 for _, seen, cut in inside if seen and not cut)
        key = (bad, -good, abs((s + span / 2) - total / 2))
        if best is None or key < best[0]:
            best = (key, s, inside)
        s += step
    (bad, neg_good, _), start, inside = best
    # Poster: the whole-hand frame nearest the middle of the window.
    clean = [r for r in inside if r[1] and not r[2]]
    mid = start + span / 2
    pt = min(clean, key=lambda r: abs(r[0] - mid))[0] if clean else mid
    return round(start, 3), round(pt - start, 3), {"cut": bad, "whole": -neg_good, "frames": len(inside)}


def cut(src, out, start, dur):
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{start:.3f}", "-i", src, "-t", f"{dur:.3f}", "-an",
         "-vf", CROP, "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", out])


def still(src, out, at):
    run(["ffmpeg", "-y", "-v", "error", "-ss", f"{at:.3f}", "-i", src, "-frames:v", "1",
         "-vf", CROP, "-q:v", "4", out])


# ── egocentric ─────────────────────────────────────────────────────────────

def read_csv(path):
    with open(path, newline="") as fh:
        return list(csv.DictReader(fh))


def nearest(ts, target, cursor):
    while cursor + 1 < len(ts) and abs(ts[cursor + 1] - target) <= abs(ts[cursor] - target):
        cursor += 1
    return cursor


def quat_mul(a, b):
    ax, ay, az, aw = a
    bx, by, bz, bw = b
    return (
        aw * bx + ax * bw + ay * bz - az * by,
        aw * by - ax * bz + ay * bw + az * bx,
        aw * bz + ax * by - ay * bx + az * bw,
        aw * bw - ax * bx - ay * by - az * bz,
    )


def quat_angle_deg(q0, q):
    """Angle turned from q0 to q. Convention-free: no axis naming is assumed."""
    inv = (-q0[0], -q0[1], -q0[2], q0[3])
    r = quat_mul(inv, q)
    w = max(-1.0, min(1.0, abs(r[3])))
    return math.degrees(2 * math.acos(w))


def ego_telemetry(folder, slug, start, span):
    """IMU and head pose for the preview window, one row per displayed frame.

    Video frame i is camera_pose row `frame == i`, and the IMU shares the
    device clock (SAMPLE_README: "IMU … on the same device clock as the
    cameras"), so the window is located on the pose clock and the IMU is read
    against it. Pose is printed relative to the window's first measured frame
    — distance moved and angle turned — because the world frame's axes are
    defined in a manifest this drop does not include, and naming yaw or pitch
    against an unstated convention would be a guess dressed as a reading.
    """
    pose = read_csv(os.path.join(folder, "camera_pose.csv"))
    imu = read_csv(os.path.join(folder, "imu.csv"))
    by_frame = {int(r["frame"]): r for r in pose}
    f0 = min(by_frame)
    t0 = int(by_frame[f0]["t_ns"])
    fps = 30.0

    its = [int(r["t_ns"]) for r in imu]
    n = int(round(span * TELEM_HZ))
    first_ns = t0 + int(start * 1e9)
    last_ns = t0 + int((start + span) * 1e9)
    if its[0] > first_ns + 50_000_000 or its[-1] < last_ns - 50_000_000:
        raise RuntimeError(f"{slug}: imu.csv does not cover the preview window")

    ref = None
    rows = []
    cur = 0
    for k in range(n):
        t = k / TELEM_HZ
        frame = f0 + int(round((start + t) * fps))
        target = t0 + int((start + t) * 1e9)
        cur = nearest(its, target, cur)
        s = imu[cur]
        a = [float(s["ax"]), float(s["ay"]), float(s["az"])]
        g = [float(s["gx"]), float(s["gy"]), float(s["gz"])]
        row = {
            "t": round(t, 3),
            "a": [round(v, 2) for v in a],
            "am": round(math.sqrt(sum(v * v for v in a)), 2),
            "g": [round(v, 3) for v in g],
            "gm": round(math.sqrt(sum(v * v for v in g)), 3),
            "p": None,
            "r": None,
        }
        pr = by_frame.get(frame)
        if pr and pr["measured"] in ("1", "True", "true"):
            p = (float(pr["x"]), float(pr["y"]), float(pr["z"]))
            q = (float(pr["qx"]), float(pr["qy"]), float(pr["qz"]), float(pr["qw"]))
            if ref is None:
                ref = (p, q)
            row["p"] = [round(p[i] - ref[0][i], 3) for i in range(3)]
            row["r"] = round(quat_angle_deg(ref[1], q), 1)
        rows.append(row)

    rate = (len(its) - 1) / ((its[-1] - its[0]) / 1e9)
    measured = sum(1 for r in pose if r["measured"] in ("1", "True", "true")) / max(1, len(pose))
    return {
        "slug": slug,
        "kind": "imu-pose",
        "offsetSec": start,
        "rateHz": round(rate),
        "units": {"acc": "m/s²", "gyro": "rad/s", "pos": "m", "rot": "deg"},
        "rows": rows,
    }, rate, measured


def ego_record(folder, slugs, dry, report):
    m = json.load(open(os.path.join(folder, "metadata.json")))
    task, env, dev, op = m["task"], m["environment"], m["device"], m["operator"]
    other, cal = m.get("other", {}), m.get("calibration", {})
    relabel = m.get("_catalogue", {}).get("differs", {})

    task_id = task["task-id"]
    slug = task_id
    k = 2
    while slug in slugs:
        slug = f"{task_id}-{k}"
        k += 1
    slugs.add(slug)

    job = relabel.get("operator_job", {}).get("catalogue_now") or op.get("operator_job") or task.get("job_family")
    base = os.path.join(folder, BASE_SOURCE)
    v = probe(base)
    total = v["dur"]

    start, poster_at, hands = pick_window(base, total)
    span = min(SECONDS, total)
    report.append((slug, hands))

    telem, rate, measured = ego_telemetry(folder, slug, start, span)

    if not dry:
        for view, name in EGO_VIEWS:
            src = os.path.join(folder, name)
            suffix = f"-{view}" if view else ""
            cut(src, os.path.join(CLIPS, f"{slug}{suffix}.mp4"), start, span)
            still(src, os.path.join(POSTERS, f"{slug}{suffix}.jpg"), start + poster_at)
        with open(os.path.join(TELEMETRY, f"{slug}.json"), "w") as fh:
            json.dump(telem, fh, separators=(",", ":"))
            fh.write("\n")

    files = [f for f in os.listdir(folder) if not f.startswith(".")]
    size = sum(os.path.getsize(os.path.join(folder, f)) for f in files)
    sha = None
    sums = os.path.join(folder, "SHA256SUMS")
    if os.path.exists(sums):
        for line in open(sums):
            parts = line.split()
            if len(parts) == 2 and parts[1].lstrip("*").endswith(BASE_SOURCE):
                sha = parts[0]

    l1, l2, l3 = env.get("environment_l1"), env.get("environment_l2"), env.get("environment_l3")
    age = (other.get("age_range") or "").replace("-", "–")
    operator = ", ".join(x for x in (job, age, other.get("handedness")) if x)
    desc = sentence(task.get("task_description"))
    codec = v["codec"].upper() if v["codec"] != "hevc" else "HEVC"
    res = f"{v['w']}x{v['h']}"

    spec = [
        ["Task id", task_id],
        ["Description", desc],
        ["Skill group", task.get("skill_group")],
        ["Difficulty", task.get("task_difficulty")],
        ["Industry", l1],
        ["Workplace", l2],
        ["Station", l3],
        ["Operator", operator],
        ["Consent", "recorded per session" if str(op.get("operator_consent")).lower() == "yes" else "not recorded"],
        ["Cameras", "Stereo pair · shot on a multi-camera head rig"],
        ["Frame", f"{res} at {v['fps']} fps"],
        ["Shutter", dev.get("device_camera_shutter")],
        ["Codec", v["codec"]],
        ["IMU rate", f"{rate:.0f} Hz"],
        ["Camera pose", f"6-DoF per frame · {measured * 100:.0f}% measured"],
        ["Calibration", f"{cal.get('camera_calibration_last_date')} ({cal.get('camera_calibration_status')})"],
        ["Episode", mmss(total)],
        ["Delivered size", f"{human_bytes(size)} across {len(files)} files"],
        ["Ships as", "4 × mp4 as delivered · imu.csv · camera_pose.csv · calibration.json · metadata.json · SHA256SUMS"],
    ]
    if sha:
        spec.append(["SHA-256", sha])
    spec = [[a, b] for a, b in spec if b not in (None, "", "None (None)")]

    return {
        "slug": slug,
        "domain": "robotics",
        "modality": "egocentric",
        # Stereo is the product and this set fills that tier alone (Thạch,
        # 2026-09-24). It delivers four lenses, never six, so the 6-camera tier
        # keeps the earlier six-lens captures instead.
        "tier": "stereo",
        "provenance": "ots",
        "title": desc or sentence(task_id.replace("-", " ")),
        "task": task_id,
        "label": task.get("skill_group"),
        "skill": task.get("skill_group"),
        "skillGroup": task.get("skill_group"),
        "industry": l1,
        "job": job,
        "environment": ", ".join(x for x in (l2, l3) if x),
        "locale": "Vietnam",
        "rig": "Six-camera head rig, three stereo pairs",
        "viewpoint": "first-person",
        "telemetry": True,
        "durationSec": round(total, 3),
        "resolution": res,
        "fps": v["fps"],
        "streams": ["RGB x4 (primary and mid stereo pairs)", f"IMU {rate:.0f} Hz", "6-DoF camera pose"],
        "formats": ["mp4", "csv", "json"],
        "size": human_bytes(size),
        "spec": spec,
        "breadcrumb": [x for x in (l1, l2, l3) if x],
        "preview": f"Preview · {span:.0f} s, the same instant on every lens shown · {W} x {H} per view",
        "pills": [
            {"t": task.get("skill_group"), "k": "skill"},
            {"t": task.get("task_difficulty"), "k": "difficulty"},
            {"t": "Stereo pair", "k": "quality"},
            {"t": f"{codec} · {human_bytes(size)}", "k": "file"},
            {"t": f"calibration {cal.get('camera_calibration_status')}", "k": "quality"},
        ],
        "downloads": [{"t": "Preview pack", "primary": True}, {"t": "Full delivery", "primary": False}],
        "_src": os.path.relpath(folder),
    }, [view for view, _ in EGO_VIEWS if view]


# ── teleoperation ──────────────────────────────────────────────────────────

SEGMENTS = [
    ("Left arm", 0, 7), ("Right arm", 7, 14),
    ("Left hand", 14, 20), ("Right hand", 20, 26),
    ("Left wrist position", 26, 29), ("Left wrist rotation", 29, 33),
    ("Right wrist position", 33, 36), ("Right wrist rotation", 36, 40),
]


def teleop_records(root, dry):
    import pyarrow.parquet as pq

    sets = sorted(d for d in glob.glob(os.path.join(root, "Teleoperated Data Samples", "*")) if os.path.isdir(d))
    records, strip = [], []
    anatomy = None
    tasks = Counter()
    tot_ep = tot_fr = 0
    fps = None
    for i, d in enumerate(sets):
        info = json.load(open(os.path.join(d, "meta", "info.json")))
        fps = info["fps"]
        eps = pq.read_table(glob.glob(os.path.join(d, "meta", "episodes", "chunk-*", "*.parquet"))[0]).to_pylist()
        task = pq.read_table(os.path.join(d, "meta", "tasks.parquet")).to_pylist()[0]["task"].rstrip(".")
        tasks[task] += 1
        n_ep, n_fr = info["total_episodes"], info["total_frames"]
        tot_ep += n_ep
        tot_fr += n_fr
        # The episode shown is the one nearest the session's median length: the
        # first is often a warm-up and the longest is often a fumble.
        lens = sorted(e["length"] for e in eps)
        med = lens[len(lens) // 2]
        ep = min(eps, key=lambda e: (abs(e["length"] - med), e["episode_index"]))
        a = ep["videos/observation.images.cam_head/from_timestamp"]
        b = ep["videos/observation.images.cam_head/to_timestamp"]
        slug = f"teleop-s{os.path.basename(d)}"
        if not dry:
            for view, cam in TELE_VIEWS:
                src = glob.glob(os.path.join(d, "videos", f"observation.images.{cam}", "chunk-*", "*.mp4"))[0]
                suffix = f"-{view}" if view else ""
                cut(src, os.path.join(CLIPS, f"{slug}{suffix}.mp4"), a, b - a)
                still(src, os.path.join(POSTERS, f"{slug}{suffix}.jpg"), a + (b - a) * 0.4)
        size = sum(os.path.getsize(p) for p in glob.glob(os.path.join(d, "**", "*"), recursive=True) if os.path.isfile(p))
        dur = n_fr / fps
        title = f"{task} · session {i + 1}"
        records.append({
            "slug": slug,
            "domain": "robotics",
            "modality": "teleoperation",
            "tier": "umi",
            "provenance": "custom",
            "title": title,
            "task": "pick-and-place",
            "label": task,
            "skill": "Pick and Place / Object Handling",
            "skillGroup": "Pick and Place / Object Handling",
            "industry": None,
            "job": None,
            "environment": "Lab, table-top",
            "locale": "Vietnam",
            "rig": "Bimanual follower arms with five-fingered hands, three synced cameras",
            "viewpoint": "third-person",
            "telemetry": False,
            "durationSec": round(dur, 2),
            "resolution": "640x480",
            "fps": fps,
            "streams": ["rgb head", "rgb left", "rgb right", "joint state", "joint action"],
            "formats": ["mp4", "lerobot"],
            "size": human_bytes(size),
            "spec": [
                ["Task", task],
                # Not "Session": that label is reserved for capture handles and
                # `redact.mjs` drops it on sight. This is an ordinal, so it says so.
                ["Recording", f"Session {i + 1} of {len(sets)}"],
                ["Episodes", str(n_ep)],
                ["Frames", f"{n_fr:,}"],
                ["Episode shown", f"{ep['episode_index']} · {b - a:.1f} s"],
                ["Cameras", "Three synchronised 640x480 views — head, left, right"],
                ["Arms", "Seven degrees of freedom per arm"],
                ["Hands", "Five fingers, six actuated joints per hand"],
                ["On every frame", "Joint state and action, 40-dimensional: 14 arm joints, 12 hand joints, two 7-D wrist poses"],
                ["Frame rate", f"{fps} fps"],
                ["Ships as", f"LeRobotDataset v{str(info.get('codebase_version', '')).lstrip('v')}"],
                ["Delivered size", human_bytes(size)],
            ],
            "breadcrumb": ["Teleoperation", "Table-top", task],
            "preview": f"Preview · episode {ep['episode_index']}, head camera · 640 x 480",
            "pills": [
                {"t": "Pick and Place / Object Handling", "k": "skill"},
                {"t": f"{n_ep} episodes", "k": "quality"},
                {"t": "Joint state + action", "k": "quality"},
                {"t": human_bytes(size), "k": "file"},
            ],
            "downloads": [{"t": "Preview pack", "primary": True}, {"t": "Full delivery", "primary": False}],
            "_src": os.path.relpath(d),
        })
        strip.append({"slug": slug, "episodes": n_ep, "frames": n_fr, "shown": ep["episode_index"],
                      "seconds": round(b - a, 1)})
        if anatomy is None:
            data = pq.read_table(glob.glob(os.path.join(d, "data", "chunk-*", "*.parquet"))[0]).to_pylist()
            rows = [r for r in data if r["episode_index"] == ep["episode_index"]]
            anatomy = {
                "set": slug,
                "episode": ep["episode_index"],
                "frames": len(rows),
                "fps": fps,
                "durationSec": round(len(rows) / fps, 2),
                "segments": [{"name": n, "start": s, "end": e} for n, s, e in SEGMENTS],
                "t": [round(r["timestamp"], 3) for r in rows],
                "state": [[round(x, 3) for x in r["observation.state"]] for r in rows],
                "action": [[round(x, 3) for x in r["action"]] for r in rows],
            }

    views = {r["slug"]: ["left", "right"] for r in records}
    manifest = {
        "task": tasks.most_common(1)[0][0] + ".",
        "fps": fps,
        "sessions": len(records),
        "episodes": tot_ep,
        "frames": tot_fr,
        "seconds": round(tot_fr / fps, 1),
        "strip": strip,
        "lead": records[0]["slug"] if records else None,
    }
    return records, views, manifest, anatomy


# ── main ──────────────────────────────────────────────────────────────────

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", default=os.path.expanduser("~/.cache/tbrain-samples/approved"))
    ap.add_argument("--only")
    ap.add_argument("--dry", action="store_true")
    args = ap.parse_args()

    for d in (CLIPS, POSTERS, TELEMETRY, STAGE):
        os.makedirs(d, exist_ok=True)

    ego_dirs = sorted(
        d for d in glob.glob(os.path.join(args.src, "Egocentric Human Data Samples", "*__*"))
        if os.path.exists(os.path.join(d, "metadata.json"))
    )
    if args.only:
        ego_dirs = [d for d in ego_dirs if os.path.basename(d).startswith(args.only)]

    slugs, report, ego, views = set(), [], [], {}
    for n, d in enumerate(ego_dirs, 1):
        missing = [f for _, f in EGO_VIEWS if not os.path.exists(os.path.join(d, f))]
        for f in ("imu.csv", "camera_pose.csv"):
            if not os.path.exists(os.path.join(d, f)):
                missing.append(f)
        if missing:
            print(f"[{n:3}/{len(ego_dirs)}] SKIP {os.path.basename(d)}: missing {', '.join(missing)}")
            continue
        rec, v = ego_record(d, slugs, args.dry, report)
        ego.append(rec)
        views[rec["slug"]] = v
        h = report[-1][1]
        flag = "" if h["cut"] == 0 else f"  !! {h['cut']} frame(s) cut a hand"
        print(f"[{n:3}/{len(ego_dirs)}] {rec['slug']:32} {rec['durationSec']:5.1f}s  whole-hand {h['whole']}/{h['frames']}{flag}")

    tele, tele_views, manifest, anatomy = ([], {}, None, None) if args.only else teleop_records(args.src, args.dry)
    views.update(tele_views)
    print(f"teleop: {len(tele)} sessions" + (f", {manifest['episodes']} episodes" if manifest else ""))

    out = {"ego": ego, "teleop": tele, "views": views, "teleopSet": manifest, "anatomy": anatomy,
           "handReport": [{"slug": s, **h} for s, h in report]}
    path = os.path.join(STAGE, "approved-records.json")
    with open(path, "w") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=1)
    print(f"-> {os.path.relpath(path)}")


if __name__ == "__main__":
    main()
