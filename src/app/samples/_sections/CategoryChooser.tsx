"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  CATEGORIES,
  clipSrc,
  facesFor,
  posterSrc,
  statsForCategory,
  type Category,
} from "@/lib/samples/categories";
import { C, EASE, OVER_MEDIA } from "./tokens";

/**
 * The front door.
 *
 * `/samples` used to be the catalogue itself: one grid, one facet rail, and a
 * reader expected to work out what "egocentric" means from a chip reading
 * `Egocentric 118`. Neither catalogue we read does that. Claru's `/explore` is a
 * chooser - four cards, each saying what its category IS and what the shelf
 * behind it holds - and the browsing happens one level down where a page has
 * room to explain itself.
 *
 * So the sentence under each name is the whole point of this component. A count
 * is not an explanation.
 *
 * The band above that sentence is the other half, and it was missing for longer:
 * this page carried zero images and zero video, on a site whose product is
 * footage, while 126 posters and 126 clips sat one route away keyed by slug.
 * Four frames from four different skill groups say more about what egocentric
 * capture looks like than any sentence here does, and hovering plays one.
 */

const LINES = [
  { key: "robotics", label: "Robotics & Physical AI" },
  { key: "gaming", label: "Gaming" },
  { key: "coding", label: "Coding & STEM" },
] as const;

/** Frames per card. Four fills the band at both column widths without a stub. */
const FACES = 4;

export function CategoryChooser() {
  const reduce = useReducedMotion();

  return (
    <section id="deck" style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-24 md:pt-28 lg:px-10 xl:px-16">
        <h2
          className="max-w-3xl text-3xl font-medium tracking-tight md:text-5xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
        >
          Pick the kind of data you need.{" "}
          <span style={{ color: C.textDim }}>Every sample plays here, with no form.</span>
        </h2>

        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: C.textMid }}>
          We collect human work and robot work, off the shelf or to your spec, and deliver it as
          MCAP or LeRobot with the calibration, telemetry and annotation in band. Open a category to
          see what is in it, what it costs, and how long it takes.
        </p>

        {LINES.map((line, li) => {
          const cats = CATEGORIES.filter((c) => c.line === line.key);
          if (cats.length === 0) return null;
          return (
            <div key={line.key} className={li === 0 ? "mt-14" : "mt-16"}>
              <h3
                className="font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: C.textDim }}
              >
                {line.label}
              </h3>
              <div className="mt-5 grid gap-x-8 gap-y-10 md:grid-cols-2">
                {cats.map((c, i) => (
                  <CategoryCard key={c.slug} category={c} index={i} reduce={Boolean(reduce)} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CategoryCard({
  category: c,
  index,
  reduce,
}: {
  category: Category;
  index: number;
  reduce: boolean;
}) {
  const s = statsForCategory(c);
  const href = c.externalHref ?? `/samples/${c.slug}`;
  const faces = facesFor(c, FACES);

  /* What is true about this line right now, in the order a buyer wants it:
     what they can play, then what is collected but unpublished, then what we
     would collect on request. Never all three, and never a blank. */
  const state =
    s.episodes > 0
      ? `${s.episodes} samples playable · ${s.hours.toFixed(1)} h`
      : s.inFlight
        ? "Collected, not published yet"
        : s.tiers.length > 0
          ? `Collected to spec · from ${s.tiers[0].price}`
          : "See the catalogue";

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: EASE }}
    >
      <Link href={href} className="group block">
        {faces.length > 0 ? (
          <FaceBand slugs={faces} reduce={reduce} />
        ) : (
          <HeldBand held={c.held} />
        )}

        <div
          className="flex flex-col pt-5"
          style={{ borderTop: `1px solid ${C.hairline}` }}
        >
          <span className="flex items-baseline justify-between gap-4">
            <span
              className="text-xl font-medium tracking-tight md:text-2xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              {c.name}
            </span>
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: C.textDim }}
            />
          </span>

          <span className="mt-2 max-w-xl text-[13.5px] leading-relaxed" style={{ color: C.textMid }}>
            {c.whatItIs}
          </span>

          <span className="mt-4 font-mono text-[11px]" style={{ color: C.accent }}>
            {state}
          </span>

          {c.shelf && (
            <span className="mt-1.5 max-w-xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
              {c.shelf}
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Four frames from four skill groups, and the first one plays on hover.
 *
 * Only one video element per card, and it is created on first hover rather than
 * mounted with the page: six cards times four clips is 24 videos this page has
 * no reason to fetch before anyone has pointed at anything.
 */
function FaceBand({ slugs, reduce }: { slugs: string[]; reduce: boolean }) {
  const [armed, setArmed] = useState(false);
  const video = useRef<HTMLVideoElement | null>(null);

  const enter = () => {
    if (reduce) return;
    setArmed(true);
    // The element does not exist on the first hover - it mounts from `armed` -
    // so autoPlay carries that pass and this only covers the returns.
    video.current?.play().catch(() => {});
  };

  return (
    <div
      className="flex h-[132px] gap-[2px] overflow-hidden md:h-[150px]"
      onMouseEnter={enter}
      onMouseLeave={() => video.current?.pause()}
      style={{ background: C.wash }}
    >
      {slugs.map((slug, i) => (
        <div key={slug} className="relative min-w-0 flex-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc(slug)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {i === 0 && armed && (
            <video
              ref={video}
              src={clipSrc(slug)}
              poster={posterSrc(slug)}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          {i === 0 && (
            <span
              className="pointer-events-none absolute bottom-2 left-2 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] opacity-0 transition-opacity group-hover:opacity-100"
              style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
            >
              Preview
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * A category with nothing playable.
 *
 * Same band height so the row does not go ragged, and never a borrowed frame:
 * showing egocentric footage on the mocap card would be a lie about what we can
 * show. The first version repeated the state line here, which printed the same
 * words twice a hundred pixels apart; this prints the one figure that IS true -
 * hours in collection, episodes held, or the price of collecting it - at
 * display size, so the band carries weight rather than a caption.
 */
function HeldBand({ held }: { held?: { figure: string; unit: string } }) {
  return (
    <div
      className="flex h-[132px] flex-col justify-end p-4 md:h-[150px]"
      style={{
        // The hatch reads as texture at 4% and as a barcode at 40%. It exists to
        // say "not footage" without competing with the four cards that are.
        background: `repeating-linear-gradient(-45deg, ${C.hairlineSoft} 0 1px, transparent 1px 9px)`,
      }}
    >
      {held && (
        <>
          <span
            className="font-mono text-3xl tracking-tight md:text-4xl"
            style={{ color: C.value, lineHeight: 1 }}
          >
            {held.figure}
          </span>
          <span
            className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: C.textDim }}
          >
            {held.unit}
          </span>
        </>
      )}
    </div>
  );
}
