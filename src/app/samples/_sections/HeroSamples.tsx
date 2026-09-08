"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { EASE, type Sample } from "./tokens";
import { HeroMosaic } from "./HeroMosaic";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";

/**
 * Records whose delivered segment holds no hands-forward frame.
 *
 * The wall is an argument about manual work, so every tile has to show a pair
 * of hands doing something. `engine-clean` cannot: it points at the operator's
 * own shoulder and a splash guard for its whole 163 seconds, checked at one
 * frame every 7.7s across the segment. It stays in the catalogue — it is a real
 * delivery — but it does not earn a tile above the fold.
 *
 * Only slugs that exist in `samples.json` belong here; an entry naming a record
 * that has since been removed silently excludes nothing.
 */
const NO_HANDS = new Set(["engine-clean"]);

/**
 * Every other published slug, in catalogue order. The wall wants the set, not a
 * curated few: it is a claim about range, and range is made by a robotics clip
 * sitting next to a workshop one next to a game capture.
 *
 * Each slug must have both `/samples/clips/<slug>.mp4` and
 * `/samples/posters/<slug>.jpg`; a missing file shows as a dark tile, silently.
 */
const SLUGS = (samples as unknown as Sample[])
  .map((s) => s.slug)
  .filter((slug) => !NO_HANDS.has(slug));

/**
 * Full-bleed hero: a drifting wall of capture fragments fills the viewport and
 * the type is printed on it. Copy colours are fixed white rather than themed,
 * because the backdrop is footage under a dark scrim in both palettes.
 */
export function HeroSamples() {
  const reduce = useReducedMotion();

  return (
    <section className="relative">
      <HeroMosaic slugs={SLUGS}>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <span
            className="font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{ color: "rgba(255,255,255,0.62)" }}
          >
            Sample library
          </span>

          <h1
            className="mt-5 text-5xl font-medium tracking-tight md:text-6xl xl:text-7xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.035em",
              lineHeight: 0.98,
              color: "#ffffff",
            }}
          >
            <span className="block">Robotics and</span>
            <span className="block">game data,</span>
            <span className="block" style={{ color: "rgba(255,255,255,0.48)" }}>
              frame by frame.
            </span>
          </h1>

          <p
            className="mt-6 max-w-md text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.76)" }}
          >
            Play a real delivery file, read the telemetry beside it, then request the full set.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link
              href="#deck"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
              style={{ background: "#ffffff", color: "#0b0d13" }}
            >
              Browse samples
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href={requestUrl({ from: "hero" })}
              onClick={() => track("open_request_access", { from: "hero" })}
              className="text-sm font-medium underline decoration-1 underline-offset-[6px] transition-colors"
              style={{
                color: "rgba(255,255,255,0.82)",
                textDecorationColor: "rgba(255,255,255,0.34)",
              }}
            >
              Request access
            </Link>
          </div>
        </motion.div>
      </HeroMosaic>
    </section>
  );
}
