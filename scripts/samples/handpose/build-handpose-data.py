#!/usr/bin/env python3
"""Build the public hand-pose data from SUMMARY.xlsx, handpose.json and hands.npz.

Writes
  src/lib/samples/handpose-metrics.json            16 samples + aggregates (what the page renders)
  public/samples/hand-pose/lanes/hand-pose-NN.json run-length states per hand, one file per sample
  public/samples/hand-pose/hand-pose-metrics.csv   the per-sample table, 16 rows
  <cache>/slug-map.private.json                     slug -> episode folder; never inside the repo

Every count comes from ONE exclusive state per frame and hand (hp_common):
measured if the measured flag is set, else guessed, else bridged, else none. The page, the CSV,
the lanes and the sample packs all derive from it, so they cannot disagree.

Titles, skill groups and publish tiers come from curation.json only. Poster frames and loop windows
come from render-plan.json (written by render-skeleton.py, which must have run first).

Nothing here prints or writes an episode name, a place, a device, a person or a date: samples are
named by slug in every message, and the outputs are scanned for leaks before the script ends.

Fails loudly (AssertionError naming the slug) if any of these does not hold:
  * every SUMMARY row equals its handpose.json (frames, "measured / guessed", delivered and
    missed percentages within 0.051);
  * the exclusive measured / guessed counts equal handpose.json's, per hand;
  * measured and guessed are never both set on a frame;
  * every lane covers [0, frames) exactly, adjacent runs differ, and the runs add up to the counts;
  * the headline numbers are exactly the published ones.

Longest gap. Each hand carries `longestNoPoseFrames` and the CSV has *_longest_no_pose_frames: the
longest run with no 3D pose, read off the exclusive state array like every other count, so the number
agrees with the lane drawn beside it. The pipeline gate's own figure (handpose.json
gate.<side>.longest_gap_frames) is not the longest empty run of the lane and differs from it on most
hands, so it is not published by default. `--longest-gap gate` publishes it instead, as
`longestGapFrames` and *_longest_gap_frames (the first version of the data contract).

Usage:  python3 build-handpose-data.py [--longest-gap lane|gate]
"""

from __future__ import annotations

import argparse
import csv
import io
import re
import sys
from fractions import Fraction

import numpy as np

sys.dont_write_bytecode = True  # no __pycache__ in the scripts folder
import hp_common as C  # noqa: E402
from hp_common import check, pct1, round_half_away  # noqa: E402

# The numbers the page and the copy publish. The build must reproduce them exactly.
HEADLINE = {
    "samples": 16, "frames": 43168, "minutes": 24.0, "measured": 62725, "guessed": 6411,
    "delivered": 69136, "handSlots": 86336,
    "measuredOfDeliveredPct": 90.7, "guessedOfDeliveredPct": 9.3, "measuredOfSlotsPct": 72.7,
    "deliveredOfSlotsPct": 80.1,
}
# Per-hand coverage figures quoted in the copy (re-derived from the data by the review).
POSE_EXPECTED = {"min": 24.0, "median": 83.6, "max": 99.9, "atLeast95": 9, "atLeast80": 20, "below50": 4}

CSV_COLUMNS = [
    "sample", "title", "skill_group", "duration_s", "frames", "left_pose_pct", "right_pose_pct",
    "left_measured", "left_guessed", "left_bridged", "left_no_3d_pose",
    "right_measured", "right_guessed", "right_bridged", "right_no_3d_pose",
    "measured_of_delivered_pct", "guessed_of_delivered_pct",
    "left_missed_reported_pct", "right_missed_reported_pct",
    "left_longest_gap_frames", "right_longest_gap_frames", "public_video_preview",
]
GAP_KEY = {"gate": "longestGapFrames", "lane": "longestNoPoseFrames"}


def csv_columns(gap: str) -> list[str]:
    if gap == "gate":
        return CSV_COLUMNS
    return [c.replace("_longest_gap_frames", "_longest_no_pose_frames") for c in CSV_COLUMNS]

# Patterns that must never appear in a published file (the privacy script repeats and extends them).
LEAK_PATTERNS = {
    "capture marker": re.compile(rb"capture__"),
    "date_time stamp": re.compile(rb"\d{8}_\d{6}"),
    "segment id": re.compile(rb"seg_\d+"),
    "drive link": re.compile(rb"drive\.google\.com"),
    "device name": re.compile(rb"robocap", re.I),
    "hand-shape parameters": re.compile(rb"betas", re.I),
    "operator field": re.compile(rb"operator_"),
    "business field": re.compile(rb"business_"),
}


