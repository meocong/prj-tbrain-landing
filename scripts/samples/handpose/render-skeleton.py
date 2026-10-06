#!/usr/bin/env python3
"""Render every public skeleton media file of the hand-pose samples from hands.npz.

Reads the same curated tiers as the data build (curation.json) and writes, per tier:

  video   (13, 14)  public/samples/hand-pose/video/hand-pose-NN.mp4   full length, 540x540, 30 fps
                    public/samples/clips/hand-pose-NN.mp4             card loop, 640x480, seamless
                    public/samples/posters/hand-pose-NN.jpg           800x600
                    public/samples/hand-pose/stills/hand-pose-NN.jpg  720x720 (same frame)
  poster            posters/NN.jpg 800x600 and stills/NN.jpg 720x720 of the best frame
  lane              nothing at all

  plus, from one video-tier sample only (13):
                    public/samples/hand-pose/hero.jpg      1600x900, hands in the right half
                    public/samples/hand-pose/og.jpg        1200x630, hands centred-right
                    public/samples/hand-pose/hero-13.mp4   1280x720 ambient loop, same window as the card loop
                    public/samples/hand-pose/hero-13.jpg   1280x720 poster of that loop (its first frame)

and scripts/samples/handpose/render-plan.json (poster frames and loop windows) that
build-handpose-data.py copies into the metrics file.

Everything is drawn from the delivered joints on a dark ground: no camera pixels, no
mesh, no baked legend, no text except the L / R wrist glyphs. See hp_render.py.

Usage
  python3 render-skeleton.py                 render everything, then verify the media
  python3 render-skeleton.py --only 13       one sample (13 also rebuilds the hero set)
  python3 render-skeleton.py --check-palette colour-blind check of the left / right colours, and that they are drawn as is
  python3 render-skeleton.py --no-video      stills only (quick look while tuning)
  python3 render-skeleton.py --verify        re-check the media already on disk
"""

from __future__ import annotations

import argparse
import sys
import time

import cv2
import numpy as np

sys.dont_write_bytecode = True  # no __pycache__ in the scripts folder
import hp_common as C  # noqa: E402
import hp_render as R  # noqa: E402
from hp_common import check  # noqa: E402

SQ = 540                  # full-length video, 1:1
STILL = 720               # 1:1 still
POSTER = (800, 600)       # 4:3 poster
CARD = (640, 480)         # 4:3 card loop
HERO_IMG = (1600, 900)
HERO_REEL = (1280, 720)
OG = (1200, 630)
MARGIN = 0.03             # share of the shorter side kept free around the hands in a moving view
STILL_MARGIN = 0.08       # ... and around the hands of a still
HAND_SHARE = 0.40         # on a still the hands are at most this share of the frame height
LOOP_MIN, LOOP_CAP, XFADE = 60, 150, 15    # frames: minimum 2 s, at most 5 s, ~0.5 s dissolve
MIN_FRAMING = 96.0        # % of drawn frames with both hands fully inside the frame
PITCHES = (20, 30, 40, 50)  # candidate downward pitches of the virtual camera, degrees


def pad_box(W, H, m=MARGIN):
    k = m * min(W, H)
    return (k, k, W - k, H - k)


def calm_left(W, x0=0.50, x1=0.60):
    """Trail fade that keeps the left of a hero composition calm (headline text sits there)."""
    a, b = x0 * W, x1 * W

    def fade(x, y):
        t = min(max((x - a) / (b - a), 0.0), 1.0)
        return t * t * (3 - 2 * t)

    return fade


def plan_loop(view: R.View):
    """(start, frames, crossfade, kind): the longest run with both hands measured, else the longest
    with both measured-or-guessed; at least 2 s of looped video once the dissolve is taken out."""
    l, r = view.state["left"], view.state["right"]
    a, n = C.longest_run((l == C.MEASURED) & (r == C.MEASURED))
    kind = "both measured"
    if n < LOOP_MIN:
        a, n = C.longest_run(np.isin(l, (C.MEASURED, C.GUESSED)) & np.isin(r, (C.MEASURED, C.GUESSED)))
        kind = "both measured or guessed"
    check(n >= LOOP_MIN, f"{view.sample.slug}: no run of two seconds with both hands delivered")
    if n > LOOP_CAP:                     # keep a long run to a tidy length, taken from its middle
        a += (n - LOOP_CAP) // 2
        n = LOOP_CAP
    x = max(0, min(XFADE, n - LOOP_MIN))
    return a, n - x, x, kind


