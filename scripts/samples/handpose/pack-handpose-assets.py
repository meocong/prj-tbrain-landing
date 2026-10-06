#!/usr/bin/env python3
"""Build the gated sample packs (passcode downloads) for the samples marked `pack` in curation.json.

Output goes OUTSIDE the repository, to <cache>/packs/:
  hand-pose-NN-pack.zip      one folder, hand-pose-NN/, with
      joints.npz             poses, states and flags as arrays (see README.txt inside)
      hand-pose-NN.rrd       the same poses for the Rerun viewer, generated fresh from joints.npz only
                             (Rerun Python SDK chunk API; chunk and row ids are counters, not clock ids)
      metadata.json          counts, coverage, glossary (taken from the public metrics file)
      README.txt             field table, joint order, loader, coordinate frame
      SHA256SUMS             checksums of the four files above
  manifest.json              size and sha256 of every zip (to register the downloads later)

What is deliberately NOT in a pack: hand-shape fit parameters, bone lengths, mesh vertices, pose
and orientation parameters, 2D joints, per-joint scores, matching diagnostics, any rig calibration,
the episode, device, operator or place, and any date. The arrays are written by an explicit
whitelist; the .rrd has no camera entity, no transform, no recording start time, no file path and no
clock (Rerun's own chunk and row ids start with the build time, so the recording is assembled from
chunks that carry counter ids; the one store-info id is zeroed in the file and the result is verified).

Every pack is verified before the script ends: checksums, array names / shapes / dtypes, counts
equal to the public metrics file, `rerun rrd verify`, the recording read back and compared value by
value with joints.npz, the check that no id in it carries a time, the forbidden-string scan of
`rerun rrd print -vvv`, a text scan of every file, the size limit, and the loader in README.txt is
extracted and run against the zip as shipped. A failed scan names the rule and the file, never the text.

Usage:  python3 pack-handpose-assets.py [--only NN]      (needs build-handpose-data.py to have run)
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

import numpy as np

sys.dont_write_bytecode = True  # no __pycache__ in the scripts folder
import hp_common as C  # noqa: E402
from hp_common import check  # noqa: E402

FIXED_DATE = (1980, 1, 1, 0, 0, 0)     # zip entries carry no build date
MAX_PACK_BYTES = 10 * 1000 * 1000
FILES = ("joints.npz", "{slug}.rrd", "metadata.json", "README.txt")
NPZ_KEYS = ["fps", "joint_names"] + [f"{s}_{k}" for s in C.SIDES for k in ("joints", "state", "only2d", "view_count", "confidence")]
NPZ_SPEC = {  # name -> (dtype, trailing shape)
    "fps": ("int32", ()), "joint_names": ("<U8", (21,)),
    "joints": ("float32", (21, 3)), "state": ("uint8", ()), "only2d": ("bool", ()),
    "view_count": ("uint8", ()), "confidence": ("float32", ()),
}
# Every scan below is a set of NAMED rules. A failure says which rule fired and in which file, never the text that
# matched: a build log is not a place to repeat a timestamp, an episode token or a path.
#
# `rerun rrd print -vvv` must match none of these (the requirement; case-insensitive) ...
RRD_RULES = {
    "recording start time": re.compile(r"start_time", re.I),
    "camera entity": re.compile(r"cam", re.I),
    "stereo camera name": re.compile(r"mid_left|mid_right", re.I),
    "capture marker": re.compile(r"capture__", re.I),
    "segment marker": re.compile(r"seg_", re.I),
    "camera transform": re.compile(r"Transform3D", re.I),
    "device name": re.compile(r"robocap", re.I),
    # ... and no wall-clock time column or ISO date either (the SDK adds log_time / log_tick unless disabled)
    "wall-clock time column": re.compile(r"log_time|log_tick", re.I),
    "ISO date": re.compile(r"\d{4}-\d{2}-\d{2}"),
}
BINARY_RULES = {  # joints.npz, the .rrd and SHA256SUMS, read as latin-1 text
    "capture marker": re.compile(r"capture__", re.I),
    "date-time stamp": re.compile(r"\d{8}_\d{6}", re.I),
    "segment id": re.compile(r"seg_\d+", re.I),
    "drive link": re.compile(r"drive\.google", re.I),
    "device name": re.compile(r"robocap", re.I),
    "operator field": re.compile(r"operator_", re.I),
    "business field": re.compile(r"business_", re.I),
    "local path": re.compile(r"/Users/", re.I),
}
TEXT_RULES = {  # README.txt and metadata.json: the binary rules plus words the texts must not use
    **BINARY_RULES,
    "hand-shape parameters": re.compile(r"betas", re.I),
    "mesh model name": re.compile(r"MANO", re.I),
    "calibration": re.compile(r"calibration", re.I),
    "palm size": re.compile(r"palm size", re.I),
    "bone length": re.compile(r"bone length", re.I),
    "local path (linux)": re.compile(r"/home/", re.I),
}


def first_rule(rules: dict, text: str):
    """Name of the first rule that matches `text`, or None. The matched text itself is never returned."""
    return next((label for label, pat in rules.items() if pat.search(text)), None)
COLORS = {"left": (86, 180, 233), "right": (230, 159, 0)}
ALPHA = {C.MEASURED: 255, C.GUESSED: 150, C.BRIDGED: 90}
CHAINS = [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [0, 9, 10, 11, 12], [0, 13, 14, 15, 16], [0, 17, 18, 19, 20], [5, 9, 13, 17]]

LOADER_BEGIN, LOADER_END = "--- loader: copy into a file next to joints.npz and run ---", "--- end of loader ---"
LOADER = '''import numpy as np
z = np.load("joints.npz")
fps, names = int(z["fps"]), list(z["joint_names"])
J, state = z["left_joints"], z["left_state"]      # (frames, 21, 3) metres, (frames,) 0 none 1 measured 2 guessed 3 bridged
has_pose = state > 0                              # joints are NaN where there is no pose
wrist = J[has_pose, names.index("wrist")]
print(len(state), "frames at", fps, "fps;", int(has_pose.sum()), "with a left-hand pose")
print("measured", int((state == 1).sum()), "guessed", int((state == 2).sum()), "bridged", int((state == 3).sum()))
print("first wrist position (m):", np.round(wrist[0], 3))
print("mean wrist speed (m/s):", round(float(np.nanmean(np.linalg.norm(np.diff(J[:, 0], axis=0), axis=1)) * fps), 3))'''


def log(msg: str) -> None:
    print(msg, flush=True)


# ------------------------------------------------------------------ arrays --

def pack_arrays(smp: C.Sample, hands: C.Hands) -> dict:
    """The whitelist of what leaves the building, as full-length arrays."""
    out = {"fps": np.array(C.FPS, np.int32), "joint_names": np.array(C.JOINT_NAMES)}
    for side in C.SIDES:
        state = hands.state(side).astype(np.uint8)
        conf = hands.per_frame(side, "confidence", np.float32, np.nan)
        conf[state == C.NONE] = np.nan
        out[f"{side}_joints"] = hands.joints(side)                     # NaN where the state is none
        out[f"{side}_state"] = state
        out[f"{side}_only2d"] = hands.per_frame(side, "only2d", bool, False)
        out[f"{side}_view_count"] = hands.per_frame(side, "view_count", np.uint8, 0)
        out[f"{side}_confidence"] = conf
    check(list(out) == NPZ_KEYS, f"{smp.slug}: pack arrays are not the whitelist")
    return out


def save_npz(path: Path, arrays: dict) -> None:
    """np.savez_compressed, but with fixed entry dates so the file does not depend on the day it was built."""
    with zipfile.ZipFile(path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name, arr in arrays.items():
            info = zipfile.ZipInfo(f"{name}.npy", date_time=FIXED_DATE)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            with zf.open(info, "w", force_zip64=True) as fh:
                np.lib.format.write_array(fh, np.asanyarray(arr), allow_pickle=False)


# --------------------------------------------------------------------- rrd --

LEGEND_TEXT = (
    "Left hand sky blue, right hand orange. Opacity tells how the frame was obtained: full = measured, "
    "medium = guessed, faint = bridged; nothing is drawn where no 3D pose was delivered.\n\n"
    "State series: 0 none, 1 measured, 2 guessed, 3 bridged. Positions are metres in the head-rig frame; "
    "see README.txt in the pack.")
RRD_ENTITIES = {"/legend"} | {f"/hands/{s}/{part}" for s in C.SIDES for part in ("state", "joints", "bones")}


class _Ids:
    """Chunk and row ids from counters. Rerun's own ids are clock based (their first 64 bits are the nanoseconds
    since 1970 at the moment of the build), so the recording is assembled from chunks that get these instead."""

    def __init__(self):
        self.chunks = 0
        self.rows = 0

    def chunk_id(self) -> str:
        self.chunks += 1
        return f"chunk_{0:016X}{self.chunks:016X}"

    def row_ids(self, n: int):
        import pyarrow as pa

        a = np.zeros((n, 2), dtype=">u8")                      # 16 bytes per id: time part 0, then the counter
        a[:, 1] = np.arange(self.rows + 1, self.rows + 1 + n, dtype=np.uint64)
        self.rows += n
        return pa.FixedSizeBinaryArray.from_buffers(pa.binary(16), n, [None, pa.py_buffer(a.tobytes())])


def _restamp(chunk, ids: _Ids):
    """The same chunk with counter ids instead of clock ids (Chunk.from_record_batch keeps ids that are present)."""
    import pyarrow as pa
    import rerun as rr

    rb = chunk.to_record_batch()
    check(rb.schema.field(0).name == "rerun.controls.RowId", "rrd: the row id column is not where it was expected")
    cols = [ids.row_ids(rb.num_rows)] + [rb.column(i) for i in range(1, rb.num_columns)]
    meta = dict(rb.schema.metadata)
    meta[b"rerun:id"] = ids.chunk_id().encode()
    out = rr.chunk.Chunk.from_record_batch(pa.RecordBatch.from_arrays(cols, schema=rb.schema.with_metadata(meta)))
    check(len(out) == 1, "rrd: a chunk came back in pieces")
    return out[0]


def rrd_chunks(J: dict, S: dict) -> list:
    """Every chunk of the recording, columnar, in a fixed order: per hand its state series, its joints (Points3D) and
    its bones (LineStrips3D) on the `frame` timeline wherever a pose exists, and a Clear wherever none does."""
    import rerun as rr

    ids = _Ids()
    out = []

    def add(path, index, columns):
        out.append(_restamp(rr.chunk.Chunk.from_columns(path, index, columns), ids))

    n = len(S["left"])
    add("/legend", [], rr.TextDocument.columns(text=[LEGEND_TEXT]))
    for side in C.SIDES:
        st = S[side]
        add(f"/hands/{side}/state", [], rr.SeriesLines.columns(colors=[COLORS[side]], widths=[1.5], names=[f"{side} hand state"]))
        add(f"/hands/{side}/state", [rr.TimeColumn("frame", sequence=np.arange(n))], rr.Scalars.columns(scalars=st.astype(np.float64)))
        pose, none = np.flatnonzero(st != C.NONE), np.flatnonzero(st == C.NONE)
        if len(pose):
            k = len(pose)
            t = [rr.TimeColumn("frame", sequence=pose)]
            rgba = np.array([(*COLORS[side], ALPHA[int(st[i])]) for i in pose], dtype=np.uint8)
            pts = np.ascontiguousarray(J[side][pose].astype(np.float32).reshape(-1, 3))
            add(f"/hands/{side}/joints", t, [*rr.Points3D.columns(positions=pts).partition(lengths=[21] * k),
                                             *rr.Points3D.columns(radii=np.full(k, 0.005, np.float32)),
                                             *rr.Points3D.columns(colors=rgba)])
            strips = [J[side][i][c].astype(np.float32) for i in pose for c in CHAINS]
            add(f"/hands/{side}/bones", t, [*rr.LineStrips3D.columns(strips=strips).partition(lengths=[len(CHAINS)] * k),
                                            *rr.LineStrips3D.columns(radii=np.full(k, 0.002, np.float32)),
                                            *rr.LineStrips3D.columns(colors=rgba)])
        if len(none):
            for part in ("joints", "bones"):
                add(f"/hands/{side}/{part}", [rr.TimeColumn("frame", sequence=none)],
                    rr.Clear.columns(is_recursive=[False] * len(none)))
    return out


def _store_info_ids(b: bytearray) -> list[int]:
    """Offsets of the row-id field (time, then counter) of every SetStoreInfo message at the head of an rrd file."""
    check(b[:4] == b"RRF2", "rrd: unexpected file header")
    pos, found = 12, []                                          # first message follows the 12-byte file header
    while int.from_bytes(b[pos:pos + 8], "little") == 1:         # message kind 1 = SetStoreInfo
        length = int.from_bytes(b[pos + 8:pos + 16], "little")
        body = pos + 16
        check(b[body:body + 3] == bytes.fromhex("0a1209") and b[body + 11] == 0x11, "rrd: unexpected store info layout")
        found.append(body + 3)
        pos = body + length
    check(bool(found), "rrd: no store info message found")
    return found


def zero_store_info_times(path: Path) -> int:
    """Rerun writes one SetStoreInfo message at the head of the file with a fresh, clock-based row id. Overwrite its
    time part with 0 and its counter with 1, 2, ... (nothing else in the file depends on it; `rerun rrd verify` and the
    read-back below check that). Fails if the layout is not the one this was written against (Rerun 0.38)."""
    b = bytearray(path.read_bytes())
    for k, at in enumerate(_store_info_ids(b)):
        b[at:at + 8] = (0).to_bytes(8, "little")
        b[at + 9:at + 17] = (k + 1).to_bytes(8, "little")
    path.write_bytes(b)
    return k + 1


def store_info_times(path: Path) -> list[int]:
    """The time part of the row id of every SetStoreInfo message (must all be 0)."""
    b = bytearray(path.read_bytes())
    return [int.from_bytes(b[at:at + 8], "little") for at in _store_info_ids(b)]


def write_rrd(path: Path, slug: str, npz_path: Path) -> None:
    """A fresh Rerun recording made from joints.npz only: points and bones per hand per frame on the `frame`
    timeline, hand identity by colour, state by opacity and by a scalar series. It carries no recording start time,
    no log_time or log_tick timeline, no camera, no transform, no file path and no clock: chunk and row ids are
    counters and the one store-info id is zeroed (see _Ids and zero_store_info_times)."""
    import rerun as rr

    z = np.load(npz_path, allow_pickle=False)
    J = {s: z[f"{s}_joints"] for s in C.SIDES}
    S = {s: z[f"{s}_state"] for s in C.SIDES}
    rr.chunk.ChunkStore.from_chunks(rrd_chunks(J, S)).write_rrd(path, application_id=slug, recording_id=slug)
    zero_store_info_times(path)


def check_rrd_content(path: Path, J: dict, S: dict) -> None:
    """Read the recording back with the SDK's own reader and compare every value with the arrays that ship:
    positions and bones of every frame with a pose, a Clear on every frame without, the state series, the colours."""
    import rerun as rr

    got: dict = {}
    for ch in rr.chunk.RrdReader(str(path)).stream().to_chunks():
        got.setdefault(ch.entity_path, []).append(ch.to_record_batch())
    check(set(got) == RRD_ENTITIES, "rrd: the entities are not the expected ones")

    def column(rb, name):
        return rb.column(rb.schema.get_field_index(name))

    def one(batches, name, what):
        sel = [rb for rb in batches if name in rb.schema.names]
        check(len(sel) == 1, f"rrd: expected one {what} chunk")
        return sel[0]

    for side in C.SIDES:
        st = S[side]
        n = len(st)
        pose, none = np.flatnonzero(st != C.NONE), np.flatnonzero(st == C.NONE)
        sc = one(got[f"/hands/{side}/state"], "Scalars:scalars", "state series")
        check(bool((np.array(column(sc, "frame")) == np.arange(n)).all()), "rrd: state series frames")
        check(bool((np.array([v[0] for v in column(sc, "Scalars:scalars").to_pylist()]) == st).all()), "rrd: state series values")
        for part, comp in (("joints", "Points3D:positions"), ("bones", "LineStrips3D:strips")):
            batches = got[f"/hands/{side}/{part}"]
            if len(pose):
                rb = one(batches, comp, part)
                check(bool((np.array(column(rb, "frame")) == pose).all()), f"rrd: {part} frames")
                for row, i in zip(column(rb, comp).to_pylist(), pose):
                    if part == "joints":
                        ok = np.array_equal(np.array(row, np.float32), J[side][i].astype(np.float32))
                    else:
                        ok = all(np.array_equal(np.array(s_, np.float32), J[side][i][c].astype(np.float32))
                                 for s_, c in zip(row, CHAINS))
                    check(bool(ok), f"rrd: {side} {part} differ from joints.npz at a frame")
                colors = np.array([v[0] for v in column(rb, comp.split(":")[0] + ":colors").to_pylist()], dtype=np.uint64)
                r, g, b = COLORS[side]
                want = np.array([(r << 24) | (g << 16) | (b << 8) | ALPHA[int(st[i])] for i in pose], dtype=np.uint64)
                check(bool((colors == want).all()), f"rrd: {side} {part} colours")
            else:
                check(not any(comp in rb.schema.names for rb in batches), f"rrd: {side} {part} has data but no pose")
            clears = [rb for rb in batches if "Clear:is_recursive" in rb.schema.names]
            if len(none):
                check(len(clears) == 1 and bool((np.array(column(clears[0], "frame")) == none).all()), f"rrd: {side} {part} clears")
            else:
                check(not clears, f"rrd: {side} {part} has a Clear but no gap")


# ------------------------------------------------------------------- texts --

def metadata_doc(smp: C.Sample, m: dict, arrays: dict) -> dict:
    """Counts come from the public metrics file and are re-derived from the arrays that ship (must agree)."""
    hands = {}
    for side in C.SIDES:
        st = arrays[f"{side}_state"]
        c = np.bincount(st, minlength=4)
        e = m[side]
        check((int(c[1]), int(c[2]), int(c[3]), int(c[0])) == (e["measured"], e["guessed"], e["bridged"], e["none"]),
              f"{smp.slug}: {side} counts in the arrays differ from the public metrics")
        hands[side] = {
            "measured": e["measured"], "guessed": e["guessed"], "bridged": e["bridged"], "no_3d_pose": e["none"],
            "pose_pct": e["posePct"],
            "missed_pct_reported": e["missedPct"],
        }
        # the public metrics carry either the pipeline's longest gap or the lane's longest run with no 3D pose
        if "longestGapFrames" in e:
            hands[side]["longest_gap_frames"] = e["longestGapFrames"]
        else:
            hands[side]["longest_no_pose_frames"] = e["longestNoPoseFrames"]
    f = smp.handpose["flags"]
    return {
        "slug": smp.slug,
        "frames": smp.frames,
        "fps": C.FPS,
        "seconds": m["seconds"],
        "joint_names": C.JOINT_NAMES,
        "states": {
            "0": "none: no 3D pose delivered for this frame (out of view, or detected in 2D but not triangulated)",
            "1": f"measured: {f['measured']}",
            "2": f"guessed: {f['guessed']}",
            "3": f"bridged: {f['bridged']}",
        },
        "state_precedence": "measured, guessed, bridged, none (one state per frame and hand)",
        "hands": hands,
        "pose_pct_definition": "(measured + guessed) / frames * 100; bridged frames are counted separately",
        "missed_pct_note": "as reported by the pipeline; definition being confirmed",
        "flags_glossary": {"measured": f["measured"], "guessed": f["guessed"], "bridged": f["bridged"]},
        "coordinate_frame": "metres, head-rig frame; axes fixed to the rig, directions provided with the full delivery",
    }


def only2d_table(arrays: dict) -> tuple[str, str]:
    """The _only2d flag counted by state, per hand, from the arrays that ship (frames with the flag / frames in the
    state), and a sentence that says only what those counts show."""
    cells = {}
    st = {s: arrays[f"{s}_state"] for s in C.SIDES}
    flag = {s: arrays[f"{s}_only2d"] for s in C.SIDES}
    for side in C.SIDES:
        cells[side] = [f"{int((flag[side] & (st[side] == k)).sum())} / {int((st[side] == k).sum())}" for k in range(4)]
    head = "              " + "".join(f"{name:<13}" for name in C.STATE_NAMES)
    rows = [f"  {side:<12}" + "".join(f"{c:<13}" for c in cells[side]) for side in C.SIDES]
    shows = []
    if any(bool((~flag[s] & (st[s] == C.NONE)).any()) for s in C.SIDES):
        shows.append("it is not set on every frame without a pose")
    for k, name in ((C.MEASURED, "measured"), (C.GUESSED, "guessed"), (C.BRIDGED, "bridged")):
        if any(bool((flag[s] & (st[s] == k)).any()) for s in C.SIDES):
            shows.append(f"it is set on some {name} frames")
    note = "Read it as a hint, not as a definition" + (": " + ", and ".join(shows) if shows else "") + \
        ". Use <side>_state for what a frame holds."
    return "\n".join([head, *rows]), note


def readme_text(smp: C.Sample, m: dict, arrays: dict) -> str:
    n = smp.frames
    rows = []
    for i, name in enumerate(C.JOINT_NAMES):
        rows.append(f"    {i:2d}  {name}")
    joint_table = "\n".join(rows)
    f = smp.handpose["flags"]
    flag_table, flag_note = only2d_table(arrays)
    return f"""HAND POSE SAMPLE PACK  {smp.slug}
{'=' * (22 + len(smp.slug))}

