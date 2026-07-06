"use client";

import { CountUp } from "@/components/marketing/fx/CountUp";

const STATS: { k: string; v: number; suffix?: string; sub: string }[] = [
  { k: "Models · auto-label pipeline",  v: 8,   sub: "Hand · body · masks · depth · verb-noun" },
  { k: "Hard rules · per capture",       v: 15,  sub: "Machine-checkable QC gate" },
  { k: "Ship rate · after QC",           v: 92,  suffix: "%", sub: "Auto-accept + Label Studio + reviewer" },
  { k: "Delivery latency",               v: 48,  suffix: "h", sub: "Raw → LeRobot v2 · zero-trust" },
];

export function GlanceStats() {
  return (
    <section className="bp-grid" style={{ borderBottom: "1px solid var(--bp-line)", paddingTop: 40, paddingBottom: 40, background: "color-mix(in srgb, var(--bp-cyan) 3%, transparent)" }}>
      <div className="container mx-auto grid grid-cols-2 gap-6 px-5 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.k} className="text-center lg:text-left">
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(32px, 4.4vw, 52px)", fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em", color: "var(--bp-cyan)" }}>
              <CountUp value={s.v} duration={1.6} />{s.suffix ?? ""}
            </div>
            <div className="bp-mono mt-2" style={{ fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--bp-ink-faint)" }}>{s.k}</div>
            <div className="mt-1" style={{ fontSize: 12.5, color: "var(--bp-ink-dim)" }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
