"""Shared helpers for the hand-pose data, media and pack scripts.

Privacy contract, enforced here so the other scripts cannot get it wrong:

  * SUMMARY.xlsx is read by header name and only the columns listed in
    SUMMARY_COLS are kept. Every other column is ignored: it is never indexed,
    copied, logged or written.
  * handpose.json is reduced to a short whitelist right after loading
    (pick_handpose); the rest of the document is dropped.
  * hands.npz is opened with allow_pickle=False and only the arrays a caller
    names are read.
  * The episode folder name is held in Sample.episode (hidden from repr) for file
    lookup and for the private slug map. Nothing in this module prints it; every
    message, log line and error names a sample by slug only (hand-pose-NN).
  * Titles, skill groups and publish tiers come from curation.json and nowhere
    else.

State model (one exclusive state per frame and hand), the same everywhere:
    0 none      no 3D pose delivered for the frame
    1 measured  the measured flag is set
    2 guessed   else the guessed flag is set
    3 bridged   else the bridged flag is set
Every count, lane, strip, percentage and pack array is derived from it.
"""

from __future__ import annotations

import json
import math
import os
import re
from dataclasses import dataclass, field
from fractions import Fraction
from pathlib import Path

import numpy as np

# ---------------------------------------------------------------- paths -----

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]  # scripts/samples/handpose -> repository root
CACHE = Path(os.environ.get("HANDPOSE_CACHE", "~/.cache/tbrain-samples/handpose-v2")).expanduser()
NPZ_ROOT = CACHE / "research" / "npz"
SUMMARY_XLSX = CACHE / "SUMMARY.xlsx"
PACKS_DIR = CACHE / "packs"
SLUG_MAP_PRIVATE = CACHE / "slug-map.private.json"

CURATION_JSON = HERE / "curation.json"
RENDER_PLAN_JSON = HERE / "render-plan.json"

PUBLIC = REPO / "public"
HP_DIR = PUBLIC / "samples" / "hand-pose"
METRICS_JSON = REPO / "src" / "lib" / "samples" / "handpose-metrics.json"
METRICS_CSV = HP_DIR / "hand-pose-metrics.csv"
LANES_DIR = HP_DIR / "lanes"

# public URL -> file under public/
MEDIA_URL = {
    "poster": "/samples/posters/{slug}.jpg",
    "still": "/samples/hand-pose/stills/{slug}.jpg",
    "loop": "/samples/clips/{slug}.mp4",
    "video": "/samples/hand-pose/video/{slug}.mp4",
    "lane": "/samples/hand-pose/lanes/{slug}.json",
}
HERO_FILES = {
    "hero": HP_DIR / "hero.jpg",
    "og": HP_DIR / "og.jpg",
    "hero_loop": HP_DIR / "hero-13.mp4",
    "hero_poster": HP_DIR / "hero-13.jpg",
}
HERO_SAMPLE = 13

# ------------------------------------------------------------ constants -----

FPS = 30
SIDES = ("left", "right")
NONE, MEASURED, GUESSED, BRIDGED = 0, 1, 2, 3
STATE_NAMES = ("none", "measured", "guessed", "bridged")
# strip tie-break order (precedence): measured, guessed, bridged, none
STRIP_ORDER = (MEASURED, GUESSED, BRIDGED, NONE)
STRIP_BINS = 200

FINGERS = ("thumb", "index", "middle", "ring", "little")
JOINT_NAMES = ["wrist"] + [f"{f}_{k}" for f in FINGERS for k in range(1, 5)]
N_JOINTS = len(JOINT_NAMES)
assert N_JOINTS == 21

PREVIEW_TIERS = ("video", "poster", "lane")

SLUG_RE = re.compile(r"^hand-pose-(\d{2})$")

# The only SUMMARY columns this code reads (the 'episode' one is lookup-only).
SUMMARY_COLS = {
    "n": "#",
    "episode": "Sample",
    "duration": "Duration (s)",
    "frames": "Frames",
    "left_pct": "Left: frames with a hand (%)",
    "right_pct": "Right: frames with a hand (%)",
    "left_mg": "Left measured / guessed",
    "right_mg": "Right measured / guessed",
    "left_missed": "Left missed (% of visible)",
    "right_missed": "Right missed (% of visible)",
}


class DataError(AssertionError):
    """A check on the data failed. Messages name samples by slug only."""


def check(cond: bool, msg: str) -> None:
    """assert that survives `python -O`."""
    if not cond:
        raise DataError(msg)


# ------------------------------------------------------------- slug ---------

def slug_of(n: int) -> str:
    return f"hand-pose-{n:02d}"


