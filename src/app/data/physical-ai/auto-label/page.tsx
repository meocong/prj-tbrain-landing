import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { PipelineOverview } from "@/components/marketing/sections/foundry/PipelineOverview";
import { DescriptionMetadata } from "@/components/marketing/sections/foundry/DescriptionMetadata";
import { AutoLabelDeepDive } from "@/components/marketing/sections/foundry/AutoLabelDeepDive";
import { RerunEmbed } from "@/components/marketing/sections/foundry/RerunEmbed";
import { SubpageHero, Sheet, SheetHeading, StagePanel } from "@/components/marketing/blueprint/kit";
import { AUTO_LABEL_STAGES } from "@/lib/landing/physical-ai-qc";

export const metadata: Metadata = {
  title: "Auto-Label · 8 Models · Physical AI Data Foundry",
  description:
    "How Tbrain auto-labels egocentric captures — hand kpts, body kpts, object masks, depth, verb-noun, and schema_v3 provenance. Every stage visualized on real captures.",
  alternates: { canonical: "/data/physical-ai/auto-label" },
  openGraph: {
    title: "Auto-Label · 8 Models · One Contract",
    description: "From raw rgb.mp4 to schema_v3 labels.json in ≤48h.",
    url: "/data/physical-ai/auto-label",
    type: "website",
  },
};

export const revalidate = 86400;

function StageBody() {
  const body = AUTO_LABEL_STAGES.find((s) => s.key === "body")!;
  return (
    <StagePanel fig={body.fig} title={body.title} model={body.model} detail={body.detail} output={body.output}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(body.overlayImages ?? []).map((src) => (
          <div key={src} className="overflow-hidden" style={{ borderRadius: 10, border: "1px solid var(--bp-line)" }}>
            <img src={src} alt="Sapiens 308-kpt body overlay" style={{ width: "100%", display: "block" }} />
          </div>
        ))}
      </div>
    </StagePanel>
  );
}

