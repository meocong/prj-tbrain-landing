import type { ReactNode } from "react";
import { SamplesDarkDefault } from "./_sections/SamplesDarkDefault";

/**
 * The samples pages default to dark, and still follow the toggle.
 *
 * Tam, 2026-09-12: "để default page màu đen nhé". The word doing the work is
 * *default*: a reader who has actually pressed the toggle has `tbrain-theme` in
 * localStorage, and that still wins here. So the light half of `.samples-scope`
 * — a full second palette, contrast-checked — is not deleted, it just stops
 * being what an arriving reader sees.
 *
 * Two mechanisms, because one cannot cover both arrivals:
 *
 *  - `THEME_INIT` in the root layout reads `location.pathname` before first
 *    paint. That is the only place this can happen without a white flash, and
 *    it handles a direct load or a refresh.
 *  - `SamplesDarkDefault` below handles a client-side navigation INTO these
 *    pages, where no inline script re-runs — and reverses it on the way out, so
 *    /samples does not leave the rest of the site pinned dark.
 *
 * What this replaced: `ForceDarkScope`, which is what `/data/terminal-bench`
 * and `/data/physical-ai` use. That pins the class regardless of the toggle,
 * which is right for a page painted only for a dark backdrop and wrong here —
 * it would make the toggle a no-op on a surface that has both palettes.
 */
export default function SamplesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SamplesDarkDefault />
      {children}
    </>
  );
}
