"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DATASETS, LINES, axesFor, statsFor, type LineKey } from "@/lib/samples/datasets";
import { INTEROP } from "@/lib/samples/capability";
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
  line,
  onLine,
  activeSlug,
  onPick,
}: {
  line: LineKey;
  onLine: (line: LineKey) => void;
  activeSlug: string | null;
  onPick: (slug: string | null) => void;
}) {
  const reduce = useReducedMotion();
  const sets = DATASETS.filter((d) => d.line === line);

  return (
    <div className="mt-10">
      <div className="flex flex-wrap items-center gap-2">
        {LINES.map((l) => {
          const on = l.key === line;
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => onLine(l.key)}
              aria-pressed={on}
              className="rounded-full px-4 py-2 text-[13px] font-medium transition-colors"
              style={
                on
                  ? { background: C.text, color: C.base }
                  : { border: `1px solid ${C.hairline}`, color: C.textMid }
              }
            >
              {l.label}
            </button>
          );
        })}
      </div>

      {/* Diversity as named axes, which is how Claru states GEO / DEM / ENV /
          DEV. Counted from the records on this page, and labelled as such: the
          deck's figures describe the whole 1,200-hour shelf, and printing those
          over a grid of 118 playable samples is the quiet overstatement a
          procurement review exists to catch. */}
      <dl className="mt-7 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4">
        {axesFor(line).map((a) => (
          <div key={a.key}>
            <dt
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: C.textDim }}
            >
              {a.label}
            </dt>
            <dd
              className="mt-1 font-mono text-2xl tracking-tight"
              style={{ color: C.value, lineHeight: 1.1 }}
            >
              {a.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-[12px]" style={{ color: C.textDim }}>
        Measured across the samples published here, not the full shelf.
      </p>

      {/* Image cards, not prose blocks. Claru's cards are paragraphs because
          they have nothing to show; these sit directly above 118 playable
          posters, so the frame does the work the paragraph was doing badly and
          the line under it says what the set is in fifteen words. The poster is
          the longest record in each set, picked deterministically so the card
          does not change between renders. */}
      <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
        {sets.map((d, i) => {
          const s = statsFor(d);
          const on = d.slug === activeSlug;
          return (
            <motion.button
              key={d.slug}
              type="button"
              onClick={() => onPick(on ? null : d.slug)}
              aria-pressed={on}
              className="group flex flex-col items-start text-left"
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
            </motion.button>
          );
        })}
      </div>

      <p className="mt-6 font-mono text-[11px]" style={{ color: C.textDim }}>
        Delivered as {INTEROP}
      </p>
    </div>
  );
}
