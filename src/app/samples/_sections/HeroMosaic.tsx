"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { EASE } from "./tokens";

/** Counted, not written down: a hardcoded number goes stale the next merge. */
const CATALOGUE_SIZE = (samples as unknown[]).length;

/** Columns rendered. The last two are hidden below `lg`, the fourth below `sm`. */
const COLS = 6;
/** Tiles per column. Tall enough to overfill the rotated wall at 1440x900. */
const ROWS = 5;

/**
 * How many tiles hold a playing video at any moment, expressed as a modulus:
 * one tile in `LIVE_EVERY` is live. Thirty tiles at 4 gives seven or eight
 * concurrent decodes, which a laptop handles; thirty would not.
 */
const LIVE_EVERY = 4;
/** How long before the live tiles move on to the next set. */
const ROTATE_MS = 5200;

/** Per-column drift: seconds for one pass, and pixels travelled. */
const DRIFT = [
  { dur: 26, dist: -150 },
  { dur: 34, dist: 130 },
  { dur: 22, dist: -110 },
  { dur: 30, dist: 165 },
  { dur: 38, dist: -135 },
  { dur: 24, dist: 120 },
];

/**
 * The hero background: a drifting wall of capture fragments.
 *
 * One clip in the corner said "we have footage". A wall says "we have a
 * catalogue", which is the claim the page is here to make — and it makes it
 * before a word is read.
 *
 * Two things keep it affordable. The wall is posters, not video: every tile
 * paints a still, and only one tile in `LIVE_EVERY` carries a `<video>` on top
 * of its own poster, with the live set rotating so the whole wall appears to
 * play over about fifteen seconds. And the drift is an oscillation, not a
 * seamless marquee — at 22 to 38 seconds a pass nobody sees it turn around, and
 * it saves duplicating every tile to make the loop meet.
 *
 * The wall is rotated and overscaled so the column ends never enter frame and
 * the fragments run diagonally rather than reading as a spreadsheet.
 */
