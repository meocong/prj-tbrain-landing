"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HeroWash } from "./HeroWash";

/** Columns rendered. The last two are hidden below `lg`, the fourth below `sm`. */
const COLS = 6;
/** Tiles per column. Tall enough to overfill the rotated wall at 1440x900. */
const ROWS = 5;

/**
 * How many tiles hold a playing video at any moment, expressed as a modulus:
 * one tile in `LIVE_EVERY` is live.
 *
 * Was 4, giving eight concurrent decodes. Eight decodes is survivable; eight
 * SIMULTANEOUS downloads of a ~1 MB clip on first paint is not, and that is
 * what it actually meant — the tiles all light up together.
 */
const LIVE_EVERY = 8;

/**
 * How many DISTINCT clips the live layer is allowed to draw on.
 *
 * This is the number that was missing, and it is why the hero cost 30 MB. Every
 * tile held its own slug, and the rotation walked the whole wall, so a visitor
 * who watched the hero for twenty seconds downloaded all thirty clips — the
 * entire preview library, to decorate one screen.
 *
 * The wall's claim is "we have a catalogue", and that claim is made by the
 * THIRTY POSTERS, which are 55 KB each and all of them paint immediately. The
 * video layer only has to prove the stills are frames of something moving, and
 * six clips prove that as well as thirty do. Rotation now cycles within this
 * pool, so the ceiling is six downloads however long the page is left open.
 */
const LIVE_POOL = 6;

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
  heightClass = "h-svh min-h-[620px]",
}: {
  slugs: string[];
  children: ReactNode;
  /**
   * Tailwind height for the wall. Full viewport is right for `/samples`, where
   * the hero IS the page's opening claim; a category page has to get to its
   * clips, so it asks for less. Passed rather than hard-coded because the two
   * heroes are otherwise the same component and should stay that way.
   */
  heightClass?: string;
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
  /* The six clips the live layer is allowed to use, spread across the library
     rather than taken off the front of it: `slugs` arrives in catalogue order,
     so the first six are six angles on the same trade. A stride gives six
     different kinds of work for the same six downloads. */
  const pool = useMemo(
    () =>
      Array.from(
        { length: Math.min(LIVE_POOL, slugs.length) },
        (_, k) => slugs[Math.floor((k * slugs.length) / LIVE_POOL)],
      ),
    [slugs],
  );

  const grid = useMemo(
    () =>
      Array.from({ length: COLS }, (_, c) =>
        Array.from({ length: ROWS }, (_, r) => {
          const i = c * ROWS + r;
          const step = i % LIVE_EVERY;
          const seat = Math.floor(i / LIVE_EVERY);
          const seats = Math.ceil((COLS * ROWS) / LIVE_EVERY);
          return {
            // Still: every tile keeps its own frame. Thirty distinct posters is
            // what makes the wall read as a catalogue, and they are 55 KB each.
            poster: slugs[(step * seats + seat) % slugs.length],
            // Motion: drawn from the pool, so the same clip may play in two
            // tiles far apart on a rotated, drifting wall. That is a fair trade
            // for not downloading the whole library to decorate a header.
            video: pool.length > 0 ? pool[seat % pool.length] : undefined,
          };
        }),
      ),
    [slugs, pool],
  );

  if (slugs.length === 0) return null;

  return (
    // Exactly one viewport tall, with no upper cap. A `max-h` here silently
    // undoes `h-svh` on any screen taller than the cap: the wall stops early and
    // the catalogue's white background shows below it, which reads as an
    // unfinished gap rather than as a deliberate end to the hero.
    <div
      className={`relative isolate flex w-full flex-col overflow-hidden ${heightClass}`}
    >
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
              {col.map((cell, r) => (
                <Tile
                  key={`${c}-${r}`}
                  slug={cell.poster}
                  videoSlug={cell.video}
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

      {/* The physical-ai treatment, over the scrims rather than under them:
          the scrims exist to darken footage, and washing before they land
          would just be something else for them to darken. */}
      <HeroWash className="-z-10" />

      <div className="flex min-h-0 flex-1 flex-col justify-center px-5 pb-10 pt-28 sm:px-8 lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] xl:px-[max(4rem,calc((100vw-1400px)/2+4rem))]">
        {children}
      </div>

    </div>
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
function Tile({
  slug,
  videoSlug,
  live,
}: {
  /** The still. One per tile, so the wall shows thirty different frames. */
  slug: string;
  /** The clip, from the shared pool. See `LIVE_POOL`. */
  videoSlug?: string;
  live: boolean;
}) {
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
        {live && videoSlug && (
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
              src={`/samples/clips/${videoSlug}.mp4`}
              poster={`/samples/posters/${videoSlug}.jpg`}
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