def n_of(slug: str) -> int:
    m = SLUG_RE.match(slug)
    check(bool(m), f"not a sample slug: {slug!r}")
    return int(m.group(1))


def media_url(kind: str, slug: str) -> str:
    return MEDIA_URL[kind].format(slug=slug)


def media_file(kind: str, slug: str) -> Path:
    return PUBLIC / media_url(kind, slug).lstrip("/")


# -------------------------------------------------------------- rounding ----

def round_half_away(x, nd: int = 1) -> float:
    """Round to `nd` decimals, ties away from zero (90.65 -> 90.7, -0.05 -> -0.1).

    Exact: ints and Fractions are used as they are and floats go through their
    shortest decimal repr, so 0.05-style ties are never decided by binary noise.
    """
    q = x if isinstance(x, Fraction) else Fraction(x) if isinstance(x, int) else Fraction(repr(float(x)))
    scale = 10 ** nd
    v = abs(q) * scale
    r = math.floor(v + Fraction(1, 2))
    return float((-r if q < 0 else r) / scale)


def pct1(num: int, den: int) -> float:
    """num / den as a percentage with one decimal, ties away from zero."""
    check(den > 0, "percentage with an empty denominator")
    return round_half_away(Fraction(num * 100, den), 1)


def median_fraction(values) -> Fraction:
    v = sorted(Fraction(x) if not isinstance(x, Fraction) else x for x in values)
    n = len(v)
    check(n > 0, "median of nothing")
    return v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) / 2


# ------------------------------------------------------------------ json ----

def dump_json(path: Path, obj, compact: bool = False) -> None:
    """Deterministic JSON: insertion key order, LF, trailing newline, no timestamps."""
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    if compact:
        text = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    else:
        text = json.dumps(obj, ensure_ascii=False, indent=2)
    with open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text + "\n")


def load_json(path: Path, what: str):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except OSError:
        raise SystemExit(f"cannot read {what}") from None


# --------------------------------------------------------------- curation ---

def load_curation() -> list[dict]:
    doc = load_json(CURATION_JSON, "curation.json")
    rows = doc["samples"]
    check([r["n"] for r in rows] == list(range(1, len(rows) + 1)), "curation: samples must be numbered 1..N in order")
    for r in rows:
        s = slug_of(r["n"])
        check(isinstance(r["title"], str) and r["title"].strip() != "", f"{s}: curation title missing")
        check(isinstance(r["skillGroup"], str) and r["skillGroup"].strip() != "", f"{s}: curation skillGroup missing")
        check(r["preview"] in PREVIEW_TIERS, f"{s}: curation preview must be one of {PREVIEW_TIERS}")
        check(isinstance(r["pack"], bool), f"{s}: curation pack must be a boolean")
        check(not r["pack"] or r["preview"] == "video", f"{s}: a gated pack requires the video tier")
    return rows


# ---------------------------------------------------------------- summary ---

def load_summary_rows() -> list[dict]:
    """The permitted SUMMARY columns for every row, in row order."""
    import openpyxl

    try:
        wb = openpyxl.load_workbook(SUMMARY_XLSX, read_only=True, data_only=True)
    except OSError:
        raise SystemExit("cannot read SUMMARY.xlsx") from None
    ws = wb["Samples"]
    it = ws.iter_rows(values_only=True)
    header = next(it)
    col = {name: i for i, name in enumerate(header) if name is not None}
    missing = [h for h in SUMMARY_COLS.values() if h not in col]
    check(not missing, f"SUMMARY.xlsx lacks expected columns: {missing}")
    rows = []
    for r in it:
        if r is None or r[col[SUMMARY_COLS["n"]]] is None:
            continue
        rows.append({key: r[col[name]] for key, name in SUMMARY_COLS.items()})
    wb.close()
    return rows


# ------------------------------------------------------------- handpose.json -

def pick_handpose(raw: dict) -> dict:
    """Keep only what the builders need; everything else in the document is dropped."""
    out = {"frames": raw["delivery"]["frames"], "flags": dict(raw["flags"]), "delivery": {}, "gate": {}}
    for side in SIDES:
        d = raw["delivery"][side]
        out["delivery"][side] = {k: d[k] for k in ("measured", "guessed", "delivered_pct", "missing_pct")}
        out["gate"][side] = {"longest_gap_frames": raw["gate"][side]["longest_gap_frames"]}
    return out


