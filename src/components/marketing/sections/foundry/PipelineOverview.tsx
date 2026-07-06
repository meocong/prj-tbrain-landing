"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { PIPELINE_OVERVIEW } from "@/lib/landing/physical-ai-qc";
import { PipelineDiagram } from "./PipelineDiagram";

export function PipelineOverview({ highlight, showAnchors = true }: { highlight?: string; showAnchors?: boolean }) {
  return (
    <Sheet id="pipeline" fig={PIPELINE_OVERVIEW.fig} axis>
      <SheetHeading title={PIPELINE_OVERVIEW.title} lead={PIPELINE_OVERVIEW.lead} />
      <div className="mt-8">
        <PipelineDiagram highlight={highlight} />
      </div>
      {showAnchors && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {PIPELINE_OVERVIEW.phases.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="bp-mono"
              style={{
                fontSize: 11,
                padding: "8px 14px",
                borderRadius: 8,
                border: "1px solid var(--bp-line-strong)",
                color: "var(--bp-ink)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              → {p.label}
            </a>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <Link href="/data/physical-ai/auto-label" className="bp-mono" style={{ fontSize: 12, color: "var(--bp-cyan)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              8-model deep dive <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link href="/data/physical-ai/quality" className="bp-mono" style={{ fontSize: 12, color: "var(--bp-cyan)", display: "inline-flex", alignItems: "center", gap: 6 }}>
              QC playbook <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  );
}
