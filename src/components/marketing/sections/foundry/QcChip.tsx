import type { QcMeta } from "@/lib/landing/physical-ai";

// The chip sits over capture video (bright fabric frames) in both themes, so it
// is a solid dark pill with BRIGHT text — theme tokens would go dark-on-dark on
// the pill in light mode. Colour tint moves to the border for identity.
const PILL_BG = "rgba(8,10,20,0.82)";
const TONES = {
  PASS:       { fg: "#5ee08a", label: "PASS" },
  PARTIAL:    { fg: "#ffbd2e", label: "PARTIAL" },
  FAIL_LABEL: { fg: "#ff5f57", label: "FAIL LABEL" },
  PARTNER:    { fg: "#a78bfa", label: "PARTNER" },
  LABELING:   { fg: "#4cb5ff", label: "LABELING" },
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
        background: PILL_BG,
        border: `1px solid color-mix(in srgb, ${tone.fg} 45%, transparent)`,
        color: tone.fg,
        textShadow: "0 1px 2px rgba(0,0,0,0.8)",
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
        <span style={{ opacity: 0.9, color: "#ffbd2e" }}>· DEFECT</span>
      )}
      {qc.failedCheck && (
        <span style={{ opacity: 0.85 }}>· {qc.failedCheck}</span>
      )}
    </span>
  );
}
