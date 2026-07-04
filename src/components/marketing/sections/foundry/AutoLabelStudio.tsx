"use client";

import { useState } from "react";
import Image from "next/image";
import { HITL_STUDIO, QC_DIAG, type HitlTab } from "@/lib/landing/physical-ai";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";
import { motion, AnimatePresence } from "framer-motion";

type Panel = "cockpit" | "diag";

export function AutoLabelStudio() {
  const [panel, setPanel] = useState<Panel>("cockpit");

  return (
    <Sheet id="auto-label-studio" fig="FIG.09 — AUTO-LABEL PIPELINE" axis={false}>
      <SheetHeading title="Auto-label pipeline · cockpit + diagnostic" lead={HITL_STUDIO.lead} />

      {/* Backend host strip */}
      <div className="mt-6 bp-card" style={{ padding: 0, borderRadius: 12, overflow: "hidden" }}>
        <div className="flex items-center gap-3 bp-mono flex-wrap" style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
          <span className="bp-status bp-status-mov" style={{ fontSize: 9 }}>UP</span>
          <span style={{ color: "var(--bp-ink-dim)" }}>{HITL_STUDIO.ls.host}</span>
          <span style={{ marginLeft: "auto", color: "var(--bp-cyan)" }}>3 model-backed assistants attached</span>
        </div>
        <div className="grid gap-0 sm:grid-cols-3">
          {HITL_STUDIO.ls.backends.map((b, i) => (
            <div key={b.name} className="bp-mono" style={{ padding: "12px 16px", borderLeft: i > 0 ? "1px solid var(--bp-line)" : "none", fontSize: 11, color: "var(--bp-ink-dim)" }}>
              <span style={{ color: "var(--bp-cyan)" }}>◆</span> {b.name}
              <div style={{ fontSize: 11, color: "var(--bp-ink-faint)", marginTop: 3 }}>{b.model}</div>
              <div style={{ fontSize: 10, color: "var(--bp-ink-faint)", marginTop: 2 }}>{b.task}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel switcher */}
      <div className="mt-6 flex items-center gap-2 flex-wrap" role="tablist">
        <PanelButton active={panel === "cockpit"} onClick={() => setPanel("cockpit")} label="Cockpit" hint="What reviewers see" />
        <PanelButton active={panel === "diag"} onClick={() => setPanel("diag")} label="Diagnostic" hint="Eight named gates" />
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {panel === "cockpit" ? (
            <motion.div key="cockpit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              <CockpitPanel />
            </motion.div>
          ) : (
            <motion.div key="diag" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              <DiagPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Sheet>
  );
}

function PanelButton({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="bp-mono"
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "10px 16px",
        borderRadius: 8,
        border: `1px solid ${active ? "var(--bp-cyan)" : "var(--bp-line)"}`,
        background: active ? "rgba(0,229,199,0.10)" : "transparent",
        color: active ? "var(--bp-cyan)" : "var(--bp-ink-dim)",
        cursor: "pointer",
        transition: "all .2s ease",
      }}
    >
      <span style={{ fontSize: 12, letterSpacing: "0.06em", fontWeight: 700, textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 9, opacity: 0.7, marginTop: 2 }}>{hint}</span>
    </button>
  );
}

/* ── Cockpit: 4 tabs, one big image + one caption each ─────────────── */
function CockpitPanel() {
  const [tab, setTab] = useState<HitlTab["key"]>("segmenter");
  const active = HITL_STUDIO.tabs.find((t) => t.key === tab) ?? HITL_STUDIO.tabs[0];

  return (
    <div>
      {/* Tab strip */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {HITL_STUDIO.tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tab}
            onClick={() => setTab(t.key)}
            className="bp-mono"
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${t.key === tab ? "var(--bp-cyan)" : "var(--bp-line)"}`,
              background: t.key === tab ? "rgba(0,229,199,0.10)" : "var(--bp-surface)",
              color: t.key === tab ? "var(--bp-cyan)" : "var(--bp-ink-dim)",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: "0.05em",
              fontWeight: 700,
              textTransform: "uppercase",
              transition: "all .2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.key}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          {/* Hero image */}
          {active.key === "burn" && active.images ? (
            <div className="bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden", background: "#0b1220" }}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "var(--bp-line)" }}>
                {active.images.map((src, i) => (
                  <div key={src} className="relative" style={{ aspectRatio: "1", background: "#0b1220" }}>
                    <Image src={src} alt={`Frame ${i + 1}`} fill sizes="25vw" className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
              <div style={{ padding: "14px 18px", borderTop: "1px solid var(--bp-line)" }}>
                <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>◆ {active.backendLabel}</div>
                <div style={{ fontSize: 14, color: "var(--bp-ink-dim)", marginTop: 6, lineHeight: 1.55 }}>{active.caption}</div>
              </div>
            </div>
          ) : (
            <div className="bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden", background: "#0b1220" }}>
              <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
                <Image src={active.image} alt={active.alt} fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" unoptimized />
                <span
                  className="bp-status bp-status-mov absolute top-3 right-3"
                  style={{ fontSize: 10 }}
                >
                  LIVE
                </span>
              </div>
              <div style={{ padding: "14px 18px", borderTop: "1px solid var(--bp-line)" }}>
                <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>◆ {active.backendLabel}</div>
                <div style={{ fontSize: 14, color: "var(--bp-ink-dim)", marginTop: 6, lineHeight: 1.55 }}>{active.caption}</div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* LS project metadata footer */}
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {HITL_STUDIO.ls.projects.map((p) => (
          <div key={p.k} className="bp-card bp-mono flex items-baseline gap-2" style={{ padding: "10px 14px", borderRadius: 8, fontSize: 11, color: "var(--bp-ink-dim)" }}>
            <span style={{ color: "var(--bp-cyan)", letterSpacing: "0.05em", minWidth: 120 }}>{p.k}</span>
            <span style={{ opacity: 0.5 }}>·</span>
            <span>{p.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Diagnostic: 8-check matrix ─────────────────────────────────────── */
function DiagPanel() {
  return (
    <div>
      <div
        className="bp-card bp-mono"
        style={{
          padding: "14px 18px",
          fontSize: 12,
          color: "var(--bp-ink-dim)",
          borderLeft: "3px solid var(--bp-cyan)",
          borderRadius: 8,
          background: "var(--bp-surface)",
        }}
      >
        <span style={{ color: "var(--bp-cyan)" }}>$</span> {QC_DIAG.cmd.replace("$ ", "")}
      </div>

      <StaggerContainer className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {QC_DIAG.checks.map((c, i) => (
          <motion.div key={c.key} variants={STAGGER_ITEM} className="bp-card" style={{ padding: 14, borderRadius: 10, position: "relative", overflow: "hidden" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)", letterSpacing: "0.06em" }}>
                CHECK {String(i + 1).padStart(2, "0")}
              </div>
              <span className="bp-status bp-status-mov" style={{ fontSize: 9 }}>PASS</span>
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: 14, fontWeight: 600, color: "var(--bp-ink)", marginTop: 6 }}>
              {c.label}
            </div>
            <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", marginTop: 2 }}>
              {c.key}
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--bp-line)", fontSize: 12, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>
              {c.criterion}
            </div>
            <div className="bp-mono" style={{ marginTop: 8, fontSize: 10, color: "var(--bp-amber)", lineHeight: 1.4 }}>
              FAIL: {c.failMode}
            </div>
          </motion.div>
        ))}
      </StaggerContainer>

      <div className="mt-6 bp-card flex items-center gap-3" style={{ padding: "12px 18px", borderRadius: 8 }}>
        <span className="bp-status bp-status-mov">8/8</span>
        <span style={{ fontSize: 13, color: "var(--bp-ink-dim)" }}>{QC_DIAG.bottomLine}</span>
      </div>
    </div>
  );
}