def log(msg: str) -> None:
    print(msg, flush=True)


def check_summary(smp: C.Sample) -> None:
    """The SUMMARY row of this sample must equal its handpose.json."""
    row, d = smp.summary, smp.handpose["delivery"]
    check(row["frames"] == smp.frames, f"{smp.slug}: SUMMARY frames {row['frames']} != handpose.json {smp.frames}")
    check(abs(row["duration"] - smp.frames / C.FPS) < 0.051, f"{smp.slug}: SUMMARY duration disagrees with frames / 30")
    for side in C.SIDES:
        want = f"{d[side]['measured']} / {d[side]['guessed']}"
        check(row[f"{side}_mg"] == want, f"{smp.slug}: {side} measured / guessed {row[f'{side}_mg']!r} != {want!r}")
        check(abs(d[side]["delivered_pct"] - row[f"{side}_pct"]) < 0.051, f"{smp.slug}: {side} delivered % differs")
        check(abs(d[side]["missing_pct"] - row[f"{side}_missed"]) < 0.051, f"{smp.slug}: {side} missed % differs")


def side_stats(smp: C.Sample, hands: C.Hands, side: str, gap: str) -> dict:
    s = hands.sides[side]
    d = smp.handpose["delivery"][side]
    check(not bool((s.measured & s.guessed).any()), f"{smp.slug}: {side} has frames flagged both measured and guessed")
    counts = np.bincount(s.state, minlength=4)
    check(int(counts.sum()) == smp.frames, f"{smp.slug}: {side} states do not add up to the frame count")
    check(int(counts[C.MEASURED]) == d["measured"],
          f"{smp.slug}: {side} exclusive measured {int(counts[C.MEASURED])} != handpose.json {d['measured']}")
    check(int(counts[C.GUESSED]) == d["guessed"],
          f"{smp.slug}: {side} exclusive guessed {int(counts[C.GUESSED])} != handpose.json {d['guessed']}")
    pose = pct1(int(counts[C.MEASURED] + counts[C.GUESSED]), smp.frames)
    check(abs(pose - d["delivered_pct"]) < 0.051, f"{smp.slug}: {side} coverage {pose} != delivered_pct {d['delivered_pct']}")
    return {
        "measured": int(counts[C.MEASURED]), "guessed": int(counts[C.GUESSED]),
        "bridged": int(counts[C.BRIDGED]), "none": int(counts[C.NONE]),
        "posePct": pose,
        "missedPct": round_half_away(d["missing_pct"], 1),
        GAP_KEY[gap]: (int(smp.handpose["gate"][side]["longest_gap_frames"]) if gap == "gate"
                       else int(C.longest_run(s.state == C.NONE)[1])),
    }


def build_lane(smp: C.Sample, hands: C.Hands) -> dict:
    lane = {"slug": smp.slug, "frames": smp.frames, "fps": C.FPS, "states": list(C.STATE_NAMES)}
    for side in C.SIDES:
        st = hands.state(side)
        r = C.runs(st)
        # runs cover [0, frames) exactly, adjacent runs differ, per-state totals equal the counts
        check(r[0][1] == 0 and sum(x[2] for x in r) == smp.frames, f"{smp.slug}: {side} lane does not cover the frames")
        for (s0, a0, n0), (s1, a1, n1) in zip(r, r[1:]):
            check(a1 == a0 + n0, f"{smp.slug}: {side} lane has a gap")
            check(s0 != s1, f"{smp.slug}: {side} lane has two adjacent runs of the same state")
        counts = np.bincount(st, minlength=4)
        for k in range(4):
            check(sum(x[2] for x in r if x[0] == k) == int(counts[k]), f"{smp.slug}: {side} lane total for state {k} is off")
        lane[side] = r
    return lane