def choose_frame(sc, view, gbox, tight=None, also=(), within=None):
    """(frame, trail_need, score) with fallbacks: complete trails first, then none, then any frame with
    both hands drawn. `within` limits the choice to those frames (the loop window)."""
    both_drawn = np.flatnonzero((view.state["left"] != C.NONE) & (view.state["right"] != C.NONE))
    for trail_need, cand in ((10, view.both_measured), (0, view.both_measured), (0, both_drawn)):
        if within is not None:
            cand = np.intersect1d(cand, within)
        f, score = R.pick_frame(sc, cand, gbox, also=also, tight=tight, trail_need=trail_need, with_score=True)
        if f is not None:
            return f, trail_need, score
    raise C.DataError(f"{view.sample.slug}: no frame shows both hands inside the frame")


def clean_jpeg(path):
    """No EXIF, no comments: only the JFIF header and the image."""
    b = path.read_bytes()
    check(b"Exif" not in b[:4096] and b"\xff\xfe" not in b[:4096], f"{path.name}: unexpected metadata segment")


def save_still(path, sc, painter, frame, quality, fade=None):
    img = painter.frame(sc, frame, fade, still=True)
    R.write_jpeg(path, img, quality)
    clean_jpeg(path)
    return img


def render_poster_tier(smp, view):
    """A still of the best frame, framed on the pair of hands, at 800x600 and 720x720.

    The pitch is the one whose best frame reads best (hands large, open, apart, fingers uncrossed)."""
    gbox = pad_box(SQ, SQ)
    tb = pad_box(*POSTER, STILL_MARGIN)
    best = None
    for pitch in PITCHES:
        sc_sq, pct_sq = R.fit_scene(view, pitch, view.drawn, SQ, SQ, gbox)
        kmax = HAND_SHARE * POSTER[1] / sc_sq.cam.hand_px
        f, trail_need, score = choose_frame(sc_sq, view, gbox, tight=(tb, kmax))
        if best is None or score > best[0]:
            best = (score, pitch, f, trail_need, pct_sq)
    _, pitch, f, trail_need, pct_sq = best
    check(pct_sq >= MIN_FRAMING, f"{smp.slug}: framing {pct_sq:.1f}% is below {MIN_FRAMING}%")
    sp = R.fit_single(view, pitch, f, *POSTER, tb, HAND_SHARE * POSTER[1])
    ss = R.fit_single(view, pitch, f, STILL, STILL, pad_box(STILL, STILL, STILL_MARGIN), HAND_SHARE * STILL)
    save_still(C.media_file("poster", smp.slug), sp, R.Painter(*POSTER), f, 82)
    save_still(C.media_file("still", smp.slug), ss, R.Painter(STILL, STILL), f, 82)
    return {"posterFrame": int(f), "loop": None,
            "framing": {"still": 100.0, "poster": 100.0, "sample-wide": round(pct_sq, 1)},
            "note": "" if trail_need == 10 else "fallback frame"}


