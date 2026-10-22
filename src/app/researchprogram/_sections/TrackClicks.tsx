"use client";

import { useEffect } from "react";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/**
 * One delegated listener for the page's conversion clicks: any element with
 * `data-rs-track="<event>"` (and optional `data-rs-where`) sends a GA event.
 * Dropped silently when gtag is absent, which is also what happens before
 * analytics consent, since Ga4 only loads after it.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-rs-track]");
      if (!el) return;
      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (typeof gtag !== "function") return;
      gtag("event", el.dataset.rsTrack!, { page: "researchprogram", where: el.dataset.rsWhere });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
