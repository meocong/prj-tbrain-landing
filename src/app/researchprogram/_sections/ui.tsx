/**
 * Shared presentation for /researchprogram. Server-safe (no hooks); everything reads
 * the theme-aware `--bp-*` tokens, so each piece renders in light and dark.
 */
import type { CSSProperties, ReactNode } from "react";

/** Same measure as the header bar, so section edges line up with the logo. */
export function Container({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative z-10 mx-auto w-full max-w-7xl px-6 md:px-8 ${className}`} style={style}>
      {children}
    </div>
  );
}

export const SECTION_PAD: CSSProperties = {
  paddingTop: "clamp(64px, 8vw, 112px)",
  paddingBottom: "clamp(64px, 8vw, 112px)",
};

/** Section number + hairline, the page's one recurring wayfinding mark. */
export function SectionMark({ index, className = "" }: { index: string; className?: string }) {
  return (
    <div className={`bp-mono flex items-center gap-3 ${className}`} style={{ fontSize: 11, color: "var(--bp-cyan)" }}>
      <span aria-hidden>§ {index}</span>
      <span aria-hidden style={{ width: 40, height: 1, background: "currentColor", opacity: 0.5 }} />
    </div>
  );
}

export function H2({ children, id, className = "", style }: { children: ReactNode; id?: string; className?: string; style?: CSSProperties }) {
  return (
    <h2
      id={id}
      className={`font-semibold ${className}`}
      style={{
        fontFamily: "var(--font-heading)",
        fontSize: "clamp(32px, 4.4vw, 56px)",
        lineHeight: 1.02,
        letterSpacing: "-0.03em",
        color: "var(--bp-ink)",
        textWrap: "balance",
        ...style,
      }}
    >
      {children}
    </h2>
  );
}

/** Uppercase mono caption used for card labels and meta rows. */
export function Mono({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span className={`bp-mono ${className}`} style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", ...style }}>
      {children}
    </span>
  );
}

/** "when do more tasks…" → "When do more tasks…" — the brief writes these as
    the tail of a "Topic: question" line; on a card the question stands alone. */
export function sentenceCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function mailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** Hero entrance, staggered by `i`. CSS-driven (research.css `.rs-rise`), so
    it needs no hydration and stills itself under reduced motion / pause. */
export function Rise({ children, i = 0, y, className = "" }: { children: ReactNode; i?: number; y?: number; className?: string }) {
  const style = { animationDelay: `${80 + i * 80}ms`, ...(y ? { "--rs-rise-y": `${y}px` } : {}) } as CSSProperties;
  return (
    <div className={`rs-rise ${className}`} style={style}>
      {children}
    </div>
  );
}
