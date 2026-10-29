"use client";

import { useEffect } from "react";

type Gtag = (command: "event", name: string, params?: Record<string, unknown>) => void;

/**
 * One delegated listener for the careers pages' conversion clicks: any element
 * with `data-cr-track="<event>"` (and optional `data-cr-where`) sends a GA
 * event. Dropped silently when gtag is absent, which is also what happens
 * before analytics consent, since Ga4 only loads after it.
 */
export function TrackClicks({ page }: { page: string }) {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-cr-track]");
      if (!el) return;
      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (typeof gtag !== "function") return;
      gtag("event", el.dataset.crTrack!, { page, where: el.dataset.crWhere });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [page]);
  return null;
}