def render_video_tier(smp, view, pitch, sc_sq, pct_sq, args):
    """Full-length video (one fixed camera), seamless card loop, poster and still.

    The loop camera is fitted to the loop's own frames and also frames the card poster, so the
    poster and the loop match; the still is framed on its frame like the other stills."""
    a, L, X, kind = plan_loop(view)
    src = np.arange(a, a + L + X)
    cbox = pad_box(*CARD)
    sc_card, pct_card = R.fit_scene(view, pitch, src, *CARD, cbox)
    check(pct_card >= MIN_FRAMING, f"{smp.slug}: loop framing {pct_card:.1f}% is below {MIN_FRAMING}%")
    f, trail_need, _ = choose_frame(sc_card, view, cbox, within=src)
    sp = R.Scene(view, sc_card.cam.resized(*POSTER))
    ss = R.fit_single(view, pitch, f, STILL, STILL, pad_box(STILL, STILL, STILL_MARGIN), HAND_SHARE * STILL)
    save_still(C.media_file("poster", smp.slug), sp, R.Painter(*POSTER), f, 82)
    save_still(C.media_file("still", smp.slug), ss, R.Painter(STILL, STILL), f, 82)
    if not args.no_video:
        t = time.time()
        painter = R.Painter(SQ, SQ)
        with R.VideoWriter(C.media_file("video", smp.slug), SQ, SQ) as vw:
            for i in range(smp.frames):
                vw.write(painter.frame(sc_sq, i))
        painter = R.Painter(*CARD)
        with R.VideoWriter(C.media_file("loop", smp.slug), *CARD) as vw:
            for img in R.crossfade_loop(painter, sc_card, a, L, X):
                vw.write(img)
        print(f"  {smp.slug}: video and loop encoded in {time.time() - t:.0f}s", flush=True)
    return {"posterFrame": int(f), "loop": {"start": int(a), "frames": int(L), "crossfadeFrames": int(X)},
            "framing": {"video": round(pct_sq, 1), "loop": round(pct_card, 1), "poster": 100.0, "still": 100.0},
            "note": f"loop on the longest run with {kind}"}, (sc_card, a, L, X)


def render_hero(smp, view, pitch, loop, args):
    """Hero image, social image and ambient reel from the card loop's window, hands in the right half."""
    a, L, X = loop
    src = np.arange(a, a + L + X)
    W, H = HERO_REEL
    hbox = (0.575 * W, 0.08 * H, 0.965 * W, 0.92 * H)
    sc_reel, pct = R.fit_scene(view, pitch, src, W, H, hbox)
    # the reel starts on the hero frame (a pure frame of the loop, past the dissolve), so its poster is
    # exactly hero.jpg's composition and nothing jumps when playback starts
    f, _, _ = choose_frame(sc_reel, view, hbox, within=np.arange(a + X, a + L))
    phase = f - a
    fade = calm_left(W)
    sc_img = R.Scene(view, sc_reel.cam.resized(*HERO_IMG))
    save_still(C.HERO_FILES["hero"], sc_img, R.Painter(*HERO_IMG), f, 84, calm_left(HERO_IMG[0]))
    # social image: the same frame, framed on the pair of hands, centred right
    ow, oh = OG
    obox = (0.44 * ow, 0.10 * oh, 0.96 * ow, 0.90 * oh)
    so = R.fit_single(view, pitch, f, ow, oh, obox, 0.5 * oh)
    save_still(C.HERO_FILES["og"], so, R.Painter(ow, oh), f, 84, calm_left(ow, 0.42, 0.52))
    if not args.no_video:
        painter = R.Painter(W, H)
        first = None
        with R.VideoWriter(C.HERO_FILES["hero_loop"], W, H) as vw:
            for img in R.crossfade_loop(painter, sc_reel, a, L, X, fade, phase):
                if first is None:
                    first = img
                vw.write(img)
        R.write_jpeg(C.HERO_FILES["hero_poster"], first, 84)
        clean_jpeg(C.HERO_FILES["hero_poster"])
    # where the pair sits in the composition: left edge of everything drawn, and centre of the hands
    P = np.concatenate([sc_reel.P[side][f] for side in C.SIDES])
    return {"frame": int(f), "framing": round(pct, 1),
            "handsLeftEdgePct": round(100.0 * float(P[:, 0].min()) / W, 1),
            "handsCentreXPct": round(100.0 * float(P[:21, 0].mean() / 2 + P[22:43, 0].mean() / 2) / W, 1)}


# ------------------------------------------------------------- verification --

