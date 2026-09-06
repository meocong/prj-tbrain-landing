"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { C, EASE } from "./tokens";
import { track } from "@/lib/samples/track";
import { requestUrl } from "@/lib/samples/request-link";

/**
 * Asymmetric hero: type holds the left twelve columns, the clip breaks the
 * container and bleeds off the right edge. No card frame around the video.
 */
export function HeroSamples() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-4 pt-24" style={{ background: C.base, color: C.text }}>
      {/* Full width rather than the shared container, so the clip can reach the
          viewport edge. The copy is padded back to the container's left edge. */}
      <div>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-0">
          <motion.div
            className="px-4 lg:pr-12 lg:pl-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] xl:pl-[max(4rem,calc((100vw-1400px)/2+4rem))]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: C.accent }}>
              Sample library
            </span>

            <h1
              className="mt-6 text-5xl font-medium tracking-tight md:text-6xl xl:text-7xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.035em", lineHeight: 0.98 }}
            >
              <span className="block">Robotics and</span>
              <span className="block">game data,</span>
              <span className="block" style={{ color: C.textDim }}>
                frame by frame.
              </span>
            </h1>

            <p className="mt-7 max-w-md text-base leading-relaxed" style={{ color: C.textMid }}>
              Play a real delivery file, read the telemetry beside it, then request the full set.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Link
                href="#deck"
                className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
                style={{ background: C.text, color: C.base }}
              >
                Browse samples
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={requestUrl({ from: "hero" })}
                onClick={() => track("open_request_access", { from: "hero" })}
                className="text-sm font-medium underline decoration-1 underline-offset-[6px] transition-colors"
                style={{ color: C.textMid, textDecorationColor: "rgba(255,255,255,0.24)" }}
              >
                Request access
              </Link>
            </div>
          </motion.div>

          <motion.figure
            className="relative"
            initial={reduce ? false : { opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1, ease: EASE }}
          >
            <video
              className="aspect-[5/4] w-full object-cover lg:aspect-[4/3] lg:max-h-[74vh]"
              src="/samples/clips/cowl-installation.mp4"
              poster="/samples/posters/cowl-installation.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Egocentric capture of a mechanic installing a motorcycle cowl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(7,9,15,0.85) 0%, rgba(7,9,15,0) 24%), linear-gradient(0deg, rgba(7,9,15,0.55) 0%, rgba(7,9,15,0) 26%)",
              }}
            />
            <figcaption
              className="absolute bottom-4 right-4 text-right font-mono text-[11px] leading-relaxed"
              style={{ color: "rgba(255,255,255,0.72)" }}
            >
              cowl-installation
              <span className="mx-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                /
              </span>
              3:46 delivered
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