def media_block(smp: C.Sample, hands: C.Hands, plan: dict):
    """media, loop and posterFrame for one sample, checked against the files on disk."""
    none = {"poster": None, "still": None, "loop": None, "video": None, "videoSeconds": None}
    if smp.preview == "lane":
        for kind in ("poster", "still", "loop", "video"):
            check(not C.media_file(kind, smp.slug).exists(), f"{smp.slug}: a lane-only sample must have no {kind} file")
        return none, None, None
    entry = plan["samples"].get(smp.slug)
    check(entry is not None, f"{smp.slug}: not in render-plan.json (run render-skeleton.py first)")
    media = dict(none)
    kinds = ["poster", "still"] + (["loop", "video"] if smp.preview == "video" else [])
    for kind in kinds:
        check(C.media_file(kind, smp.slug).exists(), f"{smp.slug}: missing {kind} file (run render-skeleton.py)")
        media[kind] = C.media_url(kind, smp.slug)
    if smp.preview == "poster":
        for kind in ("loop", "video"):
            check(not C.media_file(kind, smp.slug).exists(), f"{smp.slug}: unexpected {kind} file")
    f = entry["posterFrame"]
    check(0 <= f < smp.frames and all(hands.state(s)[f] == C.MEASURED for s in C.SIDES),
          f"{smp.slug}: the poster frame must have both hands measured")
    loop = None
    if smp.preview == "video":
        loop = {k: int(entry["loop"][k]) for k in ("start", "frames", "crossfadeFrames")}
        check(loop["start"] >= 0 and loop["start"] + loop["frames"] + loop["crossfadeFrames"] <= smp.frames,
              f"{smp.slug}: the loop window leaves the sample")
        check(loop["frames"] >= 60, f"{smp.slug}: loop shorter than 2 s")
        v = C.probe_mp4(C.media_file("video", smp.slug))
        check(v["frames"] == smp.frames, f"{smp.slug}: video has {v['frames']} frames, expected {smp.frames}")
        c = C.probe_mp4(C.media_file("loop", smp.slug))
        check(c["frames"] == loop["frames"], f"{smp.slug}: loop has {c['frames']} frames, expected {loop['frames']}")
        media["videoSeconds"] = round_half_away(Fraction(smp.frames, C.FPS), 1)
    return media, loop, int(f)


def sample_doc(smp: C.Sample, hands: C.Hands, plan: dict, gap: str) -> tuple[dict, dict]:
    st = {side: side_stats(smp, hands, side, gap) for side in C.SIDES}
    L, R = st["left"], st["right"]
    meas, gues = L["measured"] + R["measured"], L["guessed"] + R["guessed"]
    min_pose = min(L["posePct"], R["posePct"])
    media, loop, poster_frame = media_block(smp, hands, plan)
    lane = build_lane(smp, hands)
    doc = {
        "n": smp.n, "slug": smp.slug, "title": smp.title, "skillGroup": smp.skill_group,
        "frames": smp.frames, "seconds": round_half_away(Fraction(smp.frames, C.FPS), 1),
        "left": L, "right": R,
        "measuredOfDeliveredPct": pct1(meas, meas + gues),
        "guessedOfDeliveredPct": pct1(gues, meas + gues),
        "minPosePct": min_pose,
        # bands are decided on the published one-decimal figure
        "bothHandsBand": "95+" if min_pose >= 95 else "80-95" if min_pose >= 80 else "<80",
        "preview": smp.preview, "pack": smp.pack,
        "media": media, "loop": loop, "posterFrame": poster_frame,
        "lane": C.media_url("lane", smp.slug),
        "strip": {side: C.strip(hands.state(side)) for side in C.SIDES},
    }
    return doc, lane