def verify_media(samples, quiet=False, only=None):
    """Facts for the report: every public media file on disk, probed (`only` = one sample number)."""
    rows = []
    for smp in samples:
        if only is not None and smp.n != only:
            continue
        files = {k: C.media_file(k, smp.slug) for k in ("poster", "still", "loop", "video")}
        if smp.preview == "lane":
            for k, p in files.items():
                check(not p.exists(), f"{smp.slug}: lane-only sample has a {k} file")
            continue
        wanted = ["poster", "still"] + (["loop", "video"] if smp.preview == "video" else [])
        for k in ("loop", "video"):
            if k not in wanted:
                check(not files[k].exists(), f"{smp.slug}: unexpected {k} file")
        for k in wanted:
            check(files[k].exists(), f"{smp.slug}: missing {k} file (run render-skeleton.py)")
            rows.append((smp.slug, k, files[k]))
    extra = [("hero", "hero", C.HERO_FILES["hero"]), ("og", "og", C.HERO_FILES["og"]),
             ("hero-13", "hero_loop", C.HERO_FILES["hero_loop"]), ("hero-13", "hero_poster", C.HERO_FILES["hero_poster"])]
    if only is None or only == C.HERO_SAMPLE:
        rows += [r for r in extra if r[2].exists()]
    expect = {"poster": POSTER, "still": (STILL, STILL), "loop": CARD, "video": (SQ, SQ), "hero": HERO_IMG, "og": OG,
              "hero_loop": HERO_REEL, "hero_poster": HERO_REEL}
    by_slug = {s.slug: s for s in samples}
    total = 0
    out = []
    for slug, kind, path in rows:
        size = path.stat().st_size
        total += size
        rel = path.relative_to(C.REPO).as_posix()
        if path.suffix == ".jpg":
            img = cv2.imread(str(path))
            check(img is not None and (img.shape[1], img.shape[0]) == expect[kind], f"{rel}: wrong size")
            clean_jpeg(path)
            out.append((rel, size, f"{img.shape[1]}x{img.shape[0]} jpeg, no metadata"))
        else:
            p = C.probe_mp4(path)
            check((p["width"], p["height"]) == expect[kind], f"{rel}: wrong size {p['width']}x{p['height']}")
            check(p["codec"] == "h264" and p["profile"] == "High" and p["pix_fmt"] == "yuv420p", f"{rel}: wrong codec")
            check(p["fps"] == "30/1", f"{rel}: not 30 fps")
            check(p["audio"] == 0 and p["streams"] == 1, f"{rel}: has more than one stream")
            check(p["moov_before_mdat"], f"{rel}: moov atom is not before mdat")
            check(p["max_keyframe_gap"] <= 30 and p["first_frame_key"], f"{rel}: keyframe interval above 30")
            stray_tags = [t for t in p["format_tags"] if t not in ("major_brand", "minor_version", "compatible_brands")]
            check(not stray_tags, f"{rel}: format metadata tags {stray_tags}")
            stray_tags = [t for t in p["stream_tags"] if t not in ("language", "handler_name", "vendor_id")]
            check(not stray_tags, f"{rel}: stream metadata tags {stray_tags}")
            if kind == "video":
                check(p["frames"] == by_slug[slug].frames, f"{rel}: {p['frames']} frames, expected {by_slug[slug].frames}")
            out.append((rel, size, f"{p['width']}x{p['height']} h264 High yuv420p {p['fps']} {p['frames']} frames "
                                   f"{p['seconds']:.2f}s, keyframe gap<={p['max_keyframe_gap']}, atoms {'>'.join(p['atoms'])}, "
                                   f"audio none, format tags none, stream tags {p['stream_tags'] or 'none'}"))
    if not quiet:
        for rel, size, note in out:
            print(f"  {rel}  {size:,} B  {note}")
        print(f"  total new public media: {total:,} B ({total / 1e6:.2f} MB)")
    return total


# -------------------------------------------------------------------- main --

