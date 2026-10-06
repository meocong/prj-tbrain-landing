"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion-pref";
import { HP_AGG } from "@/lib/samples/handpose";
import { requestUrl } from "@/lib/samples/request-link";
import { OVER_MEDIA } from "../tokens";
import { GRADIENT_TEXT, HeroWash } from "../HeroWash";
import { FEATURED } from "./page-data";
import { OpenRecordLink, TrackedLink } from "./page-links";

/**
 * The page's hero: one skeleton render on a loop, the headline printed on it.
 *
 * Not `HeroReel`, for three reasons that all come from this being one short
 * clip rather than a rotation of long ones. The reel's `<video>` has no `loop`,
 * so a 3-second render would freeze on its last frame; it rotates only when
 * there are two or more items; and its `visibilitychange` handler resumes the
 * video with no check for reduced motion, so a reader who asked for stillness
 * would get motion back by switching tabs.
 *
 * The footage is a skeleton render on a dark ground in BOTH themes, so the band
 * is dark in both and the header goes white over it (`categoryHeroIsDark`).
 * Copy colours are fixed for the same reason: the backdrop is not the page.
 *
 * Motion. The video is ambient: muted, looping, no controls, so the header's
 * pause switch can still it. It carries no `autoPlay` attribute, because that
 * would start it in server markup before any preference is known. It is started
 * from an effect, only when the reader has not asked for reduced motion, and
 * stopped when they do, when the tab is hidden and when the hero is scrolled
 * out of view. Under reduced motion it never starts, so the poster is the
 * hero.
 */

/** The base the scrims are cut from; the same 6,8,14 `HeroReel` uses. */
const HERO_BASE = "#06080E";
/** The dark-theme cyan, as a literal: this text sits on footage in both themes, never on the page. */
const ON_DARK_CYAN = "#22E3C8";
/** The dark theme's ink and base, for the same reason: the primary button on a band that is dark in both. */
const ON_DARK_INK = "#EAF0FF";
const ON_DARK_BASE = "#0E0C24";

const VIDEO = "/samples/hand-pose/hero-13.mp4";
const POSTER = "/samples/hand-pose/hero-13.jpg";