def aggregates(docs: list[dict]) -> dict:
    frames = sum(d["frames"] for d in docs)
    meas = sum(d[s]["measured"] for d in docs for s in C.SIDES)
    gues = sum(d[s]["guessed"] for d in docs for s in C.SIDES)
    brid = sum(d[s]["bridged"] for d in docs for s in C.SIDES)
    none = sum(d[s]["none"] for d in docs for s in C.SIDES)
    slots = 2 * frames
    delivered = meas + gues
    check(meas + gues + brid + none == slots, "aggregate states do not add up to the hand-slots")
    # all published one-decimal figures: a threshold test reads the number the page shows
    pose = sorted(d[s]["posePct"] for d in docs for s in C.SIDES)
    mins = [d["minPosePct"] for d in docs]
    frame_counts = [d["frames"] for d in docs]
    tiers = [d["preview"] for d in docs]
    thirty = Fraction(1, C.FPS)
    return {
        "samples": len(docs), "frames": frames,
        "seconds": round_half_away(frames * thirty, 1), "minutes": round_half_away(Fraction(frames, C.FPS * 60), 1),
        "handSlots": slots, "measured": meas, "guessed": gues, "bridged": brid, "none": none, "delivered": delivered,
        "measuredOfDeliveredPct": pct1(meas, delivered), "guessedOfDeliveredPct": pct1(gues, delivered),
        "measuredOfSlotsPct": pct1(meas, slots), "deliveredOfSlotsPct": pct1(delivered, slots),
        "durationMedianSec": round_half_away(C.median_fraction(frame_counts) * thirty, 1),
        "durationMinSec": round_half_away(min(frame_counts) * thirty, 1),
        "durationMaxSec": round_half_away(max(frame_counts) * thirty, 1),
        "pose": {
            "min": pose[0], "median": round_half_away(C.median_fraction([Fraction(repr(p)) for p in pose]), 1),
            "max": pose[-1],
            "atLeast95": sum(p >= 95 for p in pose), "atLeast80": sum(p >= 80 for p in pose),
            "below50": sum(p < 50 for p in pose),
        },
        "bothHands": {
            "atLeast95": sum(m >= 95 for m in mins), "from80to95": sum(80 <= m < 95 for m in mins),
            "below80": sum(m < 80 for m in mins),
        },
        "preview": {t: tiers.count(t) for t in C.PREVIEW_TIERS},
    }


def check_headline(agg: dict) -> None:
    for key, want in HEADLINE.items():
        check(agg[key] == want, f"headline {key}: computed {agg[key]!r}, published {want!r}")
    for key, want in POSE_EXPECTED.items():
        check(agg["pose"][key] == want, f"per-hand coverage {key}: computed {agg['pose'][key]!r}, expected {want!r}")
    check(agg["preview"] == {"video": 14, "poster": 1, "lane": 1}, f"preview tiers are {agg['preview']}")


def build_csv(docs: list[dict], gap: str) -> str:
    """RFC 4180 (quoting only where a field needs it), LF line endings, trailing newline."""
    out = io.StringIO()
    w = csv.writer(out, lineterminator="\n", quoting=csv.QUOTE_MINIMAL)
    w.writerow(csv_columns(gap))
    key = GAP_KEY[gap]
    one = lambda x: f"{x:.1f}"
    for d in docs:
        L, R = d["left"], d["right"]
        w.writerow([
            d["slug"], d["title"], d["skillGroup"], one(d["seconds"]), d["frames"], one(L["posePct"]), one(R["posePct"]),
            L["measured"], L["guessed"], L["bridged"], L["none"], R["measured"], R["guessed"], R["bridged"], R["none"],
            one(d["measuredOfDeliveredPct"]), one(d["guessedOfDeliveredPct"]),
            one(L["missedPct"]), one(R["missedPct"]), L[key], R[key],
            "yes" if d["preview"] == "video" else "no",
        ])
    return out.getvalue()


