"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { setMotionPaused, useMotionPaused, wireMotionPause } from "@/lib/motion-pref";

/**
 * Pause / resume every animation on the site — WCAG 2.2.2. Sits beside the
 * theme toggle in the header, so it is among the first things a keyboard
 * reaches on every page. See src/lib/motion-pref.ts.
 */
export function MotionToggle() {
  const paused = useMotionPaused();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    wireMotionPause();
    const sync = () => setIsDark(document.documentElement.classList.contains("dark"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const label = paused ? "Play animations" : "Pause animations";
  return (
    <button
      type="button"
      onClick={() => setMotionPaused(!paused)}
      aria-pressed={paused}
      aria-label={label}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:border-[#6C3CF4]"
      style={{
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.86)",
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)",
        color: isDark ? "#F8FAFC" : "#0F172A",
      }}
    >
      {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
    </button>
  );
}
