"use client";

import { useEffect } from "react";

/**
 * Dark by default on /samples, for the arrival the inline script cannot see.
 *
 * `THEME_INIT` in the root layout handles a direct load: it reads
 * `location.pathname` before first paint, so a reader landing on /samples never
 * sees a white frame. It runs once, though, and a client-side navigation from
 * `/` into `/samples` does not re-run it — without this, following a nav link
 * lands on the light palette while a refresh of the same URL is dark.
 *
 * Reverses on unmount, and that is the half worth being careful about: without
 * it, visiting /samples once would leave every other page dark for the rest of
 * the session, which is /samples deciding the theme for a site it does not own.
 *
 * `THEME_KEY` present means the reader pressed the toggle. Then this does
 * nothing at all, in either direction — that is the whole difference between a
 * default and a force, and it is why `.samples-scope` keeps its light palette.
 */
const THEME_KEY = "tbrain-theme";

function osPrefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

function apply(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function SamplesDarkDefault() {
  useEffect(() => {
    let chosen: string | null = null;
    try {
      chosen = window.localStorage.getItem(THEME_KEY);
    } catch {
      // Private mode or a blocked store. Treat it as "no choice recorded" and
      // default dark, which is the same answer the inline script reaches.
    }
    if (chosen != null) return;

    apply(true);
    return () => apply(osPrefersDark());
  }, []);

  return null;
}
