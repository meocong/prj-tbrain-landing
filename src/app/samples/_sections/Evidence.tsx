"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { CASE_STUDIES, PROOF_POINTS, TERMS } from "@/lib/samples/catalog";
import { C, EASE } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * The two questions a sample deck cannot answer on its own: has this shipped
 * before, and may I legally train on it. Work already published on the site
 * answers the first; the capture basis answers the second.
 */
export function Evidence({ line }: { line?: string }) {
  const reduce = useReducedMotion();

  /* A term with no `lines` applies everywhere. One with `lines` renders only
     there — the game-rights card was explaining how commercial titles are
     licensed on /samples/egocentric, which holds no game. Undefined `line` is
     the front door, where all of them apply. */
  const terms = TERMS.filter(
    // `as const` on TERMS narrows `lines` to its literal members, so the
    // comparison widens rather than the data losing its type.
    (t) => !("lines" in t) || !line || (t.lines as readonly string[]).includes(line),
  );

  return (
    <section className="bp-grid bp-frame relative" style={{ color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-24 md:py-32 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <h2
                className="text-3xl font-medium tracking-tight md:text-5xl"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
              >
                Delivered before,{" "}
                <span style={{ color: C.textDim }}>on these terms</span>
              </h2>

              <div className="mt-10">
                {CASE_STUDIES.map((cs, i) => (
                  <motion.div
                    key={cs.href}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
                  >
                    <Link
                      href={cs.href}
                      className="group flex items-start justify-between gap-6 py-5 transition-colors"
                      style={{ borderTop: `1px solid ${C.hairline}` }}
                    >
                      <span
                        className="text-[15px] font-medium leading-snug"
                        style={{ fontFamily: "var(--font-heading)" }}
                      >
                        {cs.title}
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        style={{ color: C.textDim }}
                      />
                    </Link>
                  </motion.div>
                ))}
              </div>

              <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8">
                {PROOF_POINTS.map((p) => (
                  <div key={p.label}>
                    <dt className="font-mono text-3xl tracking-tight" style={{ color: C.accent, lineHeight: 1 }}>
                      {p.value}
                    </dt>
                    <dd className="mt-2 text-[13px] leading-snug" style={{ color: C.textMid }}>
                      {p.label}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-6 text-[11px]" style={{ color: C.textDim }}>
                Fleet figures describe the off-the-shelf corpus, the line with published numbers.
              </p>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              {terms.map((t, i) => (
                <motion.article
                  key={t.title}
                  className="py-8"
                  style={{ borderTop: `1px solid ${C.hairline}` }}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, delay: i * 0.07, ease: EASE }}
                >
                  <h3
                    className="text-xl font-medium md:text-2xl"
                    style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
                  >
                    {t.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed" style={{ color: C.textMid }}>
                    {t.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