What this is
  The hand poses of one recording: both hands, 21 joints per hand, {C.FPS} frames per second
  ({n} frames, {m['seconds']} s). The wearer had a six-camera head rig on and worked with their
  hands; the 3D poses come from the rig's stereo pair, two cameras about 9 cm apart.

  These are vision-estimated poses with self-consistency checks. No marker-based ground truth was
  captured, so we report coverage and misses, not joint error. Validate on your own held-out data.

Files
  joints.npz        the poses as arrays (fields below)
  {smp.slug}.rrd  the same poses for the Rerun viewer: rerun {smp.slug}.rrd
  metadata.json     counts, coverage and the state glossary for this recording
  README.txt        this file
  SHA256SUMS        checksums of the four files above (sha256sum -c SHA256SUMS)

Fields in joints.npz   (N = {n} frames; <side> is left or right)
  name                shape        dtype    unit  meaning
  fps                 ()           int32    Hz    frames per second ({C.FPS})
  joint_names         (21,)        str      -     joint names, in the order of the joint axis (table below)
  <side>_joints       (N, 21, 3)   float32  m     joint positions in the head-rig frame; NaN where
                                                  <side>_state is 0
  <side>_state        (N,)         uint8    -     0 none, 1 measured, 2 guessed, 3 bridged (below)
  <side>_only2d       (N,)         bool     -     pipeline flag, passed on as reported. Its meaning is
                                                  being confirmed with the data team: it is not the same
                                                  thing as state 0 (counts by state below)
  <side>_view_count   (N,)         uint8    -     the pipeline's view count for the 3D fit (0 to 2);
                                                  2 on every measured frame; as reported, not interpreted
  <side>_confidence   (N,)         float32  -     detector score, NOT a probability; NaN where
                                                  <side>_state is 0

