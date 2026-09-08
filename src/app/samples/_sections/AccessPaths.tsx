"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ACCESS_PATHS } from "@/lib/samples/catalog";
import { C, EASE } from "./tokens";
import { track } from "@/lib/samples/track";

/**
 * Closing band. Two rows on hairlines rather than two boxes, so the page ends
 * on type and a single filled button instead of another pair of cards.
 */
export function AccessPaths() {
  const reduce = useReducedMotion();

  return (
    <section id="access" style={{ background: C.band, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-24 md:py-32 lg:px-10 xl:px-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <h2
              className="text-3xl font-medium tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
            >
              Two ways{" "}
              <span style={{ color: C.textDim }}>into the full set</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed md:text-base" style={{ color: C.textMid }}>
              Previews on this page are open. Full resolution files, every camera, and the
              accompanying telemetry sit behind one of these.
            </p>
          </div>

          <div className="lg:col-span-7">
            {ACCESS_PATHS.map((path, i) => (
              <motion.div
                key={path.key}
                className="flex flex-col gap-6 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-10"
                style={{ borderTop: `1px solid ${C.hairline}` }}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              >
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-xl font-medium md:text-2xl"
                    style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.015em" }}
                  >
                    {path.title}
                  </h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed" style={{ color: C.textMid }}>
                    {path.body}
                  </p>
                  <p
                    className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em]"
                    style={{ color: C.textDim }}
                  >
                    {path.detail}
                  </p>
                </div>

                <Link
                  href={path.href}
                  onClick={() =>
                    track(path.primary ? "open_request_access" : "open_passcode", { from: "access_band" })
                  }
                  className="group inline-flex shrink-0 items-center gap-2 self-start rounded-full text-sm font-semibold transition-transform active:scale-[0.98] sm:self-center"
                  style={
                    path.primary
                      ? { background: C.text, color: C.base, padding: "0.85rem 1.6rem" }
                      : {
                          border: `1px solid ${C.rule}`,
                          color: C.text,
                          padding: "0.85rem 1.6rem",
                        }
                  }
                >
                  {path.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
