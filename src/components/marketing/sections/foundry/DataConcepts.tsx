"use client";

/**
 * Data concepts panel — surfaces the invariants of the foundry's dataset design
 * that buyers ask about but landings rarely explain: ontology, sampling, splits,
 * versioning, provenance, augmentation.
 */
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import Link from "next/link";
import { ArrowRight, Layers, GitBranch, Boxes, Filter, Fingerprint, Sparkles, ShieldCheck, ScaleIcon } from "lucide-react";

const CONCEPTS = [
  {
    key: "ontology",
    icon: Layers,
    fig: "01",
    title: "Ontology · canonical verb-noun",
    lead: "200-entry industrial ontology maps every action to a canonical (verb, noun_id) pair. VLM output that lands outside the ontology gets an ontology_missing flag — never silent.",
    keys: ["verb (open set)", "noun_id (canonical)", "confidence", "source"],
  },
  {
    key: "taxonomy",
    icon: Boxes,
    fig: "02",
    title: "Modality taxonomy · 10 slots",
    lead: "Egocentric · exocentric · multi-view · UMI · ALOHA · mobile-manip · OpenX single-arm · PushT · sim-teleop · exo-mocap. Every capture declares its slot in metadata; downstream filters read this.",
    keys: ["capture kind", "sensor stack", "operator kind", "environment"],
  },
  {
    key: "sampling",
    icon: Filter,
    fig: "03",
    title: "Sampling · diversity over volume",
    lead: "We don't chase raw hours — we chase distribution coverage: operator × task × environment × verb-noun × failure-mode. A capture that adds nothing to distribution gets rejected before it hits the auto-label stage.",
    keys: ["distribution grid", "coverage delta per capture", "reject if delta ≈ 0"],
  },
  {
    key: "splits",
    icon: GitBranch,
    fig: "04",
    title: "Splits · operator + environment",
    lead: "Train/val/test splits are cut on operator AND environment axes, not random. A model trained on operator A + factory X is evaluated on operator B + factory Y — the only split that predicts field generalization.",
    keys: ["train: op×env matrix", "val: held-out op", "test: held-out op+env"],
  },
  {
    key: "provenance",
    icon: Fingerprint,
    fig: "05",
    title: "Provenance · every field is diffable",
    lead: "The manifest records the model + version + git SHA that produced each field. A rerun with a newer model produces a new manifest; the diff is machine-readable. No silent overwrites, no black-box updates.",
    keys: ["model + version + git_sha", "per-field trail", "diffable across runs"],
  },
  {
    key: "versioning",
    icon: ScaleIcon,
    fig: "06",
    title: "Versioning · schema + capture_id",
    lead: "Every capture ships with schema_version + a global capture_id (task__operator__timestamp). Downstream can pin to a schema. When we bump schema, we ship a migration diff — additive, backward-compatible.",
    keys: ["schema_version pinned", "capture_id: task__op__ts", "additive migrations"],
  },
  {
    key: "augmentation",
    icon: Sparkles,
    fig: "07",
    title: "Augmentation · what we don't do",
    lead: "We ship raw + minimal-augment. No synthetic frames, no color-jitter baked in, no cropped versions in the ship contract. Consumers own their augmentation. If it isn't real, it isn't in the ship.",
    keys: ["raw video (no processing)", "augment = consumer's job", "no synthetic frames"],
  },
  {
    key: "safety",
    icon: ShieldCheck,
    fig: "08",
    title: "Consent + safety · off the record",
    lead: "Every operator signs consent per task. Face-blur, brand-blur, and workspace-blur pipelines run before delivery. Any capture that fails consent spot-check is quarantined; buyers get a clean parquet with a documented provenance chain.",
    keys: ["per-task consent", "auto-blur pipeline", "3-step spot-check"],
  },
];

export function DataConcepts() {
  return (
    <Sheet id="data-concepts" fig="FIG.08 — DATA CONCEPTS · THE INVARIANTS" axis>
      <SheetHeading
        title="Concepts a robot team should ask before they buy data"
        lead="Beyond hours-of-video and per-frame stats, these are the invariants that decide whether a dataset generalizes off your machine. We publish ours."
      />
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CONCEPTS.map((c, i) => {
          const Icon = c.icon;
          const HALO_COLORS = ["#4cb5ff", "#00e5c7", "#a78bfa", "#ff9a4d", "#5ee08a", "#f0a2ff", "#4cb5ff", "#00e5c7"];
          const halo = HALO_COLORS[i % HALO_COLORS.length];
          return (
            <div key={c.key} className="bp-card group relative overflow-hidden" style={{ padding: 20, borderRadius: 14, transition: "border-color .2s ease" }}>
              <div aria-hidden style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, background: `radial-gradient(closest-side, ${halo}22, transparent 70%)`, pointerEvents: "none" }} />
              <div className="relative flex items-center justify-between">
                <span className="bp-mono" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em" }}>{c.fig}</span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 8, background: `color-mix(in srgb, ${halo} 14%, transparent)`, border: `1px solid ${halo}55` }}>
                  <Icon className="h-4 w-4" style={{ color: halo }} />
                </div>
              </div>
              <h3 className="relative mt-3 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 16, color: "var(--bp-ink)", lineHeight: 1.15 }}>{c.title}</h3>
              <p className="relative mt-2" style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>{c.lead}</p>
              <ul className="bp-mono relative mt-3 space-y-1" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", lineHeight: 1.5 }}>
                {c.keys.map((k) => (
                  <li key={k} className="flex items-center gap-1.5">
                    <span style={{ width: 4, height: 4, borderRadius: 4, background: halo, boxShadow: `0 0 4px ${halo}` }} /> {k}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="max-w-xl" style={{ fontSize: 14, color: "var(--bp-ink-dim)" }}>
          Want a walkthrough of how these apply to a specific task? Send us the task + embodiment and we&apos;ll return a scoped concept map.
        </p>
        <Link href="/contact" className="bp-mono" style={{ fontSize: 13, color: "var(--bp-cyan)", display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "1px solid var(--bp-cyan)", borderRadius: 8, whiteSpace: "nowrap" }}>
          Ask for a concept map <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Sheet>
  );
}