def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("--check-palette", action="store_true", help="only check the left / right colours and exit")
    ap.add_argument("--only", type=int, metavar="NN", help="render one sample (13 also rebuilds the hero set)")
    ap.add_argument("--no-video", action="store_true", help="skip the mp4 encodes (stills only)")
    ap.add_argument("--verify", action="store_true", help="probe the media already on disk and exit")
    args = ap.parse_args()

    pal = R.check_palette()
    print("palette check (CIELAB deltaE76, left sky blue vs right orange; must be >= 40 for both):")
    print(f"  normal vision  {pal['normal']:.1f}")
    print(f"  deuteranopia   {pal['deuteranopia']:.1f}   (Machado 2009, severity 1.0)")
    print(f"  protanopia     {pal['protanopia']:.1f}   (Machado 2009, severity 1.0)")
    drawn = R.check_rendered_colours()
    print("rendered bones vs palette (median CIELAB deltaE76 over the finger bones; must be <= 3, so the legend colours are the drawn ones):")
    print(f"  left {drawn['left']:.1f}   right {drawn['right']:.1f}")
    if args.check_palette:
        return

    samples = C.load_samples()
    if args.verify:
        verify_media(samples, only=args.only)
        return

    todo = [s for s in samples if s.preview != "lane" and (args.only is None or s.n == args.only)]
    check(args.only is None or any(s.n == args.only for s in samples), f"--only {args.only}: no such sample")
    if args.only is not None and not todo:
        print(f"{C.slug_of(args.only)} is lane-only: no media")
    plan = C.load_json(C.RENDER_PLAN_JSON, "render-plan.json") if C.RENDER_PLAN_JSON.exists() else {"samples": {}, "hero": None}
    rows = []
    hero_loop = None
    for smp in todo:
        t = time.time()
        hands = C.Hands(smp)
        view = R.View(smp, hands)
        if smp.preview == "video":
            pitch = R.choose_pitch(view, pitches=PITCHES, margin=MARGIN)
            sc_sq, pct_sq = R.fit_scene(view, pitch, view.drawn, SQ, SQ, pad_box(SQ, SQ))
            check(pct_sq >= MIN_FRAMING, f"{smp.slug}: framing {pct_sq:.1f}% is below {MIN_FRAMING}%")
            entry, (sc_card, a, L, X) = render_video_tier(smp, view, pitch, sc_sq, pct_sq, args)
            if smp.n == C.HERO_SAMPLE:
                hero_loop = (view, pitch, (a, L, X))
        else:
            entry = render_poster_tier(smp, view)
        plan["samples"][smp.slug] = entry
        rows.append((smp, entry))
        print(f"{smp.slug}: {smp.preview} tier rendered in {time.time() - t:.1f}s", flush=True)
    if hero_loop is not None and (args.only is None or args.only == C.HERO_SAMPLE):
        view, pitch, loop = hero_loop
        plan["hero"] = render_hero(view.sample, view, pitch, loop, args)
        print(f"hero set rendered from {view.sample.slug}", flush=True)

    plan["samples"] = dict(sorted(plan["samples"].items()))
    C.dump_json(C.RENDER_PLAN_JSON, plan)

    print("\nframing: share of drawn frames with both hands fully inside the frame (rule: >= 96%)")
    print("  sample        tier    posterFrame  loop window (start+frames, xfade)  framing")
    for smp, entry in rows:
        loop = entry["loop"]
        lw = f"{loop['start']}+{loop['frames']}, {loop['crossfadeFrames']}" if loop else "-"
        fr = entry["framing"]
        shown = ", ".join(f"{k} {v:.1f}%" for k, v in fr.items())
        print(f"  {smp.slug}  {smp.preview:6}  {entry['posterFrame']:>11}  {lw:34}  {shown}")
    if plan.get("hero"):
        hero = plan["hero"]
        print(f"  hero set (from {C.slug_of(C.HERO_SAMPLE)}): frame {hero['frame']}, framing {hero['framing']:.1f}%, "
              f"hands start at {hero['handsLeftEdgePct']}% of the width, centred at {hero['handsCentreXPct']}%")
    if not args.no_video:
        print("\nmedia on disk:")
        verify_media(samples, only=args.only)


if __name__ == "__main__":
    try:
        main()
    except C.DataError as e:
        sys.exit(f"FAILED: {e}")
