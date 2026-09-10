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
  type Category,
} from "@/lib/samples/categories";
import { CategoryDiagram } from "./CategoryDiagram";
import { C, EASE, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

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

/**
 * One frame per card.
 *
 * It was four, in a 132px strip above a block of prose. Tam, 2026-09-10: "bỏ
 * chữ của cái này đi, 1 video và chữ title với mô tả ngắn màu trắng floating
 * bên trong thôi" — so the card IS the clip now, and the only type on it is the
 * name and one short line, printed white on the footage.
 *
 * Four frames were arguing for variety; one frame at full card width is legible,
 * which is the argument that actually needed making on a page selling video.
 */
const FACES = 1;

export function CategoryChooser() {
  const reduce = useReducedMotion();

  return (
    <section id="deck" className="bp-grid bp-frame relative" style={{ color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-24 pt-24 md:pt-28 lg:px-10 xl:px-16">
        {/* Heading and intro. The cards below carry their own stagger. */}
        <Reveal variant="rise">
          <h2
            className="max-w-3xl text-3xl font-medium tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
          >
            {/* Not "Pick the kind of data you need", which this said until
                2026-09-09 and which claru.ai/explore says as "Pick the kind of
                footage you need, open a folder, and play the clips right here."
                Arrived at independently, but Tam sent Claru as the reference, so
                somebody will have both tabs open and see a clone. */}
            Six catalogues, one delivery pipeline.{" "}
            <span style={{ color: C.textDim }}>Open one to see what it holds and how it is captured.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed" style={{ color: C.textMid }}>
            We collect human work and robot work, off the shelf or to your spec, and deliver it as
            MCAP or LeRobot with the calibration, telemetry and annotation in band. Open a category to
            see what is in it, what records it, and how long it takes.
          </p>
        </Reveal>

        {LINES.map((line, li) => {
          const cats = CATEGORIES.filter((c) => c.line === line.key);
          if (cats.length === 0) return null;
          return (
            <div key={line.key} className={li === 0 ? "mt-14" : "mt-16"}>
              <h3
                className="bp-mono text-[10px]"
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
  const href = c.externalHref ?? `/samples/${c.slug}`;
  const faces = facesFor(c, FACES);
  // A category with no records may still carry its own footage.
  const own = c.reel?.map((x) => x.slug) ?? [];
  const band = faces.length > 0 ? faces : own;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.05, ease: EASE }}
    >
      {/* A card, not a bare column. `.bp-grid` runs behind this section and
          blueprint's own rule is that text sits on a card and never on the bare
          grid. `overflow-hidden` clips the footage to the card's 12px corner. */}
      <Link href={href} className="bp-card bp-card-hover group relative block overflow-hidden">
        {band.length > 0 ? (
          <FaceBand slug={band[0]} reduce={reduce} />
        ) : (
          <HeldBand slug={c.slug} />
        )}

        {/* The wash, then the type. Both are `pointer-events-none` so the hover
            that starts the clip is not intercepted by the words sitting on it.

            `absolute inset-0` rather than a bottom strip: a gradient that starts
            transparent has to span the frame to land softly, and anchoring the
            copy with `flex justify-end` puts it at the foot of that same box. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: OVER_MEDIA.wash }}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end p-5 md:p-6">
          <span className="flex items-baseline justify-between gap-4">
            <span
              className="text-2xl font-medium tracking-tight md:text-3xl"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.02em",
                color: OVER_MEDIA.title,
              }}
            >
              {c.name}
            </span>
            {/* Kept while the prose went: with every other cue gone the card has
                to say it is a door, and an arrow is the one that costs no line
                of type. */}
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
              style={{ color: OVER_MEDIA.text }}
            />
          </span>

          {/* `line-clamp-2` rather than a new short field on all six categories.
              `whatItIs` is written as "<what it is>: <what is in it>", so the
              first two lines are already the short form, and clamping keeps one
              sentence per category rather than two written to different briefs. */}
          <span
            className="mt-2 line-clamp-2 max-w-xl text-[13px] leading-relaxed"
            style={{ color: OVER_MEDIA.text }}
          >
            {c.whatItIs}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * The card's frame, which plays on hover.
 *
 * The video element is created on first hover rather than mounted with the
 * page: six cards is six clips this page has no reason to fetch before anyone
 * has pointed at anything. The poster carries the card until then, which is why
 * the still and the clip are the same slug.
 */
function FaceBand({ slug, reduce }: { slug: string; reduce: boolean }) {
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
      className="relative aspect-16/10 w-full overflow-hidden"
      onMouseEnter={enter}
      onMouseLeave={() => video.current?.pause()}
      style={{ background: C.wash }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc(slug)}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
      {armed && (
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
      <span
        className="bp-mono pointer-events-none absolute left-3 top-3 px-1.5 py-0.5 text-[9px] opacity-0 transition-opacity group-hover:opacity-100"
        style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
      >
        Preview
      </span>
    </div>
  );
}

/**
 * A category with nothing playable.
 *
 * Same aspect as the clip so the row does not go ragged, and never a borrowed
 * frame: showing egocentric footage on the coding card would be a lie about what
 * we can show. A drawing on hatch says "not footage" without pretending.
 *
 * It used to print the one figure that IS true — hours in collection, episodes
 * held — at display size. That went with the rest of the type when the card
 * became the clip: the name and one line are all that floats now, and a 36px
 * number under them would be the third thing.
 */
function HeldBand({ slug }: { slug: string }) {
  return (
    <div
      className="relative aspect-16/10 w-full overflow-hidden"
      style={{
        // The hatch reads as texture at 4% and as a barcode at 40%. It exists to
        // say "not footage" without competing with the cards that are.
        background: `repeating-linear-gradient(-45deg, ${C.hairlineSoft} 0 1px, transparent 1px 9px)`,
      }}
    >
      <CategoryDiagram
        slug={slug}
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.55]"
      />
    </div>
  );
}