@dataclass
class Sample:
    n: int
    slug: str
    title: str
    skill_group: str
    preview: str
    pack: bool
    summary: dict            # permitted SUMMARY columns without the lookup-only one
    handpose: dict           # pick_handpose() result
    episode: str = field(repr=False)  # private: lookup + slug map only

    @property
    def frames(self) -> int:
        return self.handpose["frames"]

    @property
    def npz_path(self) -> Path:
        return NPZ_ROOT / self.episode / "hands.npz"

    @property
    def calibration_path(self) -> Path:
        return CACHE / self.episode / "calibration.json"


def load_samples() -> list[Sample]:
    cur = load_curation()
    rows = load_summary_rows()
    check(len(rows) == len(cur), f"SUMMARY has {len(rows)} rows, curation has {len(cur)}")
    out = []
    for i, (c, r) in enumerate(zip(cur, rows)):
        slug = slug_of(c["n"])
        check(r["n"] == c["n"] == i + 1, f"{slug}: SUMMARY row {i + 1} does not carry number {c['n']}")
        episode = str(r["episode"])
        raw = load_json(CACHE / episode / "handpose.json", f"{slug} handpose.json")
        summary = {k: v for k, v in r.items() if k != "episode"}
        out.append(Sample(c["n"], slug, c["title"], c["skillGroup"], c["preview"], c["pack"], summary,
                          pick_handpose(raw), episode))
    return out


# ------------------------------------------------------------------- states -

@dataclass
class Side:
    rows: np.ndarray        # frame index of each npz row (strictly increasing)
    measured: np.ndarray    # (frames,) bool raw flags scattered to full length
    guessed: np.ndarray
    bridged: np.ndarray
    state: np.ndarray       # (frames,) uint8 exclusive state
    stray: int              # npz rows that hold joints but carry no state flag


def _scatter(frames: int, rows: np.ndarray, values: np.ndarray, fill=0) -> np.ndarray:
    out = np.full((frames,) + values.shape[1:], fill, dtype=values.dtype)
    out[rows] = values
    return out


def exclusive_state(measured: np.ndarray, guessed: np.ndarray, bridged: np.ndarray) -> np.ndarray:
    """measured > guessed > bridged > none, one value per frame."""
    st = np.zeros(measured.shape, np.uint8)
    st[bridged] = BRIDGED
    st[guessed] = GUESSED
    st[measured] = MEASURED
    return st


class Hands:
    """The arrays of one sample's hands.npz, scattered to full length."""

    def __init__(self, sample: Sample):
        self.sample = sample
        self.frames = sample.frames
        self._path = sample.npz_path
        try:
            z = np.load(self._path, allow_pickle=False)
        except OSError:
            raise SystemExit(f"{sample.slug}: cannot read hands.npz") from None
        self.sides: dict[str, Side] = {}
        try:
            for side in SIDES:
                rows = z[f"{side}_frames"].astype(np.int64)
                check(rows.ndim == 1 and len(rows) > 0, f"{sample.slug}: {side} has no rows")
                check(bool((np.diff(rows) > 0).all()), f"{sample.slug}: {side} frame rows are not strictly increasing")
                check(rows[0] >= 0 and rows[-1] < self.frames, f"{sample.slug}: {side} frame rows leave [0, frames)")
                flags = {k: z[f"{side}_{k}"].astype(bool) for k in ("measured", "guessed", "bridged")}
                for k, a in flags.items():
                    check(len(a) == len(rows), f"{sample.slug}: {side}_{k} length differs from its frame rows")
                full = {k: _scatter(self.frames, rows, a, False) for k, a in flags.items()}
                state = exclusive_state(full["measured"], full["guessed"], full["bridged"])
                j = z[f"{side}_joints"]
                check(j.shape == (len(rows), N_JOINTS, 3), f"{sample.slug}: {side}_joints has an unexpected shape")
                # rows whose joints are present (finite, not all zero) but carry no state flag
                has_joints = np.isfinite(j).all(axis=(1, 2)) & (np.abs(np.nan_to_num(j)).sum(axis=(1, 2)) > 0)
                stray = int((has_joints & (state[rows] == NONE)).sum())
                self.sides[side] = Side(rows, full["measured"], full["guessed"], full["bridged"], state, stray)
        finally:
            z.close()

    def state(self, side: str) -> np.ndarray:
        return self.sides[side].state

    def _read(self, key: str) -> np.ndarray:
        with np.load(self._path, allow_pickle=False) as z:
            return z[key]

    def joints(self, side: str) -> np.ndarray:
        """(frames, 21, 3) float32, NaN wherever the exclusive state is none.

        This is the only way joints leave this module: stateless joints are never published."""
        s = self.sides[side]
        j = self._read(f"{side}_joints").astype(np.float32)
        out = np.full((self.frames, N_JOINTS, 3), np.nan, np.float32)
        out[s.rows] = j
        out[s.state == NONE] = np.nan
        return out

    def per_frame(self, side: str, key: str, dtype, fill) -> np.ndarray:
        """A per-row array of the npz (view count, 2D-only flag, score) at full length."""
        s = self.sides[side]
        a = self._read(f"{side}_{key}").astype(dtype)
        return _scatter(self.frames, s.rows, a, fill)