function StageHand() {
  const hand = AUTO_LABEL_STAGES.find((s) => s.key === "hand")!;
  const pairs = [
    { name: "iron_01",    raw: "/videos/textile-raw/iron_01.webm",    overlay: "/videos/textile-annotated/iron_01.webm" },
    { name: "sew_01",     raw: "/videos/textile-raw/sew_01.webm",     overlay: "/videos/textile-annotated/sew_01.webm" },
    { name: "arrange_01", raw: "/videos/textile-raw/arrange_01.webm", overlay: "/videos/textile-annotated/arrange_01.webm" },
  ];
  return (
    <StagePanel fig={hand.fig} title={hand.title} model={hand.model} detail={hand.detail} output={hand.output}>
      <div className="grid gap-3 lg:grid-cols-3">
        {pairs.map((p) => (
          <div key={p.name} className="bp-card overflow-hidden" style={{ borderRadius: 10 }}>
            <div className="bp-mono flex items-center justify-between" style={{ padding: "6px 12px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>{p.name}</span>
              <span style={{ color: "var(--bp-cyan)" }}>MANO 21-kpt</span>
            </div>
            <video src={p.overlay} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
          </div>
        ))}
      </div>
    </StagePanel>
  );
}

function StageMasks() {
  const masks = AUTO_LABEL_STAGES.find((s) => s.key === "masks")!;
  const clips = [
    { name: "pick_up_the_cup · cup", src: "/videos/masks/pick_up_the_cup__tracked_cup_cup.webm", poster: "/videos/masks/pick_up_the_cup__tracked_cup_cup.jpg" },
    { name: "iron_product · target", src: "/videos/masks/iron_product__tracked_pants_pants.webm", poster: "/videos/masks/iron_product__tracked_pants_pants.jpg" },
  ];
  return (
    <StagePanel fig={masks.fig} title={masks.title} model={masks.model} detail={masks.detail} output={masks.output} honestNote={masks.honestNote}>
      <div className="grid gap-3 lg:grid-cols-2">
        {clips.map((c) => (
          <div key={c.name} className="bp-card overflow-hidden" style={{ borderRadius: 10 }}>
            <div className="bp-mono flex items-center justify-between" style={{ padding: "6px 12px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span>{c.name}</span>
              <span style={{ color: "var(--bp-cyan)" }}>tracked · masked</span>
            </div>
            <video src={c.src} poster={c.poster} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
          </div>
        ))}
      </div>
    </StagePanel>
  );
}

function StageDepth() {
  const depth = AUTO_LABEL_STAGES.find((s) => s.key === "depth")!;
  return (
    <StagePanel fig={depth.fig} title={depth.title} model={depth.model} detail={depth.detail} output={depth.output}>
      <div className="grid gap-3">
        {(depth.overlayImages ?? []).map((src) => (
          <div key={src} className="overflow-hidden" style={{ borderRadius: 10, border: "1px solid var(--bp-line)" }}>
            <img src={src} alt="Monocular depth pointmap" style={{ width: "100%", display: "block" }} />
          </div>
        ))}
      </div>
    </StagePanel>
  );
}

function StageRerun() {
  const rerun = AUTO_LABEL_STAGES.find((s) => s.key === "rerun")!;
  return (
    <StagePanel fig={rerun.fig} title={rerun.title} model={rerun.model} detail={rerun.detail} output={rerun.output}>
      <div className="bp-card overflow-hidden" style={{ borderRadius: 10 }}>
        <div className="bp-mono flex items-center justify-between" style={{ padding: "8px 14px", fontSize: 11, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
          <span>PROOF VIDEO · aloha-4cam (sample public capture)</span>
          <a
            href="https://app.rerun.io/version/0.24.0/index.html?url=https%3A%2F%2Fwww.tbrain.ai%2Fvideos%2Frerun%2Faloha-4cam.rrd"
            target="_blank"
            rel="noopener noreferrer"
            className="bp-mono"
            style={{ fontSize: 11, color: "var(--bp-cyan)" }}
          >
            Open in Rerun ↗
          </a>
        </div>
        <video src="/videos/deliverables/aloha-4cam.mp4" muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
      </div>
    </StagePanel>
  );
}

function CTA() {
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ paddingTop: 72, paddingBottom: 88 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--bp-cyan) 9%, transparent), transparent 60%)" }} />
      <div className="container relative z-10 mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1, color: "var(--bp-ink)" }}>Ship in RLDS, LeRobot, or your schema</h2>
        <p className="mx-auto mt-4 max-w-xl" style={{ fontSize: 16, color: "var(--bp-ink-dim)" }}>
          Every capture ships with the full schema_v3 labels.json — no proprietary format, no conversion contract.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/data/physical-ai/quality" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}>
            See QC playbook <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>
            Ask for a sample
          </Link>
        </div>
      </div>
    </section>
  );
}

function HardRulesBridge() {
  return (
    <Sheet fig="FIG.05H — QC BRIDGE" axis={false}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-center">
        <div>
          <SheetHeading
            title="Every stage output is validated before humans see it"
            lead="15 hard rules run after every auto-label pass. FAIL/PARTIAL routes into Label Studio; only PASS ships. Every fix keeps the schema_v3 provenance trail intact."
          />
        </div>
        <div>
          <Link href="/data/physical-ai/quality" className="bp-mono" style={{ fontSize: 13, color: "var(--bp-cyan)", display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 20px", border: "1px solid var(--bp-cyan)", borderRadius: 8 }}>
            See QC playbook <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Sheet>
  );
}

export default function AutoLabelPage() {
  return (
    <div style={{ background: "var(--bp-bg)" }}>
      <Header />
      <main>
        <SubpageHero
          fig="FIG.05 — AUTO-LABEL PIPELINE"
          eyebrow="Physical AI · Data Foundry · V5"
          title="8 models · one auto-label pipeline"
          lead="From raw rgb.mp4 to schema_v3 labels.json in ≤48h. Hand kpts, body kpts, object masks, depth, verb-noun, and a full provenance trail — visualized on real captures, not mockups."
          meta={[
            { k: "Models", v: "8" },
            { k: "Latency", v: "≤ 48h" },
            { k: "Schema", v: "v3.0" },
            { k: "Provenance", v: "per-field" },
          ]}
        />

        <PipelineOverview highlight="auto-label" showAnchors={false} />

        <section id="stage-description">
          <DescriptionMetadata />
        </section>

        <section id="stage-hand" className="bp-grid bp-frame" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container mx-auto px-5">
            <StageHand />
          </div>
        </section>

        <section id="stage-body" className="bp-grid bp-frame" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container mx-auto px-5">
            <StageBody />
          </div>
        </section>

        <section id="stage-masks" className="bp-grid bp-frame" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container mx-auto px-5">
            <StageMasks />
          </div>
        </section>

        <section id="stage-depth" className="bp-grid bp-frame" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container mx-auto px-5">
            <StageDepth />
          </div>
        </section>

        <section id="stage-rerun" className="bp-grid bp-frame" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div className="container mx-auto px-5">
            <StageRerun />
          </div>
        </section>

        <RerunEmbed />

        <HardRulesBridge />

        <AutoLabelDeepDive />

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
