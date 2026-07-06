"use client";

/**
 * Sapiens topology-gate diagnostic panel — presents the "SUPPRESSED" state as
 * an intentional engineering console (not an error). Shows Y_nose · Y_hip ·
 * delta · gate condition · resulting suppression scope.
 */
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Row { k: string; v: string; ok?: boolean }

const EGO_ROWS: Row[] = [
  { k: "cap",              v: "iron_product · op mobile · 20260626T01" },
  { k: "kpts.npz shape",   v: "(450, 308, 2)  · float32" },
  { k: "Y_nose (kpt 0)",   v: "477.6  · frame 225" },
  { k: "Y_hip mean (11,12)", v: "440.1  · frame 225" },
  { k: "Δ (nose - hip)",    v: "+37.5  · positive = TOPOLOGY_INVALID", ok: false },
  { k: "body kpt count",   v: "0 / 17 above threshold", ok: false },
  { k: "gate condition",   v: "nose_Y < hip_Y  AND  body_count ≥ 6", ok: false },
  { k: "action",           v: "suppress face + dense from viz  · retain raw kpts in the manifest", ok: false },
];

const TABLETOP_ROWS: Row[] = [
  { k: "cap",              v: "pick_up_the_cup · op unknown · 20260617T01" },
  { k: "kpts.npz shape",   v: "(273, 308, 2)  · float32" },
  { k: "Y_nose (kpt 0)",   v: "477.6  · frame 136" },
  { k: "Y_hip mean (11,12)", v: "447.3  · frame 136" },
  { k: "Δ (nose - hip)",    v: "+30.3  · TOPOLOGY_INVALID (head-mount top-down)", ok: false },
  { k: "body kpt count",   v: "12 / 17 above threshold" },
  { k: "gate condition",   v: "nose_Y < hip_Y  AND  body_count ≥ 6", ok: false },
  { k: "action",           v: "suppress face + dense · body-17 still rendered where coherent", ok: false },
];

function Row({ r }: { r: Row }) {
  const failing = r.ok === false;
  const passing = r.ok === true;
  return (
    <div className="flex items-start gap-3" style={{
      padding: "8px 12px",
      borderTop: "1px solid rgba(255,255,255,0.04)",
      background: failing ? "rgba(255,154,77,0.04)" : "transparent",
    }}>
      <div className="bp-mono" style={{ fontSize: 10.5, color: "#8fa0c8", width: 130, flexShrink: 0, letterSpacing: "0.04em" }}>
        {r.k}
      </div>
      <div className="bp-mono flex-1" style={{ fontSize: 11.5, color: failing ? "#ff9a4d" : passing ? "#5ee08a" : "#c8d3f0", lineHeight: 1.5 }}>
        {r.v}
      </div>
      {failing && <AlertTriangle className="h-3.5 w-3.5" style={{ color: "#ff9a4d", flexShrink: 0, marginTop: 3 }} />}
      {passing && <CheckCircle2 className="h-3.5 w-3.5" style={{ color: "#5ee08a", flexShrink: 0, marginTop: 3 }} />}
    </div>
  );
}

export function SapiensDiagnosticPanel() {
  return (
    <div className="bp-card overflow-hidden" style={{ borderRadius: 14, background: "#050a12" }}>
      <div className="bp-mono flex items-center justify-between" style={{ padding: "10px 14px", fontSize: 11, color: "#8fa0c8", borderBottom: "1px solid var(--bp-line)" }}>
        <span>DIAGNOSTIC · sapiens_body/kpts.npz · topology gate</span>
        <span style={{ color: "#ff9a4d" }}>SUPPRESSED · 2 egocentric caps</span>
      </div>

      <div className="grid gap-0 lg:grid-cols-2">
        <div style={{ borderRight: "1px solid var(--bp-line)" }}>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            cap 1 · textile ego
          </div>
          {EGO_ROWS.map((r, i) => <Row key={i} r={r} />)}
        </div>
        <div>
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            cap 2 · tabletop ego
          </div>
          {TABLETOP_ROWS.map((r, i) => <Row key={i} r={r} />)}
        </div>
      </div>

      <div className="bp-mono" style={{ padding: "12px 14px", fontSize: 10.5, color: "#8fa0c8", borderTop: "1px solid var(--bp-line)", lineHeight: 1.55 }}>
        <span style={{ color: "#00e5c7", fontWeight: 700 }}>gate rationale · </span>
        On egocentric captures the wearer&apos;s head-mounted camera looks down; Sapiens predicts &quot;nose&quot; below &quot;hips&quot; — impossible in a coherent skeleton. The gate flags TOPOLOGY_INVALID and suppresses face + dense kpts from the visualization. The raw kpts stay in the manifest so downstream research on partial-body detection retains full access. High-fidelity body pose comes from partner-signed exocentric mocap instead.
      </div>
      {/* Real-cap thumbnail strip · every ego capture in the audit */}
      <div className="grid grid-cols-4 gap-0" style={{ borderTop: "1px solid var(--bp-line)" }}>
        {[
          { src: "/images/body-kpts/pick_up_the_cup_t50.jpg", cap: "pick_up_the_cup · body 0/17" },
          { src: "/images/body-kpts/iron_product_t50.jpg", cap: "iron_product · body 0/17" },
          { src: "/images/body-kpts/sew_hem_t50.jpg", cap: "sew_hem · body 0/17" },
          { src: "/images/body-kpts/arrange_fabric_t50.jpg", cap: "arrange_fabric · body 0/17" },
        ].map((c, i) => (
          <div key={c.src} className="relative" style={{ borderRight: i < 3 ? "1px solid var(--bp-line)" : "none" }}>
            <img src={c.src} alt={c.cap} style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} loading="lazy" />
            <div className="bp-mono absolute inset-x-0 bottom-0" style={{ background: "linear-gradient(0deg, rgba(5,10,18,0.92) 0%, transparent 100%)", padding: "20px 8px 6px", fontSize: 9, color: "#ff9a4d", letterSpacing: "0.04em", textAlign: "center" }}>
              {c.cap}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