def scan_for_leaks(paths: list, episodes: list[str]) -> int:
    """Look in every published file (text or media) for anything that names a capture, a place or a person."""
    needles = set()
    for ep in episodes:
        needles.add(ep.encode())
        for part in ep.split("__"):
            if len(part) >= 8:
                needles.add(part.encode())
    hits = 0
    for p in paths:
        data = p.read_bytes()
        for label, pat in LEAK_PATTERNS.items():
            if pat.search(data):
                hits += 1
                log(f"LEAK ({label}) in {p.relative_to(C.REPO).as_posix()}")
        for n in needles:
            if n in data:
                hits += 1
                log(f"LEAK (episode name) in {p.relative_to(C.REPO).as_posix()}")
    return hits


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--longest-gap", choices=("lane", "gate"), default="lane",
                    help="lane (default): the longest run with no 3D pose, read off the state array; "
                         "gate: the pipeline's own longest_gap_frames")
    gap = ap.parse_args().longest_gap
    samples = C.load_samples()
    plan = C.load_json(C.RENDER_PLAN_JSON, "render-plan.json") if C.RENDER_PLAN_JSON.exists() else None
    check(plan is not None, "render-plan.json is missing: run render-skeleton.py first")
    check(C.REPO not in C.SLUG_MAP_PRIVATE.parents, "the private slug map must live outside the repository")

    docs, lanes = [], []
    log("slug          frames  left m/g/b/none          right m/g/b/none         pose L/R      tier    stray L/R")
    for smp in samples:
        check_summary(smp)
        hands = C.Hands(smp)
        doc, lane = sample_doc(smp, hands, plan, gap)
        L, R = doc["left"], doc["right"]
        log(f"{smp.slug}  {smp.frames:6d}  {L['measured']:5d}/{L['guessed']:3d}/{L['bridged']:2d}/{L['none']:4d}  "
            f"{R['measured']:5d}/{R['guessed']:3d}/{R['bridged']:2d}/{R['none']:4d}  "
            f"{L['posePct']:5.1f}/{R['posePct']:5.1f}  {doc['preview']:6}  "
            f"{hands.sides['left'].stray}/{hands.sides['right'].stray}")
        docs.append(doc)
        lanes.append(lane)

    agg = aggregates(docs)
    check_headline(agg)
    log(f"\nheadline numbers verified: {agg['samples']} samples, {agg['frames']:,} frames, {agg['minutes']} min, "
        f"{agg['measured']:,} measured, {agg['guessed']:,} guessed, {agg['delivered']:,} delivered of "
        f"{agg['handSlots']:,} hand-slots ({agg['measuredOfDeliveredPct']} / {agg['guessedOfDeliveredPct']} / "
        f"{agg['measuredOfSlotsPct']} / {agg['deliveredOfSlotsPct']} %)")
    log("stray = rows that hold joints but carry no state flag: treated as no 3D pose, never published")
    if gap == "lane":
        differs = sum(d[side]["longestNoPoseFrames"] != int(s.handpose["gate"][side]["longest_gap_frames"])
                      for d, s in zip(docs, samples) for side in C.SIDES)
        log(f"longest gap: the lane's own figure is published (longestNoPoseFrames); the pipeline's longest_gap_frames "
            f"differs from it on {differs} of {2 * len(docs)} hands")

    metrics = {
        "source": "scripts/samples/handpose/build-handpose-data.py",
        "fps": C.FPS,
        "jointsPerHand": C.N_JOINTS,
        "jointNames": C.JOINT_NAMES,
        "states": list(C.STATE_NAMES),
        "aggregates": agg,
        "samples": docs,
    }
    written = [C.METRICS_JSON, C.METRICS_CSV]
    C.dump_json(C.METRICS_JSON, metrics)
    for lane in lanes:
        path = C.LANES_DIR / f"{lane['slug']}.json"
        C.dump_json(path, lane, compact=True)
        written.append(path)
    csv_text = build_csv(docs, gap)
    C.METRICS_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(C.METRICS_CSV, "w", encoding="utf-8", newline="") as fh:
        fh.write(csv_text)
    C.dump_json(C.SLUG_MAP_PRIVATE, {s.slug: s.episode for s in samples})

    # the files we just wrote, read back: they must parse and say what we computed
    back = C.load_json(C.METRICS_JSON, "metrics")
    check(back == metrics, "metrics JSON does not round-trip")
    rows = list(csv.reader(io.StringIO(C.METRICS_CSV.read_text(encoding="utf-8"))))
    check(rows[0] == csv_columns(gap) and len(rows) == 17, "CSV header or row count is off")
    check(all(len(r) == len(CSV_COLUMNS) for r in rows), "CSV has a ragged row")
    for d in docs:
        check(len(d["strip"]["left"]) == C.STRIP_BINS == len(d["strip"]["right"]), f"{d['slug']}: strip length")
        check(set(d["strip"]["left"] + d["strip"]["right"]) <= set("0123"), f"{d['slug']}: strip characters")

    public = written + [C.media_file(k, s.slug) for s in samples for k in ("poster", "still", "loop", "video")
                        if C.media_file(k, s.slug).exists()] + [p for p in C.HERO_FILES.values() if p.exists()]
    public += [C.RENDER_PLAN_JSON, C.CURATION_JSON]
    hits = scan_for_leaks(public, [s.episode for s in samples])
    check(hits == 0, f"privacy scan found {hits} leak(s)")
    log(f"privacy scan: 0 findings in {len(public)} files")
    log(f"wrote {C.METRICS_JSON.relative_to(C.REPO).as_posix()}, {len(lanes)} lanes, "
        f"{C.METRICS_CSV.relative_to(C.REPO).as_posix()} and the private slug map (outside the repo)")


if __name__ == "__main__":
    try:
        main()
    except C.DataError as e:
        sys.exit(f"FAILED: {e}")
