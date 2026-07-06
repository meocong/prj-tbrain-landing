"use client";

/**
 * PalettePanel — surfaces the per-source palette + watermark contract
 * introduced in the F1–F14 burn-pipeline hardening pass (schema_v3, git 1b0cce1).
 * Buyer reads the annotated.mp4 by color alone.
 */
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";

const PALETTE = [
  { source: "hawor",         label: "HaWoR MANO",          color: "#4cb5ff", note: "Primary hand tracker · SLAM per hand · 21-kpt" },
  { source: "interp",        label: "interp",              color: "#a78bfa", note: "Frame-level interpolation across a HaWoR gap" },
  { source: "sam3",          label: "SAM3 (mask only)",    color: "#f0a2ff", note: "Object segmenter mask · hand-tracking killed (F10)" },
  { source: "sapiens_wrist", label: "Sapiens wrist",       color: "#ff9a4d", note: "Wrist fallback where HaWoR fails · gated (F11)" },
  { source: "moge",          label: "MoGe depth",          color: "#00e5c7", note: "Metric depth + pointmap · K_hawor priority (F1)" },
  { source: "human",         label: "human correction",    color: "#5ee08a", note: "Label Studio diff · schema_v3 override" },
];

const WATERMARKS = [
  { key: "NO_DET",       color: "#ff5f57", note: "Hand missing this frame · F5 flag" },
  { key: "CLOSE_HAND",   color: "#ff9a4d", note: "Skin-close-to-hand · F12 · HITL priority (F14 tag)" },
  { key: "MESH_OOB",     color: "#ff5f57", note: "Mesh projected outside frame · F3/F8 · dropped" },
  { key: "MESH_DISPUTE", color: "#ff9a4d", note: "Mesh vs. hand-track disagree · F8 gate" },
  { key: "MASK_DRIFT",   color: "#ff9a4d", note: "Mask/bbox ratio > 1.5× · F9 skipped from ship" },
  { key: "BODY_HIDDEN",  color: "#8fa0c8", note: "body_dense off default · F11 · off-frame body suppressed" },
];

export function PalettePanel() {
  return (
    <Sheet id="palette" fig="FIG.05H — PROVENANCE PALETTE · BURN v1b0cce1" axis>
      <SheetHeading
        title="Read every annotation by color · read every failure by watermark"
        lead="After the F1–F14 hardening pass on the burn pipeline, the annotated.mp4 encodes provenance and failure modes in the visual itself. Buyer never has to grep labels.json to know which model produced which pixel."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            · per-source palette (F4)
          </div>
          <div className="mt-3 grid gap-2">
            {PALETTE.map((p, i) => (
              <motion.div
                key={p.source}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="bp-card flex items-center gap-3"
                style={{ padding: "10px 14px", borderRadius: 10, borderLeft: `3px solid ${p.color}` }}
              >
                <div style={{ width: 28, height: 28, borderRadius: 6, background: p.color, boxShadow: `0 0 10px ${p.color}55`, flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <div className="bp-mono" style={{ fontSize: 11.5, color: "var(--bp-ink)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    {p.label}
                  </div>
                  <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", marginTop: 2, lineHeight: 1.4 }}>
                    src=<span style={{ color: p.color }}>{p.source}</span> · {p.note}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="bp-mono" style={{ fontSize: 10, color: "#ff9a4d", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            · watermarks · failure surface (F2/F5/F8/F12)
          </div>
          <div className="mt-3 grid gap-2">
            {WATERMARKS.map((w, i) => (
              <motion.div
                key={w.key}
                initial={{ opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="bp-card flex items-center gap-3"
                style={{ padding: "10px 14px", borderRadius: 10, borderLeft: `3px solid ${w.color}` }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, background: `color-mix(in srgb, ${w.color} 22%, transparent)`, color: w.color, flexShrink: 0 }}>
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="bp-mono" style={{ fontSize: 11.5, color: w.color, fontWeight: 700, letterSpacing: "0.06em" }}>
                    {w.key}
                  </div>
                  <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", marginTop: 2, lineHeight: 1.4 }}>
                    {w.note}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-dim)", padding: "12px 14px", background: "color-mix(in srgb, var(--bp-cyan) 4%, transparent)", borderRadius: 10, lineHeight: 1.6 }}>
        <span style={{ color: "var(--bp-cyan)", fontWeight: 700 }}>burn contract · </span>
        Every colored dot / mesh in <code style={{ color: "var(--bp-cyan)" }}>labels/annotated.mp4</code> maps 1:1 to a source in <code style={{ color: "var(--bp-cyan)" }}>labels.json.models</code>. Every watermark maps to a schema_v3 flag. LeRobot exports strip debug frames (F13); HITL queue reads CLOSE_HAND priority (F14). All 20 caps rebuilt + reburned at git <code style={{ color: "#00e5c7" }}>1b0cce1</code> · 152/152 tests PASS.
      </div>
    </Sheet>
  );
}
