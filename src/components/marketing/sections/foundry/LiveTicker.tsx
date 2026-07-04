"use client";

import { AVAILABILITY } from "@/lib/landing/physical-ai";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { Sheet, SheetHeading, FigLabel } from "@/components/marketing/blueprint/kit";

export function LiveTicker() {
  const combined = [
    ...AVAILABILITY.delivered.stats.map((s) => ({ ...s, tier: "delivered" as const })),
    ...AVAILABILITY.capacity.stats.map((s) => ({ ...s, tier: "capacity" as const })),
  ];

  return (
    <Sheet id="live-ticker" fig={AVAILABILITY.fig} axis={false}>
      <SheetHeading title={AVAILABILITY.title} lead={AVAILABILITY.lead} />

      <div className="mt-6 bp-card" style={{ padding: 0, borderRadius: 12, overflow: "hidden" }}>
        <div className="flex items-center gap-2 flex-wrap" style={{ padding: "10px 14px", borderBottom: "1px solid var(--bp-line)" }}>
          <FigLabel>DELIVERED</FigLabel>
          <span className="bp-status bp-status-mov" style={{ fontSize: 9 }}>LIVE</span>
          <span style={{ marginLeft: "auto" }}>
            <FigLabel>CAPACITY 2026 ·</FigLabel>
          </span>
          <span className="bp-status bp-status-stby" style={{ fontSize: 9 }}>PLAN</span>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
          {combined.map((s, i) => {
            const accent = s.tier === "delivered" ? "var(--bp-cyan)" : "var(--bp-amber)";
            const isRowStart = i % 4 === 0;
            const isTop = i < 4;
            return (
              <div
                key={s.k + i}
                style={{
                  padding: "14px 16px",
                  borderTop: !isTop ? "1px solid var(--bp-line)" : "none",
                  borderLeft: !isRowStart ? "1px solid var(--bp-line)" : "none",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px,2.6vw,32px)", fontWeight: 600, letterSpacing: "-0.02em", color: accent, lineHeight: 1 }}>
                  <CountUp value={s.value} suffix={s.suffix} duration={1.4} />
                </div>
                <div className="mt-1.5 bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {s.k}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>
        SRC · model registry · LeRobot export · capture ledger
      </p>
    </Sheet>
  );
}
