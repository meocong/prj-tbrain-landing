"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CATEGORIES, statsForCategory, type Category } from "@/lib/samples/categories";
import { C, EASE } from "./tokens";

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
 */

const LINES = [
  { key: "robotics", label: "Robotics & Physical AI" },
  { key: "gaming", label: "Gaming" },
  { key: "coding", label: "Coding & STEM" },
] as const;

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
              <div className="mt-5 grid gap-x-8 gap-y-0 md:grid-cols-2">
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
      style={{ borderTop: `1px solid ${C.hairline}` }}
    >
      <Link href={href} className="group flex flex-col py-7">
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
      </Link>
    </motion.div>
  );
}
