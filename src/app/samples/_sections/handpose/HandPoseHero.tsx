import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { HP_AGG, fmtPct } from "@/lib/samples/handpose";
import { requestUrl } from "@/lib/samples/request-link";
import { OVER_MEDIA } from "../tokens";
import { GRADIENT_TEXT, HeroWash } from "../HeroWash";
import { JOINTS_PER_HAND } from "./page-data";
import { HashLink, TrackedLink } from "./page-links";

/**
 * The page's hero: a headline, one line of what the set is, and four figures.
 * No footage here. The viewer is the next thing on the page, and the first
 * screen's job is to say what it is looking at and get out of the way of it.
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

const FIGURES: { value: string; unit?: string; label: string }[] = [
  { value: String(HP_AGG.samples), label: "Samples" },
  { value: HP_AGG.minutes.toFixed(1), unit: "min", label: "Total duration" },
  { value: String(JOINTS_PER_HAND), label: "Joints per hand" },
  { value: fmtPct(HP_AGG.measuredOfDeliveredPct), label: "Measured, of delivered hand-frames" },
];

export function HandPoseHero() {
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
        <HeroWash className="-z-10" />

        <div className="mx-auto max-w-[1400px] px-4 pb-8 pt-[92px] md:pb-9 md:pt-[104px] lg:px-10 xl:px-16">
          <Link
            href="/samples"
            className="inline-flex items-center gap-2 py-1 text-[13px] hover:underline"
            style={{ color: OVER_MEDIA.text, textUnderlineOffset: 4 }}
          >
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            All categories
          </Link>

          <div className="mt-3 grid gap-x-12 gap-y-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="bp-mono text-[11px]" style={{ color: ON_DARK_CYAN }}>
                / Robotics / Hand pose
              </p>
              {/* Two lines, the second carrying the gradient. `pb-1` because the
                  gradient is a background clipped to the glyphs and the line box
                  would shave the descender off "y". */}
              <h1
                id="hp-hero-title"
                className="mt-3 text-balance text-[36px] font-medium tracking-tight sm:text-5xl"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 0.98, color: "#ffffff" }}
              >
                <span className="block">Hands, measured in 3D.</span>
                <span className="block pb-1" style={GRADIENT_TEXT}>
                  Every frame says how.
                </span>
              </h1>
              <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed" style={{ color: OVER_MEDIA.text }}>
                21 joints per hand, in metres, from the two-camera stereo pair of a head-worn rig. Every frame is
                labelled measured, guessed, bridged or no 3D pose. Play any recording below.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
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
                  className="inline-flex items-center rounded-full px-6 py-3 text-sm font-semibold transition-colors hover:bg-white/10"
                  style={{ border: "1px solid rgba(255,255,255,0.34)", color: "#ffffff" }}
                >
                  Request access
                </TrackedLink>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:grid-cols-2">
              {FIGURES.map((f) => (
                <div key={f.label} className="flex flex-col pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}>
                  <dt className="bp-mono order-2 mt-2 text-[10px] leading-snug" style={{ color: OVER_MEDIA.textDim }}>
                    {f.label}
                  </dt>
                  <dd className="order-1 font-mono text-[30px] leading-none tracking-tight md:text-[34px]" style={{ color: "#ffffff" }}>
                    {f.value}
                    {f.unit ? (
                      <small className="ml-1 text-[0.5em] tracking-normal" style={{ color: OVER_MEDIA.text }}>
                        {f.unit}
                      </small>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
