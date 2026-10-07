import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { categoryBySlug } from "@/lib/samples/categories";
import { HP_AGG, fmtPct } from "@/lib/samples/handpose";
import { requestUrl } from "@/lib/samples/request-link";
import { OVER_MEDIA } from "../tokens";
import { GRADIENT_TEXT, HeroWash } from "../HeroWash";
import { HeroFootage } from "./HeroFootage";
import { HeroCount, HeroFootageIn, HeroRise } from "./hero-motion";
import { FEATURED, JOINTS_PER_HAND, pad2 } from "./page-data";
import { HashLink, TrackedLink } from "./page-links";

/**
 * The page's hero: a headline, one line of what the set is, two actions, and the
 * four figures in a strip along the bottom. Behind it, on the right, the featured
 * sample's camera video with the hand pose drawn over it (the category's
 * `faceMedia`, faces blurred), faded into the band so the headline reads on it.
 *
 * The band is dark in BOTH themes, which is what keeps the header white over it
 * (`categoryHeroIsDark`), so every colour in it is a literal: the page tokens
 * would invert in light mode and turn the band's text dark on dark.
 */

/** The base the washes sit on; the same 6,8,14 the sample heroes use. */
const HERO_BASE = "#06080E";
/** The dark-theme cyan, as a literal: this text sits on a band that is dark in both themes. */
const ON_DARK_CYAN = "#22E3C8";
/** The dark theme's ink and base, for the primary button on a band that is dark in both. */
const ON_DARK_INK = "#EAF0FF";
const ON_DARK_BASE = "#0E0C24";

/** `value` is what is read and indexed; `num` is what counts up on screen. */
const FIGURES: { value: string; num: number; decimals?: 0 | 1; suffix?: string; unit?: string; label: string }[] = [
  { value: String(HP_AGG.samples), num: HP_AGG.samples, label: "Samples" },
  { value: HP_AGG.minutes.toFixed(1), num: HP_AGG.minutes, decimals: 1, unit: "min", label: "Total duration" },
  { value: String(JOINTS_PER_HAND), num: JOINTS_PER_HAND, label: "Joints per hand" },
  {
    value: fmtPct(HP_AGG.measuredOfDeliveredPct),
    num: HP_AGG.measuredOfDeliveredPct,
    decimals: 1,
    suffix: "%",
    label: "Measured, of delivered hand-frames",
  },
];

/** Base as r,g,b, for the fades that melt the footage into the band. */
const BASE_RGB = "6,8,14";

