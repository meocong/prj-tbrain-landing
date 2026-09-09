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
 * Empty, and that is the honest state: the wall is an argument about manual
 * work, so every tile has to show a pair of hands doing something, and every
 * record still in `samples.json` does. The one that did not — `engine-clean`,
 * which pointed at the operator's own shoulder and a splash guard for its whole
 * 163 seconds — left the catalogue entirely when records without complete
 * metadata were cut, so there is nothing left to exclude.
 *
 * It stayed listed here after that cut, which made this look like a live
 * exclusion while it filtered nothing. Only slugs that exist in `samples.json`
 * belong here; an entry naming a record that has since been removed silently
 * excludes nothing and reads as though it does.
 */
const NO_HANDS = new Set<string>([]);

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

          {/* Two lines, not three. Three lines of 72px display type is a
              font-scale error rather than a copy-length one, and the third line
              was carrying the whole idea.

              R19, and the reason it was on the list: "Human, robot and game
              capture" was a taxonomy, and the taxonomy is now the chooser's
              job. A headline that lists our own filing system asks the reader
              to work out what it is for.

              It must also stay ABOVE the categories rather than inside one.
              One rewrite here read "Data for models that have to act / Human
              hands, robot arms, live play", which is a robotics headline on a
              page that also sells gaming and Coding & STEM - it quietly
              narrowed the whole library to one line of business.

              And it has to name the product, not the reader's next action. The
              rewrite after that read "See the data before you buy it", which
              says what you can DO here and never says what is for sale; a
              stranger finished it without learning this is AI training data.
              Read 2026-09-09, the pattern is a noun phrase in all three
              catalogues that sell rather than pitch - Claru "Training data for
              physical AI", Encord "Train and run AI on the right data",
              Datarade "Find the right data products, effortlessly" - each with
              the audience and one figure carried by the subhead.

              "collected by us" is the clause that is ours rather than Claru's.
              They broker scale (10,000+ collectors, 100+ cities); we record it
              first-hand in operating businesses with professional operators.
              Same sentence shape, opposite claim, so it does not read as a
              copy of the competitor Tam sent.

              Tiers, hour counts and prices differ per category and live one
              click down, on the category they belong to. */}
          <h1
            /* `text-balance` is inherited, so each `block` span balances its
               own wrap. Without it the hero column at tablet width broke both
               lines one word early and stranded the last word alone on a line
               of 60px type. */
            className="mt-5 text-balance text-5xl font-medium tracking-tight md:text-6xl xl:text-7xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.035em",
              lineHeight: 0.98,
              color: "#ffffff",
            }}
          >
            {/* Non-breaking space: `text-balance` otherwise picks "Training
                data for" / "AI, collected by us." as the even split, which
                strands "AI," at the head of the second line and reads as a
                different sentence for a beat. */}
            <span className="block">Training data for&nbsp;AI, collected by us.</span>
            <span className="block" style={{ color: "rgba(255,255,255,0.48)" }}>
              Robotics, gaming, coding and STEM.
            </span>
          </h1>

          {/* Two claims and a hand-off, in that order.
              First the one thing no competitor's catalogue does - Claru,
              HumanoidLayer and Truelabel all put a form between a reader and a
              frame, and that was buried in a grey line under the fold. Then
              both purchase routes, because either could be the reason someone
              is here. Then the hand-off: nothing in this paragraph is specific
              to a category, and it should not be. Tiers, hours and pricing
              differ per category and are stated on the category. */}
          <p
            className="mt-6 max-w-lg text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.76)" }}
          >
            We record it first-hand, off the shelf or to your spec. Every set we sell has real
            delivery files on this page, playable in full with no form — open a category for its
            tiers, hours and pricing.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            {/* A plain anchor, scrolled by hand.
                As a next/link this appended rather than replaced the fragment:
                from /samples#deck a click produced /samples#deck#deck, which
                matches no id, so the page sat still. That is the state anyone
                who has already used the button once is in, and anyone who opens
                a shared /samples#deck link and scrolls back up.
                Scrolling explicitly also lets the fixed header be accounted for
                instead of covering the top of the section. */}
            <a
              href="#deck"
              onClick={(e) => {
                const deck = document.getElementById("deck");
                if (!deck) return; // let the browser handle it
                e.preventDefault();
                deck.scrollIntoView({
                  behavior: reduce ? "auto" : "smooth",
                  block: "start",
                });
                history.replaceState(null, "", "#deck");
              }}
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
              style={{ background: "#ffffff", color: "#0b0d13" }}
            >
              Browse samples
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
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
