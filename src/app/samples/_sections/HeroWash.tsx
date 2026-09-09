import type { CSSProperties, ReactNode } from "react";

/**
 * The `/data/physical-ai` hero treatment, lifted rather than reimplemented.
 *
 * Tam, 2026-09-09: "để gradient vv giống như trang physical AI ... clone style
 * y hệt em nhé". So the numbers here are that page's numbers, copied from
 * `HeroPhysical.tsx` — the two radial washes at 0.26 and 0.22, the 80px grid at
 * 4% white, the same ellipse mask, the same 120deg headline ramp. Changing one
 * of them here silently un-clones the thing this file exists to clone.
 *
 * One thing does NOT carry over. Physical AI is dark-only; these pages follow
 * the site theme toggle. The values below are safe in both anyway because both
 * samples heroes sit on top of video — `HeroMosaic` on the front door,
 * `CategoryHeader`'s reel on the six category pages — so the backdrop is dark
 * footage in either theme, not the page base. Do not reach for these on a
 * section that paints straight onto `--sm-base`: `mixBlendMode: screen` over a
 * near-white base does nothing, and a 4% white grid on it is invisible.
 *
 * Lives in one file because it is used twice. The first version had it pasted
 * into both heroes, which is two places for a treatment that is supposed to
 * match a third.
 */

/** Emerald first, violet second — the order the reference paints them. */
const WASH =
  "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(16,185,129,0.26) 0%, transparent 55%)," +
  "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(108,60,244,0.22) 0%, transparent 55%)";

const GRID =
  "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)," +
  "linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)";

/**
 * Both backdrop layers. Absolutely positioned, so the caller needs a
 * `relative` ancestor.
 *
 * `className` exists for the stacking level and nothing else. Both callers pass
 * `-z-10`, matching the scrims these layers sit beside: the wash has to land on
 * top of the footage and underneath the headline, and a layer with no z-index
 * at all covers the copy.
 */
export function HeroWash({ className = "" }: { className?: string }) {
  return (
    <>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{ background: WASH, mixBlendMode: "screen" }}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{
          backgroundImage: GRID,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />
    </>
  );
}

/**
 * The gradient headline stop.
 *
 * Deliberately a fragment of a heading and not a whole one: the reference sets
 * "Human motion data for training" in plain white and gradients only the word
 * "humanoids." A headline that is gradient end to end reads as decoration; one
 * word carrying it reads as emphasis.
 *
 * `textShadow` under transparent fill is not a typo — it renders behind the
 * clipped text and is what gives the word its glow on the reference page.
 */
export const GRADIENT_TEXT: CSSProperties = {
  background: "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 40%, #10B981 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textShadow: "0 0 42px rgba(108,60,244,0.55)",
};

export function GradientWord({ children }: { children: ReactNode }) {
  return <span style={GRADIENT_TEXT}>{children}</span>;
}