States   (one per frame and hand; every count in this pack uses them)
  0  none      no 3D pose delivered for this frame (out of view, or detected in 2D but not triangulated)
  1  measured  {f['measured']}
  2  guessed   {f['guessed']}
  3  bridged   {f['bridged']}
  If several flags were set on a frame the order is measured, guessed, bridged.
  Pose coverage = (measured + guessed) / frames. Bridged frames are counted separately, not in coverage.
  Joints are published only for frames with a state of 1, 2 or 3. The missed percentages in
  metadata.json are as reported by the pipeline; their definition is being confirmed.

The _only2d flag by state in this recording (frames with the flag set / frames in the state)
{flag_table}
  {flag_note}

Coordinate frame
  Positions are in metres, in the head rig's body frame: one frame for both hands and every frame,
  fixed to the rig on the wearer's head. The axes are fixed to the rig, not to gravity, and this pack
  does not define their direction; that belongs to the rig's camera geometry, which is not published.
  Distances, speeds and angles between joints do not depend on it. Ask for the full delivery if you
  need the axes.

Joint order (axis 1 of every <side>_joints array)
  Wrist, then thumb, index, middle, ring and little finger with four joints each, numbered 1 to 4 from
  the wrist to the fingertip: the same 21-point layout as OpenPose and MediaPipe hands.
{joint_table}

