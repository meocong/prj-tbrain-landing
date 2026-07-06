import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { PipelineOverview } from "@/components/marketing/sections/foundry/PipelineOverview";
import { QCFlow } from "@/components/marketing/sections/foundry/QCFlow";
import { LabelStudioCard } from "@/components/marketing/sections/foundry/qc/LabelStudioCard";
import { RerunCapturedCard } from "@/components/marketing/sections/foundry/qc/RerunCapturedCard";
import { RerunIframeLoader } from "@/components/marketing/sections/foundry/qc/RerunIframeLoader";
import { SubpageHero, Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { PageNav } from "@/components/marketing/blueprint/PageNav";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { HARD_RULES, HUMAN_QC, PROVENANCE_LOG, QC_DELTA } from "@/lib/landing/physical-ai-qc";

export const metadata: Metadata = {
  title: "QC Playbook · Physical AI Data Foundry",
  description:
    "Tbrain's zero-trust QC pipeline — 15 hard rules, AI filter, and 3 human-review layers. Every ship-ready capture leaves a schema_v3 provenance trail and a Rerun scene.",
  alternates: { canonical: "/data/physical-ai/quality" },
  openGraph: {
    title: "Zero-Trust QC · 15 Hard Rules + 3-Layer Human Review",
    description: "0 → 92% ship-ready · every fix keeps the provenance trail intact.",
    url: "/data/physical-ai/quality",
    type: "website",
  },
};

export const revalidate = 86400;

const BASE_URL = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
const QUALITY_JSONLD = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "QC Playbook · Physical AI Data Foundry",
  description:
    "Tbrain's zero-trust QC pipeline — 15 hard rules, AI filter, 3 human review layers, schema_v3 provenance, Rerun proof.",
  url: `${BASE_URL}/data/physical-ai/quality`,
  author: { "@type": "Organization", name: "Tbrain", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Tbrain", url: BASE_URL },
  about: [
    { "@type": "Thing", name: "Data quality control" },
    { "@type": "Thing", name: "Label Studio human-in-the-loop annotation" },
    { "@type": "Thing", name: "Schema versioning and provenance" },
    { "@type": "Thing", name: "Rerun scene inspection" },
  ],
};

const CATEGORY_COLOR: Record<string, string> = {
  calibration: "#4cb5ff",
  detection:   "#00e5c7",
  temporal:    "#a78bfa",
  spatial:     "#ff9a4d",
  semantic:    "#5ee08a",
  provenance:  "#f0a2ff",
};

function Layer1HardRules() {
  const byCategory = HARD_RULES.reduce<Record<string, typeof HARD_RULES>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});
  return (
    <Sheet id="hard-rules" fig="FIG.06A — LAYER 1 · 15 HARD RULES" axis>
      <SheetHeading
        title="15 machine-checkable rules · every capture · zero human cost"
        lead="Every rule maps to a real failure mode we've caught in the field. If any fires, the capture routes into human review with the exact reason attached."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {Object.entries(byCategory).map(([cat, rules]) => (
          <div key={cat} className="bp-card" style={{ padding: 20, borderRadius: 14 }}>
            <div className="bp-mono flex items-center justify-between" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              <span>· {cat}</span>
              <span style={{ color: CATEGORY_COLOR[cat] }}>{rules.length} checks</span>
            </div>
            <ul className="mt-3 space-y-3">
              {rules.map((r) => (
                <li key={r.id} className="flex items-start gap-3">
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 6, background: `color-mix(in srgb, ${CATEGORY_COLOR[cat]} 20%, transparent)`, color: CATEGORY_COLOR[cat], flexShrink: 0 }}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: "var(--bp-ink)", fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.5, marginTop: 3 }}>{r.detail}</div>
                    <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", marginTop: 4 }}>
                      threshold · <span style={{ color: CATEGORY_COLOR[cat] }}>{r.threshold}</span> · sample · <span style={{ color: "var(--bp-ink-dim)" }}>{r.sampleOk}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function Layer2AIFilter() {
  return (
    <Sheet id="ai-filter" fig="FIG.06B — LAYER 2 · AI FILTER" axis={false}>
      <SheetHeading
        title="AI filter · what the hard rules can't reason about"
        lead="Where the hard-rules gate is thresholds, the AI filter is judgment: confidence-weighted smoothing, cross-modal consistency (does the mask agree with the depth?), and out-of-distribution detection."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {[
          { k: "Confidence smoothing", v: "Per-frame kpt confidence dips are smoothed if temporally isolated. Sustained dips escalate to Label Studio." },
          { k: "Cross-modal consistency", v: "The segmenter mask and the depth pointmap must agree on the object envelope within a tolerance — catches SAM-vs-object mismatch (iron_T02 flag)." },
          { k: "Out-of-distribution", v: "Novel objects flagged with an ontology_missing tag. Not a reject — a signal to add an ontology entry before ship." },
        ].map((row) => (
          <div key={row.k} className="bp-card" style={{ padding: 20, borderRadius: 14 }}>
            <div style={{ fontSize: 14, color: "var(--bp-ink)", fontWeight: 600 }}>{row.k}</div>
            <p className="mt-2" style={{ fontSize: 13, color: "var(--bp-ink-dim)", lineHeight: 1.55 }}>{row.v}</p>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function Layer3LabelStudio() {
  return (
    <Sheet id="label-studio" fig="FIG.06C — LAYER 3 · LABEL STUDIO" axis>
      <SheetHeading
        title="Label Studio · humans on the last mile, not the first"
        lead="Only PARTIAL/FAIL captures reach Label Studio, pre-populated with auto-label output. Annotators correct kpt drift, adjust masks, override verb-noun — never annotate from a blank slate. Every correction lands as a labeled diff back into the training loop."
      />
      <div className="mt-8">
        <LabelStudioCard />
      </div>
    </Sheet>
  );
}

function Layer4Reviewer() {
  return (
    <Sheet id="human-qc" fig="FIG.06D — LAYER 4 · REVIEWER SIGN-OFF" axis={false}>
      <SheetHeading
        title="Reviewer sign-off + escalation dashboard"
        lead="A second annotator reviews every correction. Accept, reject, flag. Systemic failures (segmenter locked wrong object, SLAM divergence across multiple caps) escalate to engineering and feed the auto-label training loop."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="bp-card overflow-hidden" style={{ borderRadius: 12 }}>
          <img src="/images/platform/project-overview.png" alt="Reviewer sign-off dashboard" style={{ width: "100%", display: "block" }} />
          <div className="bp-mono" style={{ padding: "10px 14px", fontSize: 11, color: "var(--bp-ink-dim)", borderTop: "1px solid var(--bp-line)" }}>Reviewer dashboard · task queue · sign-off + escalate</div>
        </div>
        <div className="bp-card" style={{ padding: 20, borderRadius: 14 }}>
          <div className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>WORKFLOW · 5 STEPS</div>
          <ol className="mt-3 space-y-3">
            {HUMAN_QC.workflow.map((w) => (
              <li key={w.step} className="flex gap-3">
                <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)", flexShrink: 0 }}>{w.step}</span>
                <div>
                  <div style={{ fontSize: 13, color: "var(--bp-ink)", fontWeight: 600 }}>{w.label}</div>
                  <div style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.5, marginTop: 2 }}>{w.detail}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Sheet>
  );
}

function ProvenanceLogSection() {
  return (
    <Sheet id="provenance" fig="FIG.06E — PROVENANCE TRAIL" axis>
      <SheetHeading
        title="Every field records the model that produced it"
        lead="labels.json.models is not decorative — downstream diffs, model rollouts, and root-cause reports all read this trail. Any claim we make is diffable."
      />
      <div className="mt-8 bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden" }}>
        <div className="bp-mono grid grid-cols-[80px_1fr_100px_140px_1fr] gap-3" style={{ padding: "10px 16px", fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase", borderBottom: "1px solid var(--bp-line)" }}>
          <span>Stage</span>
          <span>Model</span>
          <span>Version</span>
          <span>Git SHA</span>
          <span>Role</span>
        </div>
        {PROVENANCE_LOG.map((p) => (
          <div key={p.stage} className="grid grid-cols-[80px_1fr_100px_140px_1fr] gap-3 items-center" style={{ padding: "12px 16px", borderTop: "1px solid var(--bp-line)" }}>
            <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-cyan)", letterSpacing: "0.04em" }}>{p.stage}</span>
            <span style={{ fontSize: 13, color: "var(--bp-ink)", fontWeight: 600 }}>{p.model}</span>
            <span className="bp-mono" style={{ fontSize: 11, color: "var(--bp-ink-dim)" }}>{p.version}</span>
            <span className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>{p.git}</span>
            <span style={{ fontSize: 12.5, color: "var(--bp-ink-dim)" }}>{p.role}</span>
          </div>
        ))}
      </div>
    </Sheet>
  );
}

function RerunProof() {
  return (
    <Sheet id="rerun-proof" fig="FIG.06F — RERUN PROOF" axis={false}>
      <SheetHeading
        title="Every ship-ready capture ships with its Rerun scene"
        lead="No screenshots, no cherry-picked metrics — just the raw multi-track scene. Open it in the same viewer our engineers use. Any regression, any claim, any anomaly is scrubbable by the buyer, not just by us."
      />
      <div className="mt-8 grid gap-4">
        <RerunIframeLoader
          rrdPath="/videos/rerun/pick_up_the_cup.rrd"
          poster="/images/real-captures/pick_up_the_cup-loop.jpg"
          height={520}
        />
        <RerunCapturedCard />
      </div>
    </Sheet>
  );
}

function DeltaStats() {
  return (
    <Sheet id="delta" fig={QC_DELTA.fig} axis>
      <SheetHeading title={QC_DELTA.title} lead={QC_DELTA.lead} />
      <div className="mt-8 bp-card" style={{ padding: 24, borderRadius: 14 }}>
        <div className="space-y-4">
          {QC_DELTA.rows.map((r) => (
            <div key={r.k} className="flex items-center gap-4">
              <div style={{ width: 200 }}>
                <div style={{ fontSize: 13, color: "var(--bp-ink)", fontWeight: 600 }}>{r.k}</div>
                <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", marginTop: 2 }}>{r.sub}</div>
              </div>
              <div className="flex-1" style={{ height: 12, background: "var(--bp-line)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${r.v}%`, background: "linear-gradient(90deg, var(--bp-cyan), var(--bp-accent, #00e5c7))" }} />
              </div>
              <div className="bp-mono" style={{ fontSize: 16, color: "var(--bp-cyan)", width: 64, textAlign: "right", fontWeight: 700 }}>
                <CountUp value={r.v} duration={1.6} />%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Sheet>
  );
}

function CTA() {
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ paddingTop: 72, paddingBottom: 88 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--bp-cyan) 9%, transparent), transparent 60%)" }} />
      <div className="container relative z-10 mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, color: "var(--bp-ink)" }}>Ask for a sample QC report on any capture</h2>
        <p className="mx-auto mt-4 max-w-xl" style={{ fontSize: 16, color: "var(--bp-ink-dim)" }}>
          We ship a full summary.json + .rrd with every episode. Pick a task, and we&apos;ll walk you through the hard rules on a real capture.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}>
            Request a sample QC report <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/data/physical-ai/auto-label" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>
            See auto-label pipeline
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function QualityPage() {
  return (
    <div style={{ background: "var(--bp-bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(QUALITY_JSONLD) }} />
      <ScrollProgress />
      <Header />
      <PageNav
        items={[
          { id: "pipeline", label: "Pipeline overview" },
          { id: "hard-rules", label: "Layer 1 · Hard rules" },
          { id: "ai-filter", label: "Layer 2 · AI filter" },
          { id: "label-studio", label: "Layer 3 · Label Studio" },
          { id: "human-qc", label: "Layer 4 · Reviewer" },
          { id: "provenance", label: "Provenance trail" },
          { id: "rerun-proof", label: "Rerun proof" },
          { id: "delta", label: "Ship-rate delta" },
        ]}
      />
      <main>
        <SubpageHero
          fig="FIG.06 — QC PLAYBOOK"
          eyebrow="Physical AI · Robotics data foundry"
          title="Zero-trust QC · hard rules + AI filter + 3-layer human review"
          lead="Every capture crosses 15 machine-checkable hard rules, an AI filter, and up to three human review layers before it ships. Every fix keeps the schema_v3 provenance trail intact, and every episode leaves a Rerun scene the buyer can open."
          meta={[
            { k: "Hard rules", v: "15" },
            { k: "Human layers", v: "3" },
            { k: "Ship rate", v: "92%" },
            { k: "Provenance", v: "per-field" },
          ]}
        />

        <PipelineOverview highlight="qc" showAnchors={false} />

        <Layer1HardRules />
        <Layer2AIFilter />
        <Layer3LabelStudio />
        <Layer4Reviewer />
        <ProvenanceLogSection />
        <RerunProof />
        <DeltaStats />
        <QCFlow />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