export function HeroMosaic({
  slugs,
  children,
}: {
  slugs: string[];
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const cols = useVisibleCols();
  const [phase, setPhase] = useState(0);
  const [awake, setAwake] = useState(true);

  // A hidden tab throttles requestAnimationFrame but keeps firing timers, so an
  // unguarded rotation swaps videos in against animations that never progress.
  // Nobody is watching a background tab, and eight paused decodes are free.
  useEffect(() => {
    const sync = () => setAwake(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  useEffect(() => {
    if (reduce || !awake || slugs.length === 0) return;
    const id = setInterval(() => setPhase((p) => (p + 1) % LIVE_EVERY), ROTATE_MS);
    return () => clearInterval(id);
  }, [reduce, awake, slugs.length]);

  // A tile's slug is chosen from its position in the live rotation, not from
  // its position on the wall. Splitting the index into `which rotation step`
  // and `how far into that step` and using the step as the high digit means
  // every tile that lights up together holds a different clip — a plain stride
  // put the same footage in three of the eight live tiles, because the stride
  // and the tile count shared a factor.
  const grid = useMemo(
    () =>
      Array.from({ length: COLS }, (_, c) =>
        Array.from({ length: ROWS }, (_, r) => {
          const i = c * ROWS + r;
          const step = i % LIVE_EVERY;
          const seat = Math.floor(i / LIVE_EVERY);
          const seats = Math.ceil((COLS * ROWS) / LIVE_EVERY);
          return slugs[(step * seats + seat) % slugs.length];
        }),
      ),
    [slugs],
  );

  if (slugs.length === 0) return null;

  return (
    // Exactly one viewport tall, with no upper cap. A `max-h` here silently
    // undoes `h-svh` on any screen taller than the cap: the wall stops early and
    // the catalogue's white background shows below it, which reads as an
    // unfinished gap rather than as a deliberate end to the hero.
    <div className="relative isolate flex h-svh min-h-[620px] w-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute -inset-[28%] -z-10"
        style={{ transform: "rotate(-9deg)" }}
      >
        <div className="flex h-full w-full gap-2 sm:gap-2.5">
          {grid.slice(0, cols).map((col, c) => (
            <motion.div
              key={c}
              className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5"
              animate={reduce || !awake ? undefined : { y: [0, DRIFT[c].dist, 0] }}
              transition={{
                duration: DRIFT[c].dur,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {col.map((slug, r) => (
                <Tile
                  key={`${c}-${r}`}
                  slug={slug}
                  live={!reduce && awake && (c * ROWS + r) % LIVE_EVERY === phase}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Three scrims, each doing one job: hold the headline on the left, weigh
          the foot of the frame, and keep the transparent header legible across
          the top. Without the third the nav sits on raw footage. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            "linear-gradient(90deg, rgba(6,8,14,0.94) 0%, rgba(6,8,14,0.82) 34%, rgba(6,8,14,0.52) 66%, rgba(6,8,14,0.62) 100%)",
            "linear-gradient(0deg, rgba(6,8,14,0.86) 0%, rgba(6,8,14,0.10) 46%)",
            "linear-gradient(180deg, rgba(6,8,14,0.78) 0%, rgba(6,8,14,0) 22%)",
          ].join(", "),
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col justify-center px-5 pb-10 pt-28 sm:px-8 lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] xl:px-[max(4rem,calc((100vw-1400px)/2+4rem))]">
        {children}
      </div>

      <ScrollCue />
    </div>
  );
}

/**
 * The one thing a full-bleed hero costs: nothing on screen says the page
 * continues. A viewport of footage with no bottom edge reads as the whole
 * page, so this marks the fold and says what is past it.
 *
 * It hides itself as soon as the reader scrolls — once they are moving, a
 * "scroll down" prompt is noise, and it would otherwise sit over the catalogue.
 */
function ScrollCue() {
  const reduce = useReducedMotion();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Same scroll the "Browse samples" button performs, for the same reason: a
  // bare `#deck` href appends rather than replaces the fragment once the page
  // already carries one, and the click then does nothing.
  const toDeck = () => {
    const deck = document.getElementById("deck");
    if (!deck) return;
    deck.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#deck");
  };

  return (
    <AnimatePresence>
      {!past && (
        <motion.button
          type="button"
          onClick={toDeck}
          aria-label="Scroll to the catalogue"
          className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 1.1, ease: EASE }}
        >
          <span
            className="font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "rgba(255,255,255,0.66)" }}
          >
            All {CATALOGUE_SIZE} samples below
          </span>
          <motion.span
            className="flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm"
            style={{
              border: "1px solid rgba(255,255,255,0.28)",
              background: "rgba(6,8,14,0.42)",
              color: "rgba(255,255,255,0.9)",
            }}
            animate={reduce ? undefined : { y: [0, 7, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * Columns actually rendered at this width.
 *
 * Hiding the surplus columns with `hidden lg:flex` would still mount them, and
 * a mounted tile that wins the live rotation decodes a video behind a
 * `display: none` — on a phone that was five of the eight live tiles spent on
 * columns nobody can see. Rendering fewer columns spends nothing.
 *
 * Starts at the full count so the server and the first client render agree; a
 * narrow viewport corrects on mount, before any poster has decoded.
 */
function useVisibleCols() {
  const [n, setN] = useState(COLS);

  useEffect(() => {
    const sm = window.matchMedia("(min-width: 640px)");
    const lg = window.matchMedia("(min-width: 1024px)");
    const sync = () => setN(lg.matches ? COLS : sm.matches ? 4 : 3);
    sync();
    sm.addEventListener("change", sync);
    lg.addEventListener("change", sync);
    return () => {
      sm.removeEventListener("change", sync);
      lg.removeEventListener("change", sync);
    };
  }, []);

  return n;
}

/**
 * One fragment. The poster is always painted; the video fades in over it when
 * the tile is live and unmounts when it is not, so a tile never shows a black
 * box while a decode warms up.
 */
function Tile({ slug, live }: { slug: string; live: boolean }) {
  return (
    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#0b0d13]">
      {/* Plain <img>: twenty fixed 640x480 posters already served from /public,
          so the optimizer has nothing to add and next/image would want a layout
          box per breakpoint for a decorative tile. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/samples/posters/${slug}.jpg`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
      />
      <AnimatePresence>
        {live && (
          // The animated node wraps the <video> rather than being it: framer
          // drives a div reliably, and the media inside only has to fill it.
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // Exit is faster than enter: both sets are decoding while the two
            // overlap, so the shorter that window the fewer concurrent decodes.
            exit={{ opacity: 0, transition: { duration: 0.45 } }}
            transition={{ duration: 0.8 }}
          >
            <video
              className="h-full w-full object-cover"
              src={`/samples/clips/${slug}.mp4`}
              autoPlay
              muted
              loop
              playsInline
              preload="none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
