"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DATASETS, LINES, axesFor, statsFor, type LineKey } from "@/lib/samples/datasets";
import { INTEROP } from "@/lib/samples/capability";
import { C, EASE } from "./tokens";

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

      <div className="mt-8 grid gap-x-8 gap-y-0 md:grid-cols-2 xl:grid-cols-3">
        {sets.map((d, i) => {
          const s = statsFor(d);
          const on = d.slug === activeSlug;
          return (
            <motion.button
              key={d.slug}
              type="button"
              onClick={() => onPick(on ? null : d.slug)}
              aria-pressed={on}
              className="group flex flex-col items-start px-1 py-6 text-left"
              style={{ borderTop: `1px solid ${on ? C.accent : C.hairline}` }}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: EASE }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: on ? C.accent : C.textDim }}
              >
                {s.episodes} episodes · {s.hours.toFixed(1)} h
              </span>

              <span
                className="mt-2 text-[17px] font-medium leading-snug"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.015em" }}
              >
                {d.name}
              </span>

              <span
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: C.textMid }}
              >
                {d.blurb}
              </span>

              {/* The three fields both competitors print on every card. Ours can
                  fill two of them today; licence has no data behind it at all,
                  and inventing one on a page a buyer procures from would be the
                  worst possible place to guess. It is named and left open. */}
              <span
                className="mt-4 font-mono text-[11px] leading-relaxed"
                style={{ color: C.textDim }}
              >
                {s.workplaces} workplaces · {s.rigs.join(", ")}
                {s.hardShare !== null && ` · ${Math.round(s.hardShare * 100)}% hard`}
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
