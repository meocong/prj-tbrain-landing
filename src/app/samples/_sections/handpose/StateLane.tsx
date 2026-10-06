"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown, Link2 } from "lucide-react";
import {
  HAND_COLOR,
  HANDPOSE_PATH,
  HP_FPS,
  fmtCount,
  frameToSec,
  mmss,
  type Hand,
  type HandPoseLane,
} from "@/lib/samples/handpose";
import { track } from "@/lib/samples/track";
import { C } from "../tokens";
import { HandBadge } from "./glyphs";
import { Lane } from "./Lane";
import { RunTable } from "./RunTable";
import {
  LANE_ROW,
  LANE_ROW_HERO,
  clampFrame,
  frameMidTime,
  frameOfTime,
  stateWordAt,
  valueText,
} from "./viewer-frame";

/**
 * The state lane: the clip as two rows, one per hand, painted frame by frame,
 * with a playhead, a readout and the controls for moving it.
 *
 * It is ONE slider (the APG slider pattern, one thumb): the two rows are a
 * single control that picks a frame, because a frame is a moment in the clip
 * and both hands share it. Everything in it that is not the slider itself
 * (the rows, the badges, the playhead, the axis) is `aria-hidden`; what the
 * lane says is carried by `aria-valuetext`, by the readout under it, and by the
 * run table behind "View as table".
 *
 * Time, and why nothing here re-renders while the video plays
 * ──────────────────────────────────────────────────────────
 * A frame changes 30 times a second. React state at that rate would re-render
 * the lane, the readout and the table disclosure for nothing, so the playhead,
 * the readout and the slider's value are written straight to their nodes — the
 * `LiveTelemetry` pattern. React renders the lane once; `paint` does the rest.
 *
 * The video is the clock when there is one. While it plays, the loop reads it:
 * `requestVideoFrameCallback` where the browser has it (it fires once per frame
 * actually shown, with the frame's own timestamp, so the playhead cannot be a
 * frame ahead of the picture), a rAF loop otherwise. Seeking goes the other way:
 * a click, a drag or a key paints the playhead at once and then moves the video,
 * so the lane never waits on the decoder. Without a video the slider simply moves
 * the frame.
 */

const HANDS: Hand[] = ["left", "right"];
const QUARTERS = [0, 0.25, 0.5, 0.75, 1] as const;

/**
 * Screen readers speak a focused slider's value each time it changes. While the
 * video plays that is thirty times a second, so the value attributes are
 * refreshed at most this often during playback; any seek, pause or key press
 * writes them immediately.
 */
const ARIA_QUIET_MS = 1000;

const put = (el: HTMLElement | null, value: string) => {
  if (el && el.textContent !== value) el.textContent = value;
};

function Key({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <kbd
      className="rounded border px-1.5 font-mono text-[9px] leading-[1.6]"
      style={{ borderColor: C.rule, color: C.textMid }}
    >
      <span aria-hidden={label ? true : undefined}>{children}</span>
      {label && <span className="sr-only">{label}</span>}
    </kbd>
  );
}

/* The spaces collapse inside a flex item, so they cost no width; they are there
   so the readout copies and reads as "… 2,239 · time 40.5 s · Left: …". */
const Dot = () => (
  <span aria-hidden style={{ color: C.textDim }}>
    {" · "}
  </span>
);

