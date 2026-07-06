"use client";

import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { AUTO_LABEL_STAGES } from "@/lib/landing/physical-ai-qc";

export function DescriptionMetadata() {
  const desc = AUTO_LABEL_STAGES.find((s) => s.key === "description")!;
  const meta = AUTO_LABEL_STAGES.find((s) => s.key === "metadata")!;
  return (
    <Sheet id="description-metadata" fig="FIG.05A/B — DESCRIPTION + METADATA" axis>
      <SheetHeading
        title="Every clip has a verb-noun · every field has a version"
        lead="Beyond kpts and masks, every capture ships with structured semantics — action segments plus a schema_v3 provenance trail that names the exact model and git SHA that produced each field."
      />

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {/* Description panel */}
        <div className="bp-card overflow-hidden" style={{ borderRadius: 14 }}>
          <div className="bp-mono flex items-center justify-between" style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
            <span>{desc.fig}</span>
            <span style={{ color: "var(--bp-cyan)" }}>{desc.model}</span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 22, lineHeight: 1.1, color: "var(--bp-ink)" }}>{desc.title}</h3>
            <p className="mt-3" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{desc.detail}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(desc.overlayImages ?? []).slice(0, 4).map((src) => (
                <div key={src} className="overflow-hidden" style={{ borderRadius: 10, border: "1px solid var(--bp-line)" }}>
                  <img src={src} alt="Qwen3-VL description composite" style={{ width: "100%", display: "block" }} />
                </div>
              ))}
            </div>
            <pre className="bp-mono mt-5" style={{ margin: 0, padding: "14px 16px", fontSize: 11, lineHeight: 1.65, color: "#c8d3f0", background: "#0b1220", borderRadius: 10, overflowX: "auto" }}>
              {desc.jsonSnippet}
            </pre>
          </div>
        </div>

        {/* Metadata panel */}
        <div className="bp-card overflow-hidden" style={{ borderRadius: 14 }}>
          <div className="bp-mono flex items-center justify-between" style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
            <span>{meta.fig}</span>
            <span style={{ color: "var(--bp-cyan)" }}>{meta.model}</span>
          </div>
          <div style={{ padding: "20px 22px" }}>
            <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 22, lineHeight: 1.1, color: "var(--bp-ink)" }}>{meta.title}</h3>
            <p className="mt-3" style={{ fontSize: 14, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{meta.detail}</p>
            <div className="mt-4 bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)" }}>output · {meta.output}</div>
            <pre className="bp-mono mt-4" style={{ margin: 0, padding: "14px 16px", fontSize: 11, lineHeight: 1.65, color: "#c8d3f0", background: "#0b1220", borderRadius: 10, overflowX: "auto" }}>
              {meta.jsonSnippet}
            </pre>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
