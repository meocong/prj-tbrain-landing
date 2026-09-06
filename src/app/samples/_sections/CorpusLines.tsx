"use client";

import { motion, useReducedMotion } from "framer-motion";
import { PRODUCT_LINES } from "@/lib/samples/catalog";
import { C, EASE } from "./tokens";

/**
 * Editorial rows on a hairline grid. One oversized figure per line carries the
 * weight; the supporting facts stay small, and modalities read as a sentence
 * rather than a wall of pills.
 */
export function CorpusLines() {
  const reduce = useReducedMotion();

  return (
    <section id="lines" style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-24 md:py-32 lg:px-10 xl:px-16">
        <h2
          className="max-w-3xl text-3xl font-medium tracking-tight md:text-5xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
        >
          Three lines,{" "}
          <span style={{ color: C.textDim }}>one delivery standard</span>
        </h2>

        <div className="mt-16">
          {PRODUCT_LINES.map((line, i) => {
            const [hero, ...rest] = line.facts;
            return (
              <motion.article
                key={line.slug}
                className="grid gap-8 py-12 lg:grid-cols-12 lg:gap-10"
                style={i > 0 ? { borderTop: `1px solid ${C.hairline}` } : undefined}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.7, delay: i * 0.05, ease: EASE }}
              >
                <div className="lg:col-span-3">
                  <h3
                    className="text-2xl font-medium tracking-tight md:text-3xl"
                    style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
                  >
                    {line.name}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: C.textDim }}>
                    {line.positioning}
                  </p>
                  <p
                    className="mt-5 font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: line.status === "live" ? C.positive : C.textDim }}
                  >
                    {line.status === "live" ? "Published" : "Samples ready"}
                  </p>
                </div>

                <div className="lg:col-span-6">
                  <p
                    className="text-xl font-medium leading-snug md:text-2xl"
                    style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.015em" }}
                  >
                    {line.headline}
                  </p>
                  <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: C.textMid }}>
                    {line.body}
                  </p>
                  <p
                    className="mt-6 max-w-2xl font-mono text-[11px] leading-relaxed"
                    style={{ color: C.textDim }}
                  >
                    {line.modalities.join("  /  ")}
                  </p>
                </div>

                <div className="lg:col-span-3">
                  <p
                    className="font-mono text-5xl tracking-tighter md:text-6xl"
                    style={{ color: C.accent, lineHeight: 1 }}
                  >
                    {hero.value}
                  </p>
                  <p
                    className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: C.textDim }}
                  >
                    {hero.label}
                  </p>

                  <dl className="mt-8 space-y-3">
                    {rest.map((f) => (
                      <div key={f.label} className="flex items-baseline justify-between gap-4">
                        <dt className="text-xs" style={{ color: C.textDim }}>
                          {f.label}
                        </dt>
                        <dd className="font-mono text-sm" style={{ color: C.text }}>
                          {f.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