# ------------------------------------------------------------ run-length ----

def runs(state: np.ndarray) -> list[list[int]]:
    """[[state, start, length], ...] covering [0, len(state)) exactly."""
    n = len(state)
    cuts = np.flatnonzero(np.diff(state)) + 1
    starts = np.concatenate([[0], cuts])
    ends = np.concatenate([cuts, [n]])
    return [[int(state[a]), int(a), int(b - a)] for a, b in zip(starts, ends)]


def strip(state: np.ndarray, bins: int = STRIP_BINS) -> str:
    """`bins` equal-width bins over the frames; each char is the state with the most
    frames in the bin (ties: measured, guessed, bridged, none)."""
    n = len(state)
    check(n >= bins, "strip: fewer frames than bins")
    rank = {s: i for i, s in enumerate(STRIP_ORDER)}
    chars = []
    for k in range(bins):
        a, b = (k * n) // bins, ((k + 1) * n) // bins
        counts = np.bincount(state[a:b], minlength=4)
        best = min(range(4), key=lambda s: (-int(counts[s]), rank[s]))
        chars.append(str(best))
    return "".join(chars)


def longest_run(mask: np.ndarray) -> tuple[int, int]:
    """(start, length) of the longest run of True (first one wins a tie)."""
    best = (0, 0)
    start = None
    for i in range(len(mask) + 1):
        v = bool(mask[i]) if i < len(mask) else False
        if v and start is None:
            start = i
        elif not v and start is not None:
            if i - start > best[1]:
                best = (start, i - start)
            start = None
    return best


# ------------------------------------------------------------- media checks -

def mp4_atoms(path: Path) -> list[str]:
    """Top-level box types of an mp4, in file order (to check that moov comes before mdat)."""
    import struct

    out = []
    size_total = Path(path).stat().st_size
    with open(path, "rb") as fh:
        pos = 0
        while pos < size_total:
            fh.seek(pos)
            head = fh.read(8)
            if len(head) < 8:
                break
            size, kind = struct.unpack(">I4s", head)
            if size == 1:
                size = struct.unpack(">Q", fh.read(8))[0]
            elif size == 0:
                size = size_total - pos
            out.append(kind.decode("latin-1"))
            if size < 8:
                break
            pos += size
    return out


def probe_mp4(path: Path) -> dict:
    """ffprobe facts about a published mp4 (frame count, size, keyframe spacing, streams, tags, atoms)."""
    import subprocess

    def run(*args):
        return subprocess.run(["ffprobe", "-v", "error", *args], capture_output=True, text=True, check=True).stdout

    j = json.loads(run("-count_frames", "-show_entries",
                       "stream=index,codec_type,codec_name,profile,pix_fmt,width,height,r_frame_rate,nb_read_frames:"
                       "stream_tags:format=format_name,duration,size:format_tags", "-of", "json", str(path)))
    v = [s for s in j["streams"] if s["codec_type"] == "video"]
    kf = run("-select_streams", "v:0", "-show_entries", "frame=key_frame", "-of", "csv=p=0", str(path)).split()
    keys = [i for i, k in enumerate(kf) if k.split(",")[0].strip() == "1"]
    gaps = [b - a for a, b in zip(keys, keys[1:])] + [len(kf) - keys[-1]] if keys else []
    atoms = mp4_atoms(path)
    return {
        "streams": len(j["streams"]),
        "audio": len(j["streams"]) - len(v),
        "codec": v[0]["codec_name"], "profile": v[0].get("profile"), "pix_fmt": v[0]["pix_fmt"],
        "width": v[0]["width"], "height": v[0]["height"], "fps": v[0]["r_frame_rate"],
        "frames": int(v[0]["nb_read_frames"]),
        "seconds": float(j["format"]["duration"]),
        "bytes": int(j["format"]["size"]),
        "max_keyframe_gap": max(gaps) if gaps else None,
        "first_frame_key": bool(keys and keys[0] == 0),
        "format_tags": sorted(j["format"].get("tags", {})),
        "stream_tags": sorted(v[0].get("tags", {})),
        "moov_before_mdat": atoms.index("moov") < atoms.index("mdat") if "moov" in atoms and "mdat" in atoms else False,
        "atoms": atoms,
    }