export function StateLane({
  slug,
  title,
  lane,
  video,
  initialFrame,
  hero = false,
}: {
  slug: string;
  title: string;
  lane: HandPoseLane;
  /** The viewer's video. The lane follows it, and moves it when the reader seeks. */
  video: HTMLVideoElement | null;
  /** Frame to start on: `?f=` in the link, or the one `openRecord` was given. */
  initialFrame: number | null;
  hero?: boolean;
}) {
  const frames = lane.frames;
  const rowH = hero ? LANE_ROW_HERO : LANE_ROW;
  const headingId = useId();
  const hintId = useId();
  const tableId = useId();

  const sliderEl = useRef<HTMLDivElement>(null);
  const trackEl = useRef<HTMLDivElement>(null);
  const headEl = useRef<HTMLSpanElement>(null);
  const frameOut = useRef<HTMLSpanElement>(null);
  const timeOut = useRef<HTMLSpanElement>(null);
  const leftOut = useRef<HTMLSpanElement>(null);
  const rightOut = useRef<HTMLSpanElement>(null);

  /* The frame on show. Keys step from THIS and not from the video's clock: a
     held arrow outruns the decoder, and stepping from a position the video has
     not reached yet would turn every press after the first into a no-op. */
  const shown = useRef(-1);
  const words = useRef({ left: "", right: "" });
  const ariaFrame = useRef(-1);
  const ariaAt = useRef(0);
  const dragging = useRef(false);
  const sought = useRef(false);
  const copyTimer = useRef(0);

  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  /**
   * Show frame `frame`: playhead, readout, and the slider's value. `quiet` is
   * for the playback loop, which writes the slider's value at most once a second.
   */
  const paint = useCallback(
    (frame: number, quiet = false) => {
      const f = clampFrame(frame, frames);
      if (f !== shown.current) {
        shown.current = f;
        const left = stateWordAt(lane.left, f);
        const right = stateWordAt(lane.right, f);
        words.current = { left, right };
        if (headEl.current) headEl.current.style.left = `${((f + 0.5) / frames) * 100}%`;
        put(frameOut.current, fmtCount(f));
        put(timeOut.current, frameToSec(f).toFixed(1));
        put(leftOut.current, left);
        put(rightOut.current, right);
      }
      const now = performance.now();
      if (ariaFrame.current !== f && (!quiet || now - ariaAt.current >= ARIA_QUIET_MS) && sliderEl.current) {
        ariaFrame.current = f;
        ariaAt.current = now;
        const el = sliderEl.current;
        el.setAttribute("aria-valuenow", String(f));
        el.setAttribute(
          "aria-valuetext",
          valueText(f, frames, frameToSec(f).toFixed(1), words.current.left, words.current.right),
        );
      }
    },
    [frames, lane],
  );

  /** A seek by the reader: paint first, then move the video to the middle of the frame. */
  const seekTo = useCallback(
    (frame: number) => {
      const f = clampFrame(frame, frames);
      paint(f);
      if (video) video.currentTime = frameMidTime(f);
      // Once per open: the funnel wants to know the lane was used, not how often.
      if (!sought.current) {
        sought.current = true;
        track("handpose_lane_seek", { slug });
      }
    },
    [frames, paint, video, slug],
  );

  /* First paint, before the browser's: the readout never shows its empty
     markup, and the slider is never without a value. */
  useLayoutEffect(() => {
    paint(initialFrame ?? 0);
  }, [paint, initialFrame]);

  /* The video drives the lane while it plays, and the lane follows it when the
     reader uses the player's own controls. */
  useEffect(() => {
    if (!video) return;
    const hasVfc = "requestVideoFrameCallback" in video;
    let vfc = 0;
    let raf = 0;
    const sync = () => {
      if (!dragging.current) paint(frameOfTime(video.currentTime, frames));
    };
    const onFrame = (_now: number, meta: VideoFrameCallbackMetadata) => {
      // `mediaTime` is the shown frame's own timestamp: a frame's start, so round.
      if (!dragging.current) paint(clampFrame(Math.round(meta.mediaTime * HP_FPS), frames), true);
      vfc = video.requestVideoFrameCallback(onFrame);
    };
    const loop = () => {
      if (!dragging.current) paint(frameOfTime(video.currentTime, frames), true);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (hasVfc) {
        if (!vfc) vfc = video.requestVideoFrameCallback(onFrame);
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (vfc) video.cancelVideoFrameCallback(vfc);
      if (raf) cancelAnimationFrame(raf);
      vfc = 0;
      raf = 0;
      sync();
    };

    const synced = ["seeking", "seeked", "loadedmetadata"] as const;
    video.addEventListener("play", start);
    video.addEventListener("pause", stop);
    video.addEventListener("ended", stop);
    for (const ev of synced) video.addEventListener(ev, sync);

    // Before metadata the clock reads 0 whatever was asked for, and would drag
    // the playhead off a `?f=` start the viewer is about to seek to.
    if (video.readyState > 0) sync();
    if (!video.paused) start();

    return () => {
      if (vfc) video.cancelVideoFrameCallback(vfc);
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener("play", start);
      video.removeEventListener("pause", stop);
      video.removeEventListener("ended", stop);
      for (const ev of synced) video.removeEventListener(ev, sync);
    };
  }, [video, frames, paint]);

  useEffect(() => () => window.clearTimeout(copyTimer.current), []);

  /* The table opens under everything else in the pane, which on a laptop is
     below the fold: a click that changes nothing the reader can see reads as a
     dead button. `nearest` moves the pane only as far as the table needs, and is
     instant, so it is no motion to switch off. */
  const tableWrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) tableWrap.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  /* ── Keyboard ───────────────────────────────────────────────────────────
     APG slider keys, with a second's step instead of a unit: a frame is 33 ms,
     and nobody scans a minute of footage at that grain. Only keys the slider
     handles are claimed, so ↑ and ↓ still scroll the pane. Alt+← and Alt+→ are
     the browser's Back and Forward and are never bound. */
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const at = shown.current;
    let next: number;
    switch (e.key) {
      case "ArrowRight":
        next = at + (e.shiftKey ? 1 : HP_FPS);
        break;
      case "ArrowLeft":
        next = at - (e.shiftKey ? 1 : HP_FPS);
        break;
      case "PageUp":
        next = at + 10 * HP_FPS;
        break;
      case "PageDown":
        next = at - 10 * HP_FPS;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = frames - 1;
        break;
      case " ":
        // Only where there is something to play; otherwise Space keeps scrolling.
        if (!video) return;
        e.preventDefault();
        if (!e.repeat) {
          if (video.paused) video.play().catch(() => undefined);
          else video.pause();
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    seekTo(next);
  };

  /* ── Pointer ────────────────────────────────────────────────────────────
     Click or drag to seek. The pointer is captured on press so the drag keeps
     going when it leaves the lane, and `stopPropagation` keeps the press from
     reaching the dialog's backdrop, which closes on a click.

     A mouse or pen seeks the moment it presses. A finger waits: on a phone the
     lane sits inside a column the reader scrolls with that same finger, and a
     press that is the start of a swipe must not jump the playhead to wherever it
     landed. It seeks on a tap, or once it has moved sideways — `touch-action:
     pan-y` hands vertical movement to the browser, which then cancels the press. */
  const press = useRef<{ x: number; y: number } | null>(null);
  const frameAt = (clientX: number) => {
    const box = trackEl.current?.getBoundingClientRect();
    if (!box || box.width <= 0) return shown.current;
    return clampFrame(Math.floor(((clientX - box.left) / box.width) * frames), frames);
  };
  const beginDrag = (e: PointerEvent<HTMLDivElement>) => {
    press.current = null;
    dragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // A pointer the browser has already let go of. The press still seeks; it
      // just cannot be dragged.
    }
    seekTo(frameAt(e.clientX));
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.stopPropagation();
    if (e.pointerType === "touch") press.current = { x: e.clientX, y: e.clientY };
    else beginDrag(e);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) {
      const from = press.current;
      const dx = from ? Math.abs(e.clientX - from.x) : 0;
      if (from && dx > 8 && dx > Math.abs(e.clientY - from.y)) beginDrag(e);
      return;
    }
    e.stopPropagation();
    const f = frameAt(e.clientX);
    if (f !== shown.current) seekTo(f);
  };
  const onPointerEnd = (e: PointerEvent<HTMLDivElement>) => {
    // A finger that went down and came up without going anywhere is a tap.
    if (press.current && e.type === "pointerup") seekTo(frameAt(e.clientX));
    press.current = null;
    if (!dragging.current) return;
    dragging.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}${HANDPOSE_PATH}?record=${encodeURIComponent(slug)}&f=${shown.current}`;
    let ok = true;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Blocked on insecure origins and in some embeds. Said, not swallowed:
      // a button that silently did nothing reads as broken.
      ok = false;
    }
    setCopied(ok ? "done" : "failed");
    window.clearTimeout(copyTimer.current);
    copyTimer.current = window.setTimeout(() => setCopied("idle"), 2200);
  };

  const rows = useMemo(
    () => HANDS.map((hand) => <Lane key={hand} hand={hand} runs={lane[hand]} frames={frames} height={rowH} />),
    [lane, frames, rowH],
  );

  return (
    <section aria-labelledby={headingId}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <h3 id={headingId} className="bp-mono text-[10px]" style={{ color: C.textDim }}>
          State lane
        </h3>
        <p className="bp-mono ml-auto text-[10px]" style={{ color: C.textDim }}>
          click or drag to seek
        </p>
        {/* Beside the instruction, not under the readout: the line under the
            lane is already as long as the pane is wide. Copies the frame on
            show, so a link can point a colleague at exactly this moment. On a
            phone it wraps to a line of its own. */}
        <button
          type="button"
          onClick={copyLink}
          className="bp-mono -my-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] transition-colors"
          style={{
            border: `1px solid ${C.hairline}`,
            color: copied === "done" ? C.accent : copied === "failed" ? C.danger : C.textMid,
          }}
        >
          {copied === "done" ? <Check aria-hidden className="h-3 w-3" /> : <Link2 aria-hidden className="h-3 w-3" />}
          {copied === "done" ? "Link copied" : copied === "failed" ? "Could not copy" : "Copy link to this frame"}
        </button>
        <span role="status" className="sr-only">
          {copied === "done" ? "Link to this frame copied" : copied === "failed" ? "Could not copy the link" : ""}
        </span>
      </div>

      <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2.5">
        {/* Same padding and gap as the slider's own, so each badge sits on its row. */}
        <div aria-hidden className="flex flex-col gap-1.5 py-1.5">
          {HANDS.map((hand) => (
            <span key={hand} className="flex items-center" style={{ height: rowH }}>
              <HandBadge hand={hand} size={20} />
            </span>
          ))}
        </div>

        {/* The padding is hit area: the two rows alone are 50px tall, but a
            finger lands wider than the paint, and 44px is the floor on a phone. */}
        <div
          ref={sliderEl}
          role="slider"
          tabIndex={0}
          aria-label="Seek by frame"
          aria-valuemin={0}
          aria-valuemax={frames - 1}
          aria-valuenow={clampFrame(initialFrame ?? 0, frames)}
          aria-describedby={hintId}
          className="relative cursor-pointer touch-pan-y select-none py-1.5"
          // The site's ring is a half-opaque violet, 1.7:1 on the dark base.
          // This is the control a keyboard reader came for.
          style={{ outlineColor: C.accent }}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onLostPointerCapture={onPointerEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nothing inside takes the pointer, so the slider itself is always
              the target. A touch is captured implicitly by whatever is under it;
              were that a row of the lane, our own capture on the slider would
              fire `lostpointercapture` from the row, bubble to this slider's
              handler, and end the drag it had just begun. */}
          <div ref={trackEl} className="pointer-events-none relative flex flex-col gap-1.5">
            {rows}
            {/* Light line, dark halo: it has to read over a solid fill in either
                hand's hue and over the bare track between. Drawn with borders,
                not backgrounds: a forced-colours theme (Windows High Contrast)
                replaces backgrounds with the page colour, which would erase the
                one mark that says where you are, and keeps borders. */}
            <span
              ref={headEl}
              aria-hidden
              className="pointer-events-none absolute -bottom-1 -top-1 z-10 w-0 -translate-x-1/2 border-x"
              style={{ left: 0, borderColor: C.text, boxShadow: `0 0 0 1px ${C.base}` }}
            >
              <span
                className="absolute -left-1 -top-[3px] h-0 w-0 rounded-full border-4"
                style={{ borderColor: C.text, boxShadow: `0 0 0 1px ${C.base}` }}
              />
            </span>
          </div>
        </div>

        <div aria-hidden className="relative col-start-2 mt-0.5 h-[22px]">
          {QUARTERS.map((q) => (
            <span
              key={q}
              className="absolute top-0 flex flex-col font-mono text-[10px] leading-[1.4] tabular-nums"
              style={{
                left: `${q * 100}%`,
                transform: q === 0 ? undefined : q === 1 ? "translateX(-100%)" : "translateX(-50%)",
                alignItems: q === 0 ? "flex-start" : q === 1 ? "flex-end" : "center",
                color: C.textDim,
              }}
            >
              <span className="mb-0.5 h-1 w-px" style={{ background: C.rule }} />
              {mmss(frameToSec(frames * q))}
            </span>
          ))}
        </div>
      </div>

      {/* The readout. Plain text, not a live region: it changes thirty times a
          second while the video plays, and the slider's own value is what a
          screen reader follows. The figures that change have fixed widths, so
          the line neither shuffles as a hand goes from "measured" to "no 3D
          pose" nor wraps differently at frame 999 and 1,000 — a reflow while the
          video plays would move everything under it. The way to the same facts
          as text sits at its end, where the reader is looking. */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
        <p
          className="flex flex-wrap items-baseline gap-x-1 gap-y-1 font-mono text-[11px] tabular-nums"
          style={{ color: C.value }}
        >
          <span>
            <span style={{ color: C.textDim }}>frame</span>{" "}
            <span ref={frameOut} className="inline-block text-right" style={{ minWidth: `${fmtCount(frames).length}ch` }} /> /{" "}
            {fmtCount(frames)}
          </span>
          <Dot />
          <span>
            <span style={{ color: C.textDim }}>time</span> <span ref={timeOut} className="inline-block min-w-[4ch] text-right" /> s
          </span>
          <Dot />
          <span>
            <span style={{ color: HAND_COLOR.left }}>Left</span>: <span ref={leftOut} className="inline-block min-w-[10ch]" />
          </span>
          <Dot />
          <span>
            <span style={{ color: HAND_COLOR.right }}>Right</span>: <span ref={rightOut} className="inline-block min-w-[10ch]" />
          </span>
        </p>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={tableId}
          onClick={() => setOpen((v) => !v)}
          className="bp-mono -my-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] underline decoration-1 underline-offset-4"
          style={{ color: C.textMid, textDecorationColor: C.rule }}
        >
          View as table
          <ChevronDown aria-hidden className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* The keys. A keyboard reader's concern, so hidden below `lg`, where
          there is no keyboard; still the slider's description for a screen
          reader. */}
      <ul id={hintId} className="mt-2 hidden flex-wrap gap-x-3.5 gap-y-1.5 text-[10px] lg:flex" style={{ color: C.textDim }}>
        {video && (
          <li className="inline-flex items-center gap-1.5">
            <Key>Space</Key> play or pause
          </li>
        )}
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex gap-0.5">
            <Key label="Left arrow">←</Key>
            <Key label="Right arrow">→</Key>
          </span>
          1 s
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5">
            <Key>Shift</Key>+<Key label="Left arrow">←</Key>
            <Key label="Right arrow">→</Key>
          </span>
          1 frame
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex gap-0.5">
            <Key>PageUp</Key>
            <Key>PageDown</Key>
          </span>
          10 s
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="inline-flex gap-0.5">
            <Key>Home</Key>
            <Key>End</Key>
          </span>
          start, end
        </li>
      </ul>

      <div ref={tableWrap} id={tableId} hidden={!open}>
        {open && <RunTable title={title} lane={lane} />}
      </div>
    </section>
  );
}
