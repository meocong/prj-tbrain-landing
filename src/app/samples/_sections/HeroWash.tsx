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
 * the site theme toggle. The two WASH/GRID layers are safe in both anyway
 * because both samples heroes sit on top of video — `HeroMosaic` on the front
 * door, `CategoryHeader`'s reel on the six category pages — so the backdrop is
 * dark footage in either theme, not the page base. Do not reach for these on a
 * section that paints straight onto `--sm-base`: `mixBlendMode: screen` over a
 * near-white base does nothing, and a 4% white grid on it is invisible.
 *
 * The headline ramp is the exception and does not get theme tokens at all —
 * see the comment above `ON_DARK_PURPLE`.
 *
 * Lives in one file because it is used twice. The first version had it pasted
 * into both heroes, which is two places for a treatment that is supposed to
 * match a third.
 */

/** Cyan first, purple second — the two accents blueprint.css actually carries. */
const WASH =
  "radial-gradient(ellipse 90% 70% at 20% 30%, color-mix(in srgb, var(--bp-cyan) 26%, transparent) 0%, transparent 55%)," +
  "radial-gradient(ellipse 80% 60% at 80% 70%, color-mix(in srgb, var(--bp-purple) 22%, transparent) 0%, transparent 55%)";

/** `--bp-grid-line` rather than a white literal: it is teal-tinted in dark and
    ink-tinted in light, which a hardcoded `rgba(255,255,255,0.04)` cannot be. */
const GRID =
  "linear-gradient(var(--bp-grid-line) 1px, transparent 1px)," +
  "linear-gradient(90deg, var(--bp-grid-line) 1px, transparent 1px)";

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
 * The accent ramp, as literals rather than `var(--bp-*)`.
 *
 * This is the one place in these pages that must NOT read the theme tokens,
 * and it is the exception the header comment above sets up. The washes can use
 * them because they are `mixBlendMode: screen` over footage — a dark teal
 * screened onto a dark frame still lightens it. Clipped text has no blend
 * mode: the glyph is filled with the literal colour, so whatever the token
 * says is what the reader sees.
 *
 * In light mode those tokens are deliberately darkened to clear 4.5:1 ON PAPER
 * — `--bp-cyan-strong` is #04574F, a near-black teal. Both callers of this
 * style paint onto dark video, never onto paper, so in light mode the headline
 * was near-black-on-black: the back half of "or collected to your spec." on
 * /samples, and the category name on all six category headers, faded into the
 * footage. Same dark-on-dark fault the hero scrim comment on blueprint.css:47
 * records, arriving through the text fill instead of the scrim.
 *
 * These are the dark-theme values of `--bp-purple`, `--bp-cyan-strong` and
 * `--bp-cyan`. They are correct in BOTH themes here because the backdrop is
 * footage in both. If a caller ever puts this on `--sm-base`, it needs a
 * different ramp, not these tokens back.
 */
const ON_DARK_PURPLE = "#8B6CF6";
const ON_DARK_CYAN_STRONG = "#22E3C8";
const ON_DARK_CYAN = "#00E5C7";

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
  background: `linear-gradient(120deg, ${ON_DARK_PURPLE} 0%, ${ON_DARK_CYAN_STRONG} 55%, ${ON_DARK_CYAN} 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  textShadow: `0 0 42px color-mix(in srgb, ${ON_DARK_PURPLE} 55%, transparent)`,
};

export function GradientWord({ children }: { children: ReactNode }) {
  return <span style={GRADIENT_TEXT}>{children}</span>;
}