export function HandPoseHero() {
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    // React sets `muted` as a property after mount, and the autoplay policy
    // only lets a muted video start without a gesture.
    v.muted = true;
    if (reduce) {
      v.pause();
      return;
    }

    let onScreen = true;
    const sync = () => {
      // `prefersReducedMotion()` is read again here, not just `reduce` above: it
      // is the one that includes the pause switch, and this runs from events
      // (visibility, intersection) that can fire between renders.
      if (onScreen && !document.hidden && !prefersReducedMotion()) v.play().catch(() => {});
      else v.pause();
    };
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
          });
    io?.observe(v);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      v.pause();
    };
  }, [reduce]);

  return (
    // `bp-grid` for its focus ring, as the flat bands below carry it. The ring
    // colour is the cyan of the page's text on this band, set here as a literal:
    // the token is a dark teal in light mode, which would be a dark outline on
    // a band that is near-black in both themes. The paper `bp-grid` also draws
    // is covered by the band's own background.
    <section
      aria-labelledby="hp-hero-title"
      className="bp-grid relative"
      style={{ animation: "none", ["--bp-focus-ring" as string]: ON_DARK_CYAN } as CSSProperties}
    >
      {/* A min height, not a fixed one: at 390 px the copy is taller than the
          picture, and a fixed box with `overflow-hidden` would clip the buttons. */}
      <div
        className="relative isolate flex min-h-[620px] flex-col overflow-hidden md:min-h-[min(86svh,800px)]"
        style={{ background: HERO_BASE }}
      >
        {/* The picture. A band across the top on a phone, so the hands are seen
            rather than read through; the whole hero from `md` up, where the
            composition (hands in the right half) leaves the left for type.
            `object-position` keeps those hands in frame when the box is
            narrower than 16:9 and `cover` has to crop. */}
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[300px] md:inset-0 md:h-auto">
          <video
            ref={video}
            src={VIDEO}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            style={{ objectPosition: "85% 50%" }}
          />
        </div>

        {/* Scrims. Desktop: hold the headline on the left, let the render show
            on the right, weigh the foot so the proof chips read. Phone: the
            picture is above the copy, so the work is to melt its lower edge into
            the base and keep the transparent header legible across the top. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
          style={{
            background: [
              "linear-gradient(90deg, rgba(6,8,14,0.94) 0%, rgba(6,8,14,0.80) 36%, rgba(6,8,14,0.22) 64%, rgba(6,8,14,0) 100%)",
              "linear-gradient(0deg, rgba(6,8,14,0.9) 0%, rgba(6,8,14,0) 34%)",
              "linear-gradient(180deg, rgba(6,8,14,0.7) 0%, rgba(6,8,14,0) 24%)",
            ].join(", "),
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] md:hidden"
          style={{
            background: `linear-gradient(180deg, rgba(6,8,14,0.7) 0%, rgba(6,8,14,0) 26%, rgba(6,8,14,0) 52%, ${HERO_BASE} 100%)`,
          }}
        />

        {/* Over the scrims, not under: they exist to darken footage, and a wash
            laid first is just more for them to darken. Same order as HeroReel. */}
        <HeroWash className="-z-10" />

        <div className="flex min-h-0 flex-1 flex-col justify-end px-4 pb-10 pt-[258px] md:pb-12 md:pt-32 lg:px-[max(2.5rem,calc((100vw-1400px)/2+2.5rem))] xl:px-[max(4rem,calc((100vw-1400px)/2+4rem))]">
          <div className="max-w-[52rem]">
            <Link
              href="/samples"
              className="inline-flex items-center gap-2 py-1 text-[13px] hover:underline"
              style={{ color: OVER_MEDIA.text, textUnderlineOffset: 4 }}
            >
              <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
              All categories
            </Link>

            <p className="bp-mono mt-6 text-[11px]" style={{ color: ON_DARK_CYAN }}>
              / Robotics / Hand pose
            </p>

            {/* Two lines, the second carrying the gradient: line one says what
                the product is, line two says what makes it this one. `pb-1`
                because the gradient is a background clipped to the glyphs and
                the line box at 0.98 would shave the descender off "y". */}
            <h1
              id="hp-hero-title"
              className="mt-3.5 text-balance text-[44px] font-medium tracking-tight sm:text-5xl md:text-7xl"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.03em",
                lineHeight: 0.98,
                color: "#ffffff",
              }}
            >
              <span className="block">Hands, measured in 3D.</span>
              <span className="block pb-1" style={GRADIENT_TEXT}>
                Every frame says how.
              </span>
            </h1>

            <p
              className="mt-5 max-w-xl text-[15px] leading-relaxed md:text-base"
              style={{ color: OVER_MEDIA.text }}
            >
              21 joints per hand, in metres, from the two-camera stereo pair of a head-worn rig.
              Every frame is labelled measured, guessed, bridged or no 3D pose.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {/* The primary button is the dark theme's own pair, written as
                  literals: `--sm-text` on `--sm-base`, #EAF0FF on #0E0C24. The
                  tokens would be right if the band followed the theme, but it
                  does not — it is dark in both — and in light mode they invert
                  to an ink pill on a near-black band, which reads as a ghost
                  button beside its neighbour. Not `#ffffff`: globals.css
                  repaints an inline white background as a dark scrim in dark
                  mode, which is how the /samples hero lost its primary button
                  once. */}
              <OpenRecordLink
                slug={FEATURED.slug}
                from="hero"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
                style={{ background: ON_DARK_INK, color: ON_DARK_BASE }}
              >
                Open a sample
                <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </OpenRecordLink>
              <TrackedLink
                href={requestUrl({ from: "hand-pose-hero" })}
                event="handpose_request_click"
                params={{ from: "hand-pose-hero" }}
                className="inline-flex items-center rounded-full px-6 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.34)", color: "#ffffff" }}
              >
                Request access
              </TrackedLink>
            </div>

            {/* Proof, on the footage: what a visitor can do without a form, and
                the claim most worth making on a page about hands that are
                rendered, not filmed. */}
            <ul aria-label="What to expect" className="mt-6 flex flex-wrap gap-2">
              {[
                "Preview without login",
                "Previews are skeleton renders: no camera footage",
                `${HP_AGG.samples} samples, ${HP_AGG.minutes.toFixed(1)} min`,
              ].map((t) => (
                <li
                  key={t}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] backdrop-blur-sm md:py-1.5"
                  style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text, border: "1px solid rgba(255,255,255,0.16)" }}
                >
                  <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: ON_DARK_CYAN }} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* What is on screen. A skeleton render says so in one line; without it
            a reader has no way to know the backdrop is not footage. On a phone
            it sits on the row of the back link, at the foot of the picture,
            rather than at the foot of the hero, where it would be a caption for
            nothing; its width stops short of the link, so at 320px it truncates
            instead of running underneath it. */}
        <p
          className="pointer-events-none absolute right-4 top-[263px] max-w-[calc(100vw-9.5rem)] truncate text-right font-mono text-[10px] tracking-[0.08em] md:bottom-4 md:top-auto md:max-w-[min(60vw,28rem)] lg:right-10 xl:right-16"
          style={{ color: OVER_MEDIA.textDim }}
        >
          {FEATURED.title} · skeleton render
        </p>
      </div>
    </section>
  );
}
