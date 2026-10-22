"use client";

import { useLayoutEffect } from "react";

/**
 * Drives `.rs-reveal` → `.rs-in` (see motion.tsx for the whole scheme).
 *
 * On a client-side navigation into the page the inline `rs-js` script never
 * ran, so this adds it — in a layout effect, after first marking whatever is
 * already on screen as revealed, so nothing visible blinks out.
 */
export function RevealObserver() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".rs-reveal"));
    const vh = window.innerHeight;

    if (!root.classList.contains("rs-js")) {
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) el.classList.add("rs-in");
      }
      root.classList.add("rs-js");
    }
    root.classList.add("rs-io");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("rs-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    els.forEach((el) => {
      if (!el.classList.contains("rs-in")) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return null;
}
