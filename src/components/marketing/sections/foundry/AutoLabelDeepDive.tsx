"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { LazyVideo } from "@/components/marketing/fx/LazyVideo";
import { AUTO_LABEL_STAGES } from "@/lib/landing/physical-ai-qc";

const TABS = [
  { key: "hand",   label: "Hand · MANO 21-kpt" },
  { key: "body",   label: "Body · Sapiens 308-kpt" },
  { key: "masks",  label: "Masks · SAM3" },
  { key: "depth",  label: "Depth · MoGe" },
];

const STATUS_COLOR: Record<string, string> = {
  PASS:       "#5ee08a",
  PARTIAL:    "#ff9a4d",
  FAIL:       "#ff5f57",
  SUPPRESSED: "#8fa0c8",
};

function StagePreview({ stageKey }: { stageKey: string }) {
  const stage = AUTO_LABEL_STAGES.find((s) => s.key === stageKey)!;
  const hasVideo = stage.rawVideo && stage.overlayVideo;
  const overlays = stage.overlays ?? (stage.overlayImages ?? []).map((src) => ({ src, cap: "", pred: "", status: "PASS" as const }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {hasVideo && (
        <>
          <div className="bp-card overflow-hidden" style={{ borderRadius: 12 }}>
            <div className="bp-mono flex items-center justify-between" style={{ padding: "8px 14px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>RAW · rgb.mp4</span>
            </div>
            <LazyVideo src={stage.rawVideo!} poster={stage.overlayPoster!} alt={`${stage.title} raw`} />
          </div>
          <div className="bp-card overflow-hidden" style={{ borderRadius: 12 }}>
            <div className="bp-mono flex items-center justify-between" style={{ padding: "8px 14px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>OVERLAY · {stage.model}</span>
              <span style={{ color: "var(--bp-cyan)" }}>{stage.output.split("·")[0].trim()}</span>
            </div>
            <LazyVideo src={stage.overlayVideo!} poster={stage.overlayPoster!} alt={`${stage.title} overlay`} />
          </div>
        </>
      )}
      {!hasVideo && overlays.length > 0 && (
        <>
          {overlays.slice(0, 4).map((o) => {
            const color = STATUS_COLOR[o.status] ?? STATUS_COLOR.PASS;
            return (
              <div key={o.src} className="bp-card overflow-hidden" style={{ borderRadius: 12, borderColor: `color-mix(in srgb, ${color} 40%, var(--bp-line))` }}>
                <div className="bp-mono flex items-center justify-between gap-2" style={{ padding: "6px 12px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.cap || `${stage.title} example`}</span>
                  <span style={{ color, fontWeight: 700, letterSpacing: "0.06em", flexShrink: 0 }}>{o.status}</span>
                </div>
                <img src={o.src} alt={o.pred || `${stage.title} example`} style={{ width: "100%", display: "block" }} loading="lazy" />
                {o.pred && (
                  <div className="bp-mono" style={{ padding: "6px 12px", fontSize: 10, color: "var(--bp-ink-dim)", borderTop: "1px solid var(--bp-line)", background: "color-mix(in srgb, var(--bp-cyan) 3%, transparent)" }}>
                    <span style={{ color: "var(--bp-cyan)" }}>predict · </span>{o.pred}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
      {!hasVideo && overlays.length === 0 && (
        <div className="lg:col-span-2 bp-card relative overflow-hidden" style={{ padding: 24, borderRadius: 12, minHeight: 220 }}>
          <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
            <defs>
              <linearGradient id="stagePreviewBg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="var(--bp-cyan)" stopOpacity="0.08" />
                <stop offset="1" stopColor="var(--bp-purple)" stopOpacity="0.04" />
              </linearGradient>
            </defs>
            <rect width="400" height="220" fill="url(#stagePreviewBg)" rx="8" />
            <g stroke="var(--bp-cyan)" strokeOpacity="0.35" strokeWidth="1" fill="none">
              <rect x="20" y="20" width="140" height="90" rx="4" />
              <rect x="170" y="20" width="210" height="90" rx="4" />
              <rect x="20" y="120" width="360" height="80" rx="4" />
            </g>
            <g fontFamily="var(--font-mono)" fontSize="9" fill="var(--bp-cyan)" letterSpacing="1">
              <text x="30" y="38">INPUT · rgb.mp4</text>
              <text x="180" y="38">{stage.model.toUpperCase()} · MODEL OUTPUT</text>
              <text x="30" y="138">OUTPUT · {stage.output.slice(0, 42)}</text>
            </g>
          </svg>
        </div>
      )}
    </div>
  );
}

export function AutoLabelDeepDive() {
  const [tab, setTab] = useState("hand");
  return (
    <Sheet id="auto-label" fig="FIG.05 — AUTO-LABEL · 4 SIGNATURE OUTPUTS" axis>
      <SheetHeading
        title="Per-stage deep dive"
        lead="Every raw capture runs through the auto-label pipeline in parallel. Four outputs are the ones a robotics team touches first — the rest live in the provenance manifest that ships alongside the video."
      />

      {/* Tab bar */}
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const activeTab = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="bp-mono"
              style={{
                fontSize: 10.5,
                padding: "10px 14px",
                borderRadius: 8,
                border: activeTab ? "1px solid var(--bp-cyan)" : "1px solid var(--bp-line-strong)",
                background: activeTab ? "color-mix(in srgb, var(--bp-cyan) 12%, transparent)" : "transparent",
                color: activeTab ? "var(--bp-cyan)" : "var(--bp-ink)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab bodies · all mounted · videos never restart on tab switch */}
      <div className="mt-6 relative">
        {TABS.map((t) => {
          const stage = AUTO_LABEL_STAGES.find((s) => s.key === t.key)!;
          const shown = t.key === tab;
          return (
            <motion.div
              key={t.key}
              initial={false}
              animate={{ opacity: shown ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: shown ? "block" : "none" }}
              aria-hidden={!shown}
            >
              <div className="bp-card" style={{ padding: 22, borderRadius: 14 }}>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
                  <div>
                    <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>{stage.fig}</div>
                    <h3 className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px, 2.4vw, 28px)", lineHeight: 1.1, color: "var(--bp-ink)" }}>{stage.title}</h3>
                    <p className="mt-3" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{stage.detail}</p>
                    <div className="mt-4 bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)" }}>output · {stage.output}</div>
                  </div>
                  <StagePreview stageKey={t.key} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-xl" style={{ fontSize: 14, color: "var(--bp-ink-dim)" }}>
          Description, metadata, object masks, depth, Rerun proof — the full 8-model pipeline lives on the deep dive page.
        </p>
        <Link href="/data/physical-ai/auto-label" className="bp-mono" style={{ fontSize: 13, color: "var(--bp-cyan)", display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "1px solid var(--bp-cyan)", borderRadius: 8 }}>
          See the full pipeline <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Sheet>
  );
}
