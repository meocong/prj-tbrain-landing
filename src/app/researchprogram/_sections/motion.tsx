/**
 * Scroll-entrance motion for /researchprogram, done as progressive
 * enhancement: content is visible by default (no JS, crawlers, print), and
 * only hidden-then-revealed once the page has said JS is running.
 *
 *  - The page's inline script adds `html.rs-js` before the sections paint.
 *  - <RevealObserver/> (client) adds `html.rs-io`, then `.rs-in` to each
 *    `.rs-reveal` as it enters the viewport.
 *  - If the observer never starts (a failed chunk), a CSS failsafe reveals
 *    everything after 2.5s. Reduced motion, the header's pause switch and
 *    print all force the still, visible state (research.css).
 *
 * Reveal / Stagger / StaggerItem stay server components; only the observer
 * ships JS.
 */
import type { CSSProperties, ReactNode } from "react";

export { RevealObserver } from "./RevealObserver";

export const RS_JS_INIT = "document.documentElement.classList.add('rs-js')";

export function Reveal({ children, delay = 0, className = "", y }: { children: ReactNode; delay?: number; className?: string; y?: number }) {
  const style = { "--rs-d": `${delay}s`, ...(y !== undefined ? { "--rs-y": `${y}px` } : {}) } as CSSProperties;
  return (
    <div className={`rs-reveal ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Kept as a component so call sites read as a group; the stagger itself is
    each item's `i`. */
export function Stagger({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({ children, className = "", i = 0 }: { children: ReactNode; className?: string; i?: number }) {
  return (
    <Reveal className={className} delay={i * 0.07} y={22}>
      {children}
    </Reveal>
  );
}
