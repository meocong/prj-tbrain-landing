"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import samples from "@/lib/samples/samples.json";
import { C, EASE, type Sample } from "./tokens";
import { HeroMosaic } from "./HeroMosaic";
import { GRADIENT_TEXT, HeroWash } from "./HeroWash";
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
            className="bp-mono text-[11px]"
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

              It must stay ABOVE the categories rather than inside one, and
              four drafts failed that in four different ways. "Data for models
              that have to act / Human hands, robot arms, live play" was a
              robotics headline on a page that also sells gaming and Coding &
              STEM. "We record people doing real work" narrowed harder still -
              "real work" reads as manual labour, and this business is not one
              modality with extras.

              The level that holds all of it is the offer, not the subject: we
              collect training data of whatever kind a customer needs, either
              from the shelf or to their spec, and this page is a sample of it.
              Anything more specific than that belongs on a category page.

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

              The second line is NOT the category list, though it was once. A
              list here is the same fault as the taxonomy above with different
              words, and the chooser prints those three words verbatim as its
              own section headings 746px below - measured, not guessed. It also
              weighted them wrong: Coding & STEM took a quarter of the headline
              while living on another route entirely, and robotics, which is
              118 of the 126 samples, took a third.

              Nor is it "Every sample opens without a form", which it was for
              one commit on the belief that no competitor could say it. Claru
              says it twice, verbatim: "play approved samples, no form
              required" on /data-catalog and "No login, no form" on /explore,
              both read 2026-09-09. It is table stakes here, not an edge.

              It carries the second purchase route instead, because either
              route can be why somebody arrived and the page said one of them
              nowhere. Tiers, hour counts and ramp times differ per category
              and live one click down, on the category they belong to. */}
          <h1
            /* `text-balance` is inherited, so each `block` span balances its
               own wrap. Without it the hero column at tablet width broke both
               lines one word early and stranded the last word alone on a line
               of 60px type. */
            className="mt-5 text-balance text-5xl font-medium tracking-tight md:text-6xl xl:text-7xl"
            style={{
              fontFamily: "var(--font-heading)",
              letterSpacing: "-0.03em",
              lineHeight: 0.98,
              color: "#ffffff",
            }}
          >
            <span className="block">Training data, in whatever shape your model needs.</span>
            {/* The gradient goes on the second line, not a word inside the
                first, because of what the two lines are: line one names the
                product, line two names the choice a buyer is actually here to
                make. Same split the reference uses — plain lead, coloured
                payload — one level coarser because ours is a sentence pair
                rather than a sentence.

                It also replaces a flat rgba(255,255,255,0.48). At 60-72px that
                grey read as an afterthought, which is the wrong weight for the
                half of the offer nobody else on this page mentions. */}
            <span className="block" style={GRADIENT_TEXT}>
              Off the shelf, or collected to your spec.
            </span>
          </h1>

          {/* What we sell, then the thing that is actually ours, then a
              hand-off.

              "Plays without a form" is not the differentiator - see the h1
              comment; Claru says it too. One level more specific is: the clip
              plays with its telemetry running beside it, and the .mcap comes
              off the same card. Claru's /explore plays clips and shows no
              signal at all; humanoidlayer.dev prints format and licence per
              card and hosts no player. Nobody read on 2026-09-09 does both.

              Nothing in this paragraph is category-specific and none should
              be. Rigs, tiers and lead times differ per category and are stated
              on the category, which is what the last clause points at. */}
          <p
            className="mt-6 max-w-lg text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.76)" }}
          >
            Video, motion, telemetry, gameplay — we record it ourselves, annotate it, and ship it
            as MCAP or LeRobot. 126 samples play on this page with the telemetry running beside
            them and the delivery file on the same card. Open a category for what is in it, what
            records it, and how long it takes.
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
              /* Not `background: "#ffffff"`, which this was and which rendered
                 the page's primary CTA invisible in dark mode. globals.css
                 carries a site-wide sledgehammer for legacy sections that
                 hardcode a white card — `.dark [style*="background:#fff"]`,
                 `!important`, repainting it as a dark scrim. `#ffffff` contains
                 `#fff`, so the pill matched: background forced to a dark scrim,
                 colour left at the near-black `#0b0d13` written here. Dark on
                 dark, over video, with the label unreadable.

                 Tokens instead of a literal, which fixes it twice over: the
                 selector no longer matches, and the pill inverts with the theme
                 — near-white on near-black in dark, the reverse in light —
                 rather than assuming the page behind it is dark. */
              style={{ background: C.text, color: C.base }}
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