Loader (Python 3, numpy only)
{LOADER_BEGIN}
{LOADER}
{LOADER_END}

Rerun
  {smp.slug}.rrd was written with the Rerun Python SDK 0.38 and opens in the Rerun viewer (rerun-cli 0.38 or
  newer). Hands are drawn per frame on the "frame" timeline: left sky blue, right orange; opacity shows
  the state (full measured, medium guessed, faint bridged); a time series shows the state per hand.
"""


# ------------------------------------------------------------- packing -----

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def write_zip(src: Path, zip_path: Path, slug: str) -> None:
    """Deterministic zip: sorted entries, fixed dates, no extra fields."""
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        for name in sorted(p.name for p in src.iterdir()):
            info = zipfile.ZipInfo(f"{slug}/{name}", date_time=FIXED_DATE)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            zf.writestr(info, (src / name).read_bytes())


# ---------------------------------------------------------- verification ----

def run(cmd: list, **kw):
    return subprocess.run(cmd, capture_output=True, text=True, **kw)


def verify_pack(zip_path: Path, smp: C.Sample, m: dict, episodes: list[str]) -> dict:
    slug = smp.slug
    report = {"zip": zip_path.name, "bytes": zip_path.stat().st_size}
    check(report["bytes"] < MAX_PACK_BYTES, f"{slug}: pack is {report['bytes']:,} bytes, limit {MAX_PACK_BYTES:,}")
    with tempfile.TemporaryDirectory() as tmp:
        with zipfile.ZipFile(zip_path) as zf:
            names = sorted(zf.namelist())
            want = sorted(f"{slug}/{f.format(slug=slug)}" for f in FILES + ("SHA256SUMS",))
            check(names == want, f"{slug}: pack contents are {names}")
            check(all(i.date_time == FIXED_DATE for i in zf.infolist()), f"{slug}: zip entries carry a build date")
            zf.extractall(tmp)
        folder = Path(tmp) / slug
        # checksums
        sums = {}
        for line in (folder / "SHA256SUMS").read_text().splitlines():
            digest, name = line.split("  ")
            sums[name] = digest
        check(sorted(sums) == sorted(f.format(slug=slug) for f in FILES), f"{slug}: SHA256SUMS lists {sorted(sums)}")
        for name, digest in sums.items():
            check(sha256(folder / name) == digest, f"{slug}: checksum of {name} does not match")
        report["checksums"] = "ok"
        # arrays: exactly the whitelist, shapes and dtypes
        z = np.load(folder / "joints.npz", allow_pickle=False)
        check(list(z.files) == NPZ_KEYS, f"{slug}: joints.npz holds {list(z.files)}")
        n = smp.frames
        check(int(z["fps"]) == C.FPS and list(z["joint_names"]) == C.JOINT_NAMES, f"{slug}: fps or joint names")
        for side in C.SIDES:
            for field, (dtype, tail) in NPZ_SPEC.items():
                if field in ("fps", "joint_names"):
                    continue
                a = z[f"{side}_{field}"]
                check(a.shape == (n,) + tail and a.dtype == np.dtype(dtype), f"{slug}: {side}_{field} is {a.dtype}{a.shape}")
            st = z[f"{side}_state"]
            check(bool(np.isnan(z[f"{side}_joints"][st == 0]).all()) and not np.isnan(z[f"{side}_joints"][st > 0]).any(),
                  f"{slug}: {side} joints are not NaN exactly where the state is none")
            check(bool(np.isnan(z[f"{side}_confidence"][st == 0]).all()), f"{slug}: {side} confidence not NaN at none")
        # counts equal the public metrics file
        meta = json.loads((folder / "metadata.json").read_text())
        for side in C.SIDES:
            c = np.bincount(z[f"{side}_state"], minlength=4)
            e = m[side]
            check((int(c[1]), int(c[2]), int(c[3]), int(c[0])) == (e["measured"], e["guessed"], e["bridged"], e["none"]),
                  f"{slug}: {side} state counts differ from the public metrics")
            check(meta["hands"][side]["pose_pct"] == e["posePct"], f"{slug}: {side} pose % differs from the public metrics")
        report["counts"] = "equal to the public metrics"
        # the recording
        rrd = folder / f"{slug}.rrd"
        v = run(["rerun", "rrd", "verify", str(rrd)])
        check(v.returncode == 0, f"{slug}: rerun rrd verify failed")
        printed = run(["rerun", "rrd", "print", "-vvv", str(rrd)]).stdout
        check(len(printed) > 1000, f"{slug}: rerun rrd print produced nothing")
        hit = first_rule(RRD_RULES, printed)
        check(hit is None, f"{slug}: rrd print matches the {hit} rule")
        # no clock anywhere in the ids: every printed chunk and row id has a zero time part, and so has the store info
        clocky = [i for i in re.findall(r"\b(?:chunk|row)_([0-9A-Fa-f]{32})\b", printed) if i[:16] != "0" * 16]
        check(not clocky, f"{slug}: {len(clocky)} chunk or row ids in the rrd carry a time")
        check(all(x == 0 for x in store_info_times(rrd)), f"{slug}: the rrd store info id carries a time")
        # and the recording says exactly what joints.npz says
        check_rrd_content(rrd, {s: z[f"{s}_joints"] for s in C.SIDES}, {s: z[f"{s}_state"] for s in C.SIDES})
        report["rrd"] = (f"verify ok; read back equal to joints.npz; no clock in any id; print -vvv ({len(printed):,} chars) matches none of "
                         "start_time|cam|mid_left|mid_right|capture__|seg_|Transform3D|robocap, nor log_time, log_tick or an ISO date")
        # text scan of every file (binary included) for names, places, dates, forbidden words
        for f in folder.iterdir():
            data = f.read_bytes()
            text = data.decode("latin-1")
            hit = first_rule(TEXT_RULES if f.suffix in (".txt", ".json") else BINARY_RULES, text)
            check(hit is None, f"{slug}: {f.name} matches the {hit} rule")
            for ep in episodes:
                check(ep.encode() not in data, f"{slug}: {f.name} contains an episode name")
                for part in ep.split("__"):
                    if len(part) >= 8:
                        check(part.encode() not in data, f"{slug}: {f.name} contains an episode token")
        report["scan"] = "no episode, place, device, date or path strings"
        # the loader in the README, extracted and run on the pack as shipped
        text = (folder / "README.txt").read_text()
        a, b = text.index(LOADER_BEGIN) + len(LOADER_BEGIN), text.index(LOADER_END)
        code = text[a:b].strip("\n")
        check(len(code.splitlines()) <= 12, f"{slug}: loader is {len(code.splitlines())} lines, limit 12")
        r = run([sys.executable, "-c", code], cwd=folder)
        check(r.returncode == 0, f"{slug}: README loader failed: {r.stderr.strip()[-300:]}")
        report["loader_lines"] = len(code.splitlines())
        report["loader_output"] = r.stdout.strip().splitlines()
    return report


# -------------------------------------------------------------------- main --

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--only", type=int, metavar="NN", help="build one pack")
    args = ap.parse_args()

    check(C.METRICS_JSON.exists(), "src/lib/samples/handpose-metrics.json is missing: run build-handpose-data.py first")
    metrics = {d["slug"]: d for d in C.load_json(C.METRICS_JSON, "metrics")["samples"]}
    samples = C.load_samples()
    episodes = [s.episode for s in samples]
    todo = [s for s in samples if s.pack and (args.only is None or s.n == args.only)]
    check(bool(todo), "no sample to pack (check curation.json and --only)")
    C.PACKS_DIR.mkdir(parents=True, exist_ok=True)
    check(C.REPO not in C.PACKS_DIR.parents, "packs must be written outside the repository")

    manifest = C.load_json(C.PACKS_DIR / "manifest.json", "manifest") if (C.PACKS_DIR / "manifest.json").exists() else {"packs": []}
    reports = []
    for smp in todo:
        m = metrics[smp.slug]
        hands = C.Hands(smp)
        arrays = pack_arrays(smp, hands)
        with tempfile.TemporaryDirectory() as tmp:
            folder = Path(tmp) / smp.slug
            folder.mkdir()
            save_npz(folder / "joints.npz", arrays)
            write_rrd(folder / f"{smp.slug}.rrd", smp.slug, folder / "joints.npz")
            C.dump_json(folder / "metadata.json", metadata_doc(smp, m, arrays))
            (folder / "README.txt").write_text(readme_text(smp, m, arrays), encoding="utf-8", newline="\n")
            names = [f.format(slug=smp.slug) for f in FILES]
            (folder / "SHA256SUMS").write_text("".join(f"{sha256(folder / n)}  {n}\n" for n in sorted(names)),
                                               encoding="utf-8", newline="\n")
            zip_path = C.PACKS_DIR / f"{smp.slug}-pack.zip"
            write_zip(folder, zip_path, smp.slug)
        report = verify_pack(zip_path, smp, m, episodes)
        report["slug"] = smp.slug
        report["sha256"] = sha256(zip_path)
        reports.append(report)
        manifest["packs"] = [p for p in manifest["packs"] if p["slug"] != smp.slug] + [
            {"slug": smp.slug, "file": zip_path.name, "bytes": report["bytes"], "sha256": report["sha256"]}]
        log(f"{smp.slug}: {zip_path.name} {report['bytes']:,} bytes  sha256 {report['sha256']}")
        for k in ("checksums", "counts", "rrd", "scan"):
            log(f"  {k}: {report[k]}")
        log(f"  loader ({report['loader_lines']} lines) output:")
        for line in report["loader_output"]:
            log(f"    {line}")
    manifest["packs"].sort(key=lambda p: p["slug"])
    C.dump_json(C.PACKS_DIR / "manifest.json", manifest)
    log(f"wrote {len(reports)} pack(s) and manifest.json to the packs folder (outside the repo)")


if __name__ == "__main__":
    try:
        main()
    except C.DataError as e:
        sys.exit(f"FAILED: {e}")
