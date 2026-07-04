import type { QcMeta } from "@/lib/landing/physical-ai";

const TONES = {
  PASS:       { bg: "rgba(0,229,199,0.14)",   fg: "var(--bp-cyan)",   label: "PASS" },
  PARTIAL:    { bg: "rgba(255,189,46,0.14)",  fg: "var(--bp-amber)",  label: "PARTIAL" },
  FAIL_LABEL: { bg: "rgba(255,95,87,0.16)",   fg: "#ff5f57",          label: "FAIL LABEL" },
  PARTNER:    { bg: "rgba(150,100,255,0.14)", fg: "var(--bp-purple)", label: "PARTNER" },
  LABELING:   { bg: "rgba(76,181,255,0.14)",  fg: "#4cb5ff",          label: "LABELING" },
} as const;

export function QcChip({ qc, defect, className = "", inline = false }: { qc: QcMeta; defect?: boolean; className?: string; inline?: boolean }) {
  const tone = TONES[qc.state];
  const pct = qc.total > 0 ? `${qc.passCount}/${qc.total}` : "—";

  return (
    <span
      className={`bp-mono ${className}`}
      style={{
        display: inline ? "inline-flex" : "flex",
        alignItems: "center",
        gap: 6,
        padding: inline ? "2px 6px" : "3px 7px",
        borderRadius: 4,
        fontSize: inline ? 9 : 10,
        letterSpacing: "0.05em",
        background: tone.bg,
        color: tone.fg,
        whiteSpace: "nowrap",
      }}
      title={qc.failedCheck ?? qc.note ?? ""}
    >
      <span style={{ width: 6, height: 6, borderRadius: 6, background: tone.fg, opacity: qc.state === "FAIL_LABEL" ? 1 : 0.85, animation: qc.state === "PARTIAL" ? "bp-pulse 1.4s ease-in-out infinite" : undefined }} />
      <span>{tone.label}</span>
      {qc.total > 0 && (
        <span style={{ opacity: 0.75, fontWeight: 400 }}>· {pct}</span>
      )}
      {defect && (
        <span style={{ opacity: 0.85, color: "var(--bp-amber)" }}>· DEFECT</span>
      )}
      {qc.failedCheck && (
        <span style={{ opacity: 0.85 }}>· {qc.failedCheck}</span>
      )}
    </span>
  );
}
