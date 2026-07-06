"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { HARD_RULES, HUMAN_QC, QC_DELTA } from "@/lib/landing/physical-ai-qc";

const CATEGORY_COLOR: Record<string, string> = {
  calibration: "#4cb5ff",
  detection:   "#00e5c7",
  temporal:    "#a78bfa",
  spatial:     "#ff9a4d",
  semantic:    "#5ee08a",
  provenance:  "#f0a2ff",
};

export function QCFlow() {
  return (
    <Sheet id="qc" fig="FIG.06 — QC · HARD RULES + AI + HUMAN" axis>
      <SheetHeading
        title="Zero-trust QC · 15 hard rules → AI filter → 3 human layers"
        lead="Every capture crosses a 15-check gate before a human ever sees it. Only PARTIAL/FAIL results route into Label Studio, where three human layers ship the last 8%. Every fix keeps the schema_v3 provenance trail intact."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Hard-rules badge grid */}
        <div className="bp-card" style={{ padding: 20, borderRadius: 14 }}>
          <div className="bp-mono flex items-center justify-between" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>
            <span>LAYER 1 · HARD RULES · 15 CHECKS</span>
            <span style={{ color: "var(--bp-cyan)" }}>15/15 pass · sample capture</span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {HARD_RULES.map((r) => (
              <div key={r.id} className="flex items-start gap-3" style={{ padding: "10px 12px", border: "1px solid var(--bp-line)", borderRadius: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, background: `color-mix(in srgb, ${CATEGORY_COLOR[r.category]} 20%, transparent)`, color: CATEGORY_COLOR[r.category], flexShrink: 0 }}>
                  <ShieldCheck className="h-3 w-3" />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--bp-ink)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</div>
                  <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", marginTop: 2 }}>{r.threshold} · {r.sampleOk}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Human QC + delta */}
        <div className="flex flex-col gap-4">
          <div className="bp-card" style={{ padding: 20, borderRadius: 14 }}>
            <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>LAYERS 2–4 · HUMAN REVIEW</div>
            <ul className="mt-3 space-y-3">
              {HUMAN_QC.layers.map((l) => (
                <li key={l.k}>
                  <div style={{ fontSize: 13, color: "var(--bp-ink)", fontWeight: 600 }}>{l.k}</div>
                  <div className="mt-1" style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{l.v}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bp-card" style={{ padding: 20, borderRadius: 14 }}>
            <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>{QC_DELTA.fig}</div>
            <div className="mt-1 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--bp-ink)" }}>{QC_DELTA.title}</div>
            <div className="mt-4 space-y-2">
              {QC_DELTA.rows.map((r) => (
                <div key={r.k} className="flex items-center gap-3">
                  <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-dim)", width: 190, letterSpacing: "0.02em" }}>{r.k}</div>
                  <div className="flex-1" style={{ height: 8, background: "var(--bp-line)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${r.v}%`, background: "linear-gradient(90deg, var(--bp-cyan), var(--bp-accent, #00e5c7))" }} />
                  </div>
                  <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)", width: 46, textAlign: "right" }}>
                    <CountUp value={r.v} duration={1.4} />%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl" style={{ fontSize: 14, color: "var(--bp-ink-dim)" }}>
          Full 15-check taxonomy, sample fail images per check, escalation flow, and the models provenance trail live on the QC playbook.
        </p>
        <Link href="/data/physical-ai/quality" className="bp-mono" style={{ fontSize: 13, color: "var(--bp-cyan)", display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "1px solid var(--bp-cyan)", borderRadius: 8 }}>
          See full QC playbook <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Sheet>
  );
}
