"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { clipSrc, posterSrc } from "@/lib/samples/categories";
import { HeroWash } from "./HeroWash";

/**
 * The category hero background: one clip at a time, running into the next.
 *
 * `/samples` opens on `HeroMosaic`, a drifting wall of thirty tiles, and that
 * is the right argument for the front door — a wall says "catalogue" before a
 * word is read. A category page is making a narrower claim, about one kind of
 * capture, and a wall of thirty thumbnails is the wrong shape for it: nothing
 * is legible at tile size, so it says "lots" where the page needs to say
 * "this".
 *
 * So: full frame, one record, then the next.
 *
 * Two video elements, not one. A single element re-pointed at a new `src` shows
 * whatever the decoder has — usually a black frame — for as long as the next
 * clip takes to open, which on a hero is a flash of nothing every few seconds.
 * The pair lets the incoming clip be loaded and playing before it is faded up,
 * so the seam is a crossfade rather than a gap.
 *
 * Each record gets `SEGMENT_MS` rather than its full length. These are two to
 * four minute deliveries; a hero that played one to the end would show a single
 * workshop for four minutes and never make the range argument at all.
 *
 * And it starts each clip a little way in. Frame zero of a head-mounted capture
 * is often the operator still settling the rig, which is the least
 * representative second in the file.
 */

/** How long each record holds the frame. */
const SEGMENT_MS = 6200;
/** Crossfade between records. Long enough to read as a dissolve, not a cut. */
const FADE_MS = 900;
/** Fraction into the clip to start, skipping the rig settling at the head. */
const START_AT = 0.12;

export interface ReelItem {
  slug: string;
  /** The record's own title, for the caption. */
  title: string;
}

export function HeroReel({
  items,
  heightClass = "h-[76svh] min-h-[600px]",
  children,
}: {
  items: ReelItem[];
  heightClass?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  /** Which of the two elements is currently shown. */
  const [front, setFront] = useState(0);
  const a = useRef<HTMLVideoElement | null>(null);
  const b = useRef<HTMLVideoElement | null>(null);

  const n = items.length;

  useEffect(() => {
    if (reduce || n < 2) return;

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      // The element about to come forward is the one that is NOT in front; its
      // `src` was set on the previous tick, so it has had a full segment to
      // load rather than being asked to appear instantly.
      const incoming = front === 0 ? b.current : a.current;
      if (incoming) {
        const d = incoming.duration;
        if (Number.isFinite(d) && d > 0) incoming.currentTime = d * START_AT;
        incoming.play().catch(() => {});
      }
      setFront((f) => (f === 0 ? 1 : 0));
      setI((x) => (x + 1) % n);
    };

    timer = setTimeout(tick, SEGMENT_MS);
    return () => clearTimeout(timer);
  }, [i, front, reduce, n]);

  // A hidden tab keeps timers running while the decoder is throttled, so the
  // reel would advance through records nobody is watching and come back
  // mid-fade. Same guard HeroMosaic uses.
  useEffect(() => {
    const onVis = () => {
      const els = [a.current, b.current];
      if (document.hidden) els.forEach((e) => e?.pause());
      else els[front]?.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [front]);

  if (n === 0) return null;

  /* The element in front carries record `i`; the other is already pointed at
     `i + 1` so it can load during this segment. */
  const itemFor = (which: number) => items[(which === front ? i : (i + 1) % n) % n];

  return (
    <div className={`relative isolate flex w-full flex-col overflow-hidden ${heightClass}`}>
      {[0, 1].map((which) => {
        const { slug } = itemFor(which);
        return (
          <video
            key={which}
            ref={which === 0 ? a : b}
            src={clipSrc(slug)}
            poster={posterSrc(slug)}
            muted
            playsInline
            preload="auto"
            autoPlay={which === 0 && !reduce}
            aria-hidden
            className="absolute inset-0 -z-10 h-full w-full object-cover"
            style={{
              opacity: which === front ? 1 : 0,
              transition: `opacity ${FADE_MS}ms ease-in-out`,
            }}
          />
        );
      })}

      {/* Three scrims, the same three HeroMosaic uses and for the same reasons:
          hold the headline on the left, weigh the foot so the figures read, and
          keep the transparent header legible across the top. A single clip is
          a harder backdrop than a mosaic — one bright kitchen fills the whole
          frame where the wall averaged out — so the left stop is heavier. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            "linear-gradient(90deg, rgba(6,8,14,0.95) 0%, rgba(6,8,14,0.88) 38%, rgba(6,8,14,0.58) 72%, rgba(6,8,14,0.66) 100%)",
            "linear-gradient(0deg, rgba(6,8,14,0.88) 0%, rgba(6,8,14,0.12) 48%)",
            "linear-gradient(180deg, rgba(6,8,14,0.80) 0%, rgba(6,8,14,0) 22%)",
          ].join(", "),
        }}
      />

      {/* Over the scrims, not under: they exist to darken footage, and a wash
          laid before them is just more for them to darken. Same call as
          HeroMosaic — see HeroWash. */}
      <HeroWash className="-z-10" />

      <div className="flex min-h-0 flex-1 flex-col justify-center px-5 pb-10 pt-28 sm:px-8 lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] xl:px-[max(4rem,calc((100vw-1400px)/2+4rem))]">
        {children}
      </div>

      {/* Which record is on screen. The reel is real delivery footage and
          saying so costs one line; without it a reader has no way to know the
          backdrop is not stock.

          The record's own title, not its slug. `HAIRCUT-NECKLINE` is a filename
          and reads as one; "Trim the neckline of a customer's haircut" is what
          the operator was actually doing, which is the whole argument. */}
      <div
        className="pointer-events-none absolute bottom-4 right-5 max-w-[min(60vw,28rem)] truncate text-right font-mono text-[10px] tracking-[0.08em] sm:right-8"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {items[i].title} · {i + 1}/{n}
      </div>
    </div>
  );
}
