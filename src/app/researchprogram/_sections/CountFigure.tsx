"use client";

/**
 * A figure that counts up the first time it scrolls into view.
 *
 * The server renders the real number, so it is right with no JS, in a crawl,
 * and for a reader who lands with it already on screen (then it just stays).
 * Only a figure that starts below the fold is reset to 0 and counted up —
 * that reset happens off-screen, so nobody sees the swap. Screen readers get
 * the final value once; the ticking digits are aria-hidden.
 */
import { useEffect, useRef } from "react";
import { animate } from "framer-motion";
import { prefersReducedMotion } from "@/lib/motion-pref";

export function CountFigure({ value, prefix = "", suffix = "", className, style }: { value: number; prefix?: string; suffix?: string; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const fmt = (n: number) => `${prefix}${n.toLocaleString("en-US")}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return;
    el.textContent = fmt(0);
    let stop: (() => void) | undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const c = animate(0, value, {
          duration: 1.6,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: (v) => {
            el.textContent = fmt(Math.round(v));
          },
        });
        stop = () => c.stop();
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop?.();
      el.textContent = fmt(value);
    };
    // fmt is derived from the props listed; re-running on its identity would restart the count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefix, suffix]);

  return (
    <span className={className} style={style}>
      <span className="sr-only">{fmt(value)}</span>
      <span ref={ref} aria-hidden style={{ fontVariantNumeric: "tabular-nums" }}>
        {fmt(value)}
      </span>
    </span>
  );
}
