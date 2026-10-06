import type { CSSProperties, ReactNode } from "react";
import { C } from "../tokens";

/**
 * Layout atoms for the /samples/hand-pose page.
 *
 * The page is eleven sections long and every one of them opens the same way:
 * a mono eyebrow, a two-tone headline, sometimes a lede. Written out in each
 * file that would be eleven copies of the same four classes, and the first
 * time one of them drifted the page would stop reading as one thing. Server
 * safe: no hooks, so a section that needs no state stays a server component.
 */

/** The gutter every samples section uses: CaptureSpec, MocapDemo, AccessPaths. */
export const WRAP = "mx-auto max-w-[1400px] px-4 lg:px-10 xl:px-16";

/** The heading face and ramp the samples pages set display type in. */
export const HEADING: CSSProperties = {
  fontFamily: "var(--font-heading)",
  letterSpacing: "-0.03em",
  lineHeight: 1.06,
};

/**
 * `paper` is graph paper with the corner ticks, `band` a flat tint, `plain` the
 * page base, and `closing` the paper on the band tint, which is how AccessPaths
 * ends the other category pages. They alternate down the page so a long run of
 * tables and charts reads as sections rather than as one slab.
 */
export type Tone = "paper" | "band" | "plain" | "closing";

export function PageSection({
  id,
  tone = "paper",
  labelledBy,
  className = "",
  padding = "py-9 md:py-[72px]",
  children,
}: {
  /** Also the hash target: `#legend`, `#compare`, … */
  id?: string;
  tone?: Tone;
  /** The id of the section's heading, so the region is announced by name. */
  labelledBy?: string;
  className?: string;
  /** Vertical padding inside the gutter. A section that hands over to another block overrides it. */
  padding?: string;
  children: ReactNode;
}) {
  const paper = tone === "paper" || tone === "closing";
  const flat = tone === "band";
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      /* `scroll-mt-20` because the header is fixed: without it a hash jump
         lands the eyebrow under the bar. */
      className={`relative scroll-mt-20 ${paper || flat ? "bp-grid" : ""} ${paper ? "bp-frame" : ""} ${className}`}
      style={{
        color: C.text,
        ...(flat || tone === "closing" ? { backgroundColor: C.band } : null),
        ...(tone === "plain" ? { backgroundColor: C.base } : null),
        // A flat band still carries `.bp-grid`, for what that class does besides
        // draw the paper: inside it the focus ring is the blueprint teal
        // (2.8 to 5.4:1) rather than the global violet at half strength
        // (1.7 to 2.2:1), and links and buttons get a pointer. The paper itself
        // is switched off.
        ...(flat ? { backgroundImage: "none", animation: "none" } : null),
      }}
    >
      {/* The default padding is tighter on a phone: in the first draft the page
          ran to nearly 20,000px at 390 wide, and much of that was padding
          around short blocks. */}
      <div className={`${WRAP} ${padding}`}>{children}</div>
    </section>
  );
}

/** The small mono label above a headline. A label, not a heading: the headline is the h2. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="bp-mono text-[10px]" style={{ color: C.textDim }}>
      {children}
    </p>
  );
}

/**
 * Eyebrow, then the two-tone headline: the lead in full strength, the rest in
 * `textDim`, which is the codebase's way of weighting the second half of a
 * sentence (AccessPaths, RigViews). The headline is the section's h2.
 */
export function SectionHead({
  id,
  eyebrow,
  lead,
  dim,
  children,
}: {
  id: string;
  eyebrow: string;
  lead: ReactNode;
  dim?: ReactNode;
  /** A lede, or anything else that belongs to the heading block. */
  children?: ReactNode;
}) {
  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 id={id} className="mt-3.5 text-balance text-[28px] font-medium md:text-5xl" style={HEADING}>
        {lead}
        {dim ? (
          <>
            {" "}
            <span style={{ color: C.textDim }}>{dim}</span>
          </>
        ) : null}
      </h2>
      {children}
    </div>
  );
}

export function Lede({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`mt-4 max-w-2xl text-[15px] leading-[1.65] md:mt-5 ${className}`} style={{ color: C.textMid }}>
      {children}
    </p>
  );
}

/** A table head cell in the site's microtype. */
export const TH_CLASS = "bp-mono text-[10px] font-normal";

/** A hairline rule across the top of a block: the At a glance tiles, the cards and the list rows. */
export const HAIRLINE_TOP: CSSProperties = { borderTop: `1px solid ${C.hairline}` };

/**
 * A neutral, OPAQUE mid-tone for a swatch that stands for no particular hand.
 * `C.textMid` is the obvious choice and is wrong here: in dark it is a
 * translucent white, and the lane's dashed track line shows through a solid
 * fill drawn in it, so "measured" looked half-empty.
 */
export const NEUTRAL_INK = "color-mix(in srgb, var(--sm-text) 62%, var(--sm-base))";
