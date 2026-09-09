"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DATASETS, statsFor } from "@/lib/samples/datasets";
import { INTEROP } from "@/lib/samples/capability";
import { LICENSE_SHORT, QUALIFIER } from "@/lib/samples/license";
import { C, EASE, OVER_MEDIA } from "./tokens";

/**
 * The two buyers, then the datasets each of them shops.
 *
 * Two things this fixes, both found by reading the competitors rather than by
 * reasoning about our own page.
 *
 * Gaming and robotics shared one grid. Tam is explicit that they are two
 * different purchases, and Claru gives Gaming its own browse entry; ours asked a
 * robotics buyer to filter eight game clips out and a gaming buyer to filter a
 * hundred and eighteen robotics records out. The line switch is now the first
 * control on the catalogue.
 *
 * And a card was one eight-second clip. Both catalogues make a card a dataset:
 * a name, a paragraph, its counts. This band is that object. Pressing one
 * narrows the grid below to exactly its records, so the dataset is a real
 * selection rather than a decorative header.
 *
 * Every figure is derived from the records at render. Nothing here is a written
 * number that can drift from samples.json.
 */
export function DatasetBand({
  scope,
  activeSlug,
  onPick,
}: {
  /** The category this page is. The line switch moved to the chooser. */
  scope: string;
  activeSlug: string | null;
  onPick: (slug: string | null) => void;
}) {
  const reduce = useReducedMotion();
  const line = scope === "gaming" ? "gaming" : "robotics";
  const sets = DATASETS.filter((d) => d.line === line);

  return (
    <div className="mt-4">
      {/* Image cards, not prose blocks. Claru's cards are paragraphs because
          they have nothing to show; these sit directly above 118 playable
          posters, so the frame does the work the paragraph was doing badly and
          the line under it says what the set is in fifteen words. The poster is
          the longest record in each set, picked deterministically so the card
          does not change between renders. */}
      {/* One horizontal row that scrolls, not a two-row grid. As a grid these
          eight cards were 600px of picker standing between arriving and
          playing something, which is the opposite of what a picker is for. */}
      <div className="-mx-4 mt-2 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
        {sets.map((d, i) => {
          const s = statsFor(d);
          const on = d.slug === activeSlug;
          return (
            <motion.button
              key={d.slug}
              type="button"
              onClick={() => onPick(on ? null : d.slug)}
              aria-pressed={on}
              className="group flex w-[210px] shrink-0 snap-start flex-col items-start text-left"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
            >
              <span
                className="relative block w-full overflow-hidden"
                style={{
                  aspectRatio: "4 / 3",
                  background: C.band,
                  outline: on ? `2px solid ${C.accent}` : "none",
                  outlineOffset: "-2px",
                }}
              >
                {s.poster && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`/samples/posters/${s.poster}.jpg`}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ opacity: on ? 1 : 0.88 }}
                  />
                )}
                <span
                  className="absolute bottom-2 left-2 rounded-full px-2 py-0.5 font-mono text-[10px]"
                  style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
                >
                  {s.episodes} · {s.hours.toFixed(1)} h
                </span>
              </span>

              <span
                className="mt-3 text-[15px] font-medium leading-snug"
                style={{
                  fontFamily: "var(--font-heading)",
                  letterSpacing: "-0.015em",
                  color: on ? C.accent : C.text,
                }}
              >
                {d.name}
              </span>

              <span className="mt-1 text-[12.5px] leading-relaxed" style={{ color: C.textMid }}>
                {d.blurb}
              </span>

              {/* Format and licence, the two fields humanoidlayer.dev prints
                  on every card so a buyer can rule a set in or out without
                  opening it. The licence is provisional - see license.ts, half
                  its terms are drafts - so the block below carries the sentence
                  that makes an indicative term publishable. */}
              <span
                className="mt-2 font-mono text-[10.5px]"
                style={{ color: C.value }}
              >
                {s.formats.join(" + ")}
              </span>
              <span
                className="mt-0.5 font-mono text-[10.5px]"
                style={{ color: C.textDim }}
              >
                {LICENSE_SHORT}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div
        className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-5"
        style={{ borderTop: `1px solid ${C.hairline}` }}
      >
        <p className="font-mono text-[11px]" style={{ color: C.textDim }}>
          Delivered as {INTEROP}
        </p>
        <p className="text-[11.5px]" style={{ color: C.textDim }}>
          {QUALIFIER}
        </p>
      </div>
    </div>
  );
}
