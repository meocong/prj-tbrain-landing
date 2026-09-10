"use client";

/**
 * Radial 15-hard-rules dashboard — replaces the flat badge grid with a live-looking
 * circular gauge + category breakdown + animated pass counters.
 */
import { motion } from "framer-motion";
import { HARD_RULES } from "@/lib/landing/physical-ai-qc";
import { CountUp } from "@/components/marketing/fx/CountUp";

const CATEGORY_COLOR: Record<string, string> = {
  calibration: "var(--bp-blue)",
  detection:   "var(--bp-cyan)",
  temporal:    "var(--bp-purple)",
  spatial:     "var(--bp-amber)",
  semantic:    "var(--bp-green)",
  provenance:  "var(--bp-pink)",
};

export function RadialRulesDashboard() {
  const total = HARD_RULES.length;
  const passing = total; // sample capture is 15/15 PASS
  const ratio = passing / total;

  // group by category
  const byCat: Record<string, number> = {};
  for (const r of HARD_RULES) byCat[r.category] = (byCat[r.category] ?? 0) + 1;
  const categories = Object.entries(byCat);

  // segments — 15 arc pieces around the ring
  const CX = 110, CY = 110, R = 82;
  const segAngle = 360 / total;
  const gap = 3;

  // Round to fixed precision so the SVG `d` string is byte-identical between the
  // server and client render (raw float precision differs → hydration mismatch).
  const rnd = (n: number) => Math.round(n * 1000) / 1000;
  const polar = (cx: number, cy: number, r: number, angle: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return [rnd(cx + r * Math.cos(a)), rnd(cy + r * Math.sin(a))];
  };

  return (
    <div className="bp-card overflow-hidden" style={{ borderRadius: 16, background: "var(--bp-panel)" }}>
      <div className="bp-mono flex items-center justify-between" style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
        <span>LAYER 1 · HARD RULES · 15 CHECKS · LIVE</span>
        <span style={{ color: "var(--bp-cyan)" }}>live · pick_up_the_cup 20260617T01</span>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Radial gauge */}
        <div className="relative" style={{ width: 220, height: 220, margin: "0 auto" }}>
          <svg viewBox="0 0 220 220" style={{ width: "100%", height: "100%" }}>
            <defs>
              <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" />
              </filter>
            </defs>
            {/* segments */}
            {HARD_RULES.map((r, i) => {
              const a0 = i * segAngle + gap / 2;
              const a1 = (i + 1) * segAngle - gap / 2;
              const [x0, y0] = polar(CX, CY, R, a0);
              const [x1, y1] = polar(CX, CY, R, a1);
              const [x0i, y0i] = polar(CX, CY, R - 14, a0);
              const [x1i, y1i] = polar(CX, CY, R - 14, a1);
              const large = a1 - a0 > 180 ? 1 : 0;
              const path = `M ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} L ${x1i} ${y1i} A ${R - 14} ${R - 14} 0 ${large} 0 ${x0i} ${y0i} Z`;
              const c = CATEGORY_COLOR[r.category];
              return (
                <motion.path
                  key={r.id}
                  d={path}
                  fill={c}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 0.85, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                />
              );
            })}
            {/* center core */}
            <circle cx={CX} cy={CY} r={R - 22} fill="var(--bp-surface)" stroke="var(--bp-line)" strokeWidth="1" />
            {/* pulse ring */}
            <motion.circle
              cx={CX}
              cy={CY}
              r={R - 22}
              fill="none"
              stroke="var(--bp-cyan)"
              strokeWidth="1"
              filter="url(#ring-glow)"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0, 0.7], r: [R - 22, R - 8, R - 22] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
            />
            {/* center numbers */}
            <text x={CX} y={CY - 4} textAnchor="middle" fontFamily="var(--font-heading)" fontSize="40" fontWeight="700" fill="var(--bp-cyan)">{passing}/{total}</text>
            <text x={CX} y={CY + 20} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--bp-ink-faint)" letterSpacing="0.14em">PASS · {(ratio * 100).toFixed(0)}%</text>
          </svg>
        </div>

        {/* Category legend + counts */}
        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            categories · gate composition
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {categories.map(([cat, cnt], i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                style={{
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1px solid ${CATEGORY_COLOR[cat]}55`,
                  background: `color-mix(in srgb, ${CATEGORY_COLOR[cat]} 6%, transparent)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="bp-mono" style={{ fontSize: 11, color: CATEGORY_COLOR[cat], letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>{cat}</span>
                  <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-dim)" }}>
                    <CountUp value={cnt} duration={1.2} />/{cnt}
                  </span>
                </div>
                <div className="mt-1.5" style={{ height: 3, background: "var(--bp-line)", borderRadius: 2, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.9, delay: 0.15 + i * 0.05, ease: "easeOut" }}
                    style={{ height: "100%", background: CATEGORY_COLOR[cat] }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bp-mono mt-4 flex flex-wrap items-center gap-3" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>
            <span style={{ color: "var(--bp-cyan)" }}>● 15 · pass</span>
            <span>· 0 partial · 0 fail</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>reject rate global 22%</span>
            <span style={{ opacity: 0.4 }}>|</span>
            <span>provenance · git 1b0cce1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