export function HandPoseHero() {
  const media = categoryBySlug("hand-pose")?.faceMedia ?? null;
  return (
    // `bp-grid` for its focus ring, as the flat bands below carry it. The ring is
    // the cyan the text on this band uses, set here as a literal: the token is a
    // dark teal in light mode, which would be a dark outline on a near-black
    // band. The paper `bp-grid` also draws is covered by the band's background.
    <section
      aria-labelledby="hp-hero-title"
      className="bp-grid relative"
      style={{ animation: "none", ["--bp-focus-ring" as string]: ON_DARK_CYAN } as CSSProperties}
    >
      <div className="relative isolate overflow-hidden" style={{ background: HERO_BASE }}>
        <HeroWash className="-z-20" />

        {media && (
          <div aria-hidden className="hp-hero-footage absolute inset-y-0 right-0 -z-10 w-full lg:w-[64%]">
            <HeroFootageIn>
              <HeroFootage src={media.clip} poster={media.poster} position={media.position} />
            </HeroFootageIn>
            {/* Phone and tablet: the footage sits behind the text, so it is
                dimmed whole. From lg it is masked to transparent on its left
                (globals.css, .hp-hero-footage), so the band's glow shows
                through instead of meeting an opaque edge. */}
            <div className="absolute inset-0 lg:hidden" style={{ background: `rgba(${BASE_RGB},0.74)` }} />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, rgba(${BASE_RGB},0.55) 0%, rgba(${BASE_RGB},0) 22%, rgba(${BASE_RGB},0) 62%, rgb(${BASE_RGB}) 100%)`,
              }}
            />
          </div>
        )}

        <div className="mx-auto flex max-w-[1400px] flex-col px-4 pt-[92px] md:pt-[108px] lg:min-h-[min(80svh,760px)] lg:px-10 xl:px-16">
          <Link
            href="/samples"
            className="inline-flex w-fit items-center gap-2 py-1 text-[13px] hover:underline"
            style={{ color: OVER_MEDIA.text, textUnderlineOffset: 4 }}
          >
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            All categories
          </Link>

          <div className="mt-8 max-w-[50rem] md:mt-12 lg:my-auto lg:py-10">
            <HeroRise as="div" delay={0.05} className="block">
            <p
              className="bp-mono inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10.5px]"
              style={{ color: ON_DARK_CYAN, background: "rgba(34,227,200,0.08)", border: "1px solid rgba(34,227,200,0.28)" }}
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: ON_DARK_CYAN, boxShadow: `0 0 10px ${ON_DARK_CYAN}` }} />
              Robotics · Hand pose
            </p>
            </HeroRise>
            {/* Two lines, the second carrying the gradient. `pb-2` because the
                gradient is a background clipped to the glyphs and the line box
                would shave the descender off "y". */}
            <h1
              id="hp-hero-title"
              className="mt-5 text-[40px] font-medium sm:text-[58px] lg:text-[64px] xl:text-[72px]"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.045em", lineHeight: 0.96, color: "#ffffff" }}
            >
              {/* Spaces between the lines, so the heading's text reads as one sentence. */}
              <HeroRise delay={0.12} y={28}>Hands, measured</HeroRise>{" "}
              <HeroRise delay={0.2} y={28}>in 3D.</HeroRise>{" "}
              <HeroRise delay={0.3} y={28} className="block pb-2 lg:whitespace-nowrap" style={GRADIENT_TEXT}>
                Every frame says how.
              </HeroRise>
            </h1>
            <HeroRise as="div" delay={0.42}>
            <p className="mt-5 max-w-[34rem] text-[15px] leading-relaxed md:text-[16px]" style={{ color: OVER_MEDIA.text }}>
              {JOINTS_PER_HAND} joints per hand, in metres, from the two-camera stereo pair of a head-worn rig. Every frame is
              labelled measured, guessed, bridged or no 3D pose.
            </p>
            </HeroRise>

            <HeroRise as="div" delay={0.52} className="mt-7 flex flex-wrap items-center gap-3">
              {/* Not `#ffffff` for the fill: globals.css repaints an inline white
                  background as a dark scrim in dark mode. The dark theme's own pair. */}
              <HashLink
                id="samples"
                className="group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform active:scale-[0.98]"
                style={{ background: ON_DARK_INK, color: ON_DARK_BASE }}
              >
                Open the viewer
                <ArrowDown aria-hidden className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </HashLink>
              <TrackedLink
                href={requestUrl({ from: "hand-pose-hero" })}
                event="handpose_request_click"
                params={{ from: "hand-pose-hero" }}
                className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.34)", color: "#ffffff" }}
              >
                Request access
              </TrackedLink>
            </HeroRise>
          </div>

          {media && (
            <HeroRise as="div" delay={0.9} y={8} className="mt-8 hidden self-end lg:block">
            <p
              className="bp-mono text-right text-[10px] leading-relaxed"
              style={{ color: OVER_MEDIA.textDim }}
            >
              Sample {pad2(FEATURED.n)} · {FEATURED.title}
              <br />
              Camera video, hand pose drawn over it, faces blurred
            </p>
            </HeroRise>
          )}

          <HeroRise as="div" delay={0.62} y={12}>
          <dl
            className="mt-8 grid grid-cols-2 border-t sm:grid-cols-4 lg:mt-4"
            style={{ borderColor: "rgba(255,255,255,0.14)" }}
          >
            {FIGURES.map((f, i) => (
              <div
                key={f.label}
                className={`flex flex-col py-5 pr-4 sm:py-6 ${i > 0 ? "sm:border-l sm:pl-6" : ""} ${i % 2 === 1 ? "border-l pl-4 sm:pl-6" : ""}`}
                style={{ borderColor: "rgba(255,255,255,0.14)" }}
              >
                <dt className="bp-mono order-2 mt-2 text-[10px] leading-snug" style={{ color: OVER_MEDIA.textDim }}>
                  {f.label}
                </dt>
                <dd className="order-1 font-mono text-[28px] leading-none tracking-tight md:text-[34px]" style={{ color: "#ffffff" }}>
                  {/* The figure itself for readers and the index; the count is a picture of it. */}
                  <span className="sr-only">{f.value}</span>
                  <span aria-hidden>
                    <HeroCount value={f.num} decimals={f.decimals} suffix={f.suffix} />
                  </span>
                  {f.unit ? (
                    <small className="ml-1 text-[0.5em] tracking-normal" style={{ color: OVER_MEDIA.text }}>
                      {f.unit}
                    </small>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
          </HeroRise>
        </div>
      </div>
    </section>
  );
}
