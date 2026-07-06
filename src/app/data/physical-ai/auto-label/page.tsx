import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { PipelineOverview } from "@/components/marketing/sections/foundry/PipelineOverview";
import { DescriptionMetadata } from "@/components/marketing/sections/foundry/DescriptionMetadata";
import { AutoLabelDeepDive } from "@/components/marketing/sections/foundry/AutoLabelDeepDive";
import { ModelStackCard } from "@/components/marketing/sections/foundry/ModelStackCard";
import { LerobotPreview } from "@/components/marketing/sections/foundry/LerobotPreview";
import { RerunEmbed } from "@/components/marketing/sections/foundry/RerunEmbed";
import { SubpageHero, Sheet, SheetHeading, StagePanel } from "@/components/marketing/blueprint/kit";
import { PageNav } from "@/components/marketing/blueprint/PageNav";
import { Breadcrumb, PrevNextFooter } from "@/components/marketing/blueprint/SubpageNav";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import { SapiensDiagnosticPanel } from "@/components/marketing/sections/foundry/SapiensDiagnosticPanel";
import { RerunIframeLoader } from "@/components/marketing/sections/foundry/qc/RerunIframeLoader";
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

const BASE_URL = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
const AUTOLABEL_JSONLD = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "Auto-Label · 8 Models · Physical AI Data Foundry",
  description:
    "How Tbrain auto-labels egocentric captures — hand kpts, body kpts, object masks, depth, verb-noun, schema_v3 provenance.",
  url: `${BASE_URL}/data/physical-ai/auto-label`,
  author: { "@type": "Organization", name: "Tbrain", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Tbrain", url: BASE_URL },
  about: [
    { "@type": "Thing", name: "Egocentric video annotation" },
    { "@type": "Thing", name: "MANO hand keypoints" },
    { "@type": "Thing", name: "Object segmentation and tracking" },
    { "@type": "Thing", name: "Monocular depth estimation" },
    { "@type": "Thing", name: "Vision-language verb-noun classification" },
  ],
};

function StageBody() {
  const body = AUTO_LABEL_STAGES.find((s) => s.key === "body")!;
  return (
    <StagePanel fig={body.fig} title={body.title} model={body.model} detail={body.detail} output={body.output} honestNote={body.honestNote}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="bp-card overflow-hidden" style={{ borderRadius: 10 }}>
          <div className="bp-mono flex items-center justify-between" style={{ padding: "6px 12px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
            <span>Exocentric mocap · body pose primary</span>
            <span style={{ color: "var(--bp-cyan)" }}>partner · signed</span>
          </div>
          <video src="/videos/modalities/exo-mocap.webm" poster="/images/modalities/exo-mocap.jpg" muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
        </div>
        <div className="bp-card overflow-hidden" style={{ borderRadius: 10 }}>
          <div className="bp-mono flex items-center justify-between" style={{ padding: "6px 12px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
            <span>Sapiens 308-kpt · ego capture</span>
            <span style={{ color: "#ff9a4d" }}>secondary · gated</span>
          </div>
          <img src="/images/body-kpts/pick_up_the_cup_t50.jpg" alt="Sapiens body on egocentric capture, face + dense gated" style={{ width: "100%", display: "block" }}  loading="lazy" />
        </div>
      </div>
      <div className="mt-4">
        <SapiensDiagnosticPanel />
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
  const successClips = [
    { name: "pick_up_the_cup · cup",           src: "/videos/masks/pick_up_the_cup__tracked_cup_cup.webm",           poster: "/videos/masks/pick_up_the_cup__tracked_cup_cup.jpg", tag: "OK" },
    { name: "pick_up_the_cup · right hand",    src: "/videos/masks/pick_up_the_cup__tracked_right_hand_right_hand.webm", poster: "/videos/masks/pick_up_the_cup__tracked_right_hand_right_hand.jpg", tag: "OK" },
    { name: "sew_hem · fabric",                src: "/videos/masks/sew_hem__tracked_fabric_fabric.webm",             poster: "/videos/masks/sew_hem__tracked_fabric_fabric.jpg", tag: "OK" },
    { name: "arrange_fabric · fabric",         src: "/videos/masks/arrange_fabric__tracked_fabric_fabric.webm",      poster: "/videos/masks/arrange_fabric__tracked_fabric_fabric.jpg", tag: "OK" },
  ];
  const failClip = {
    name: "iron_product · target: iron · SAM tracked: pants",
    src: "/videos/masks/iron_product__tracked_pants_pants.webm",
    poster: "/videos/masks/iron_product__tracked_pants_pants.jpg",
  };
  return (
    <StagePanel fig={masks.fig} title={masks.title} model={masks.model} detail={masks.detail} output={masks.output}>
      {/* success grid */}
      <div className="mb-4 bp-mono" style={{ fontSize: 10, color: "var(--bp-cyan)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        · PASS · 4 tracked objects
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {successClips.map((c) => (
          <div key={c.name} className="bp-card overflow-hidden" style={{ borderRadius: 10 }}>
            <div className="bp-mono flex items-center justify-between" style={{ padding: "6px 10px", fontSize: 9.5, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
              <span style={{ color: "#5ee08a", fontWeight: 700, letterSpacing: "0.08em" }}>{c.tag}</span>
            </div>
            <video src={c.src} poster={c.poster} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
          </div>
        ))}
      </div>

      {/* honest failure surface */}
      <div className="mt-8">
        <div className="bp-mono" style={{ fontSize: 10, color: "#ff9a4d", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          · HONEST FAILURE · we ship this flag, not silence
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="bp-card overflow-hidden" style={{ borderRadius: 10, border: "1px solid rgba(255,154,77,0.4)" }}>
            <div className="bp-mono flex items-center justify-between" style={{ padding: "8px 12px", fontSize: 10, color: "#ff9a4d", borderBottom: "1px solid rgba(255,154,77,0.3)", background: "rgba(255,154,77,0.06)" }}>
              <span>{failClip.name}</span>
              <span style={{ color: "#ff9a4d", fontWeight: 700, letterSpacing: "0.08em" }}>WRONG_OBJECT</span>
            </div>
            <video src={failClip.src} poster={failClip.poster} muted loop autoPlay playsInline preload="metadata" style={{ width: "100%", display: "block" }} />
          </div>
          <div className="bp-card" style={{ padding: 18, borderRadius: 10, background: "rgba(255,154,77,0.04)" }}>
            <div className="bp-mono" style={{ fontSize: 10.5, color: "#ff9a4d", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
              summary.json flag
            </div>
            <pre className="bp-mono mt-3" style={{ margin: 0, fontSize: 11, color: "#c8d3f0", background: "#0b1220", padding: "12px 14px", borderRadius: 8, lineHeight: 1.55, overflowX: "auto" }}>
{`{
  "check": "sam_target_match",
  "expected": "iron",
  "tracked":  "pants",
  "confidence": 0.62,
  "reason": "prompt disambiguation
   fabric ≈ pants when hand
   overlaps the iron",
  "action": "escalate → LS
   correction task"
}`}
            </pre>
            <div className="mt-3" style={{ fontSize: 12.5, color: "var(--bp-ink-dim)", lineHeight: 1.5 }}>
              The segmenter locked onto the shorts instead of the iron. The QC flag surfaces this — no silent overwrite. Downstream retrain uses this diff to sharpen prompt disambiguation.
            </div>
          </div>
        </div>
      </div>
    </StagePanel>
  );
}

function StageDepth() {
  const depth = AUTO_LABEL_STAGES.find((s) => s.key === "depth")!;
  return (
    <StagePanel fig={depth.fig} title={depth.title} model={depth.model} detail={depth.detail} output={depth.output}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          {(depth.overlayImages ?? []).map((src) => (
            <div key={src} className="overflow-hidden" style={{ borderRadius: 10, border: "1px solid var(--bp-line)" }}>
              <img src={src} alt="Monocular depth pointmap RGB + depth heatmap" style={{ width: "100%", display: "block" }} loading="lazy" />
            </div>
          ))}
        </div>
        <div className="bp-card" style={{ padding: 18, borderRadius: 12 }}>
          <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            output tensor
          </div>
          <pre className="bp-mono mt-2" style={{ margin: 0, fontSize: 11, color: "#c8d3f0", background: "#0b1220", padding: "12px 14px", borderRadius: 8, lineHeight: 1.55, overflowX: "auto" }}>
{`pointmap.shape:
  (H, W, 3) · metric · f32
intrinsics.txt:
  fx, fy, cx, cy · per-cap

world_scale check:
  ||t||_mean = 1.45 m
  bound       0.1 .. 5 m
  · PASS

feeds → object 6-DoF pose
feeds → SLAM alignment`}
          </pre>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "var(--bp-cyan)" }}>1.45m</div>
              <div className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", letterSpacing: "0.04em" }}>‖t‖ mean</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "#5ee08a" }}>PASS</div>
              <div className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", letterSpacing: "0.04em" }}>scale check</div>
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>8%</div>
              <div className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)", letterSpacing: "0.04em" }}>K err vs hand-cam</div>
            </div>
          </div>
        </div>
      </div>
    </StagePanel>
  );
}

function StageRerun() {
  const rerun = AUTO_LABEL_STAGES.find((s) => s.key === "rerun")!;
  return (
    <StagePanel fig={rerun.fig} title={rerun.title} model={rerun.model} detail={rerun.detail} output={rerun.output}>
      <RerunIframeLoader
        rrdPath="/videos/rerun/pick_up_the_cup.rrd"
        poster="/images/real-captures/pick_up_the_cup-loop.jpg"
        height={480}
      />
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(AUTOLABEL_JSONLD) }} />
      <ScrollProgress />
      <Header />
      <PageNav
        items={[
          { id: "pipeline", label: "Pipeline overview" },
          { id: "model-stack", label: "8-model stack" },
          { id: "description-metadata", label: "Description + metadata" },
          { id: "stage-hand", label: "Hand · MANO" },
          { id: "stage-body", label: "Body · Sapiens" },
          { id: "stage-masks", label: "Object masks" },
          { id: "stage-depth", label: "Depth · MoGe" },
          { id: "stage-rerun", label: "Rerun scene" },
          { id: "lerobot-export", label: "LeRobot v2 export" },
          { id: "auto-label", label: "Deep dive tabs" },
        ]}
      />
      <main>
        <Breadcrumb trail={[
          { label: "Tbrain", href: "/" },
          { label: "Physical AI", href: "/data/physical-ai" },
          { label: "Auto-Label pipeline" },
        ]} />
        <SubpageHero
          fig="FIG.05 — AUTO-LABEL PIPELINE"
          eyebrow="Physical AI · Robotics data foundry"
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

        <ModelStackCard />

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

        <LerobotPreview />

        <HardRulesBridge />

        <AutoLabelDeepDive />

        <CTA />
        <PrevNextFooter
          prev={{ label: "Physical AI overview", href: "/data/physical-ai", sub: "Landing · foundry story · 20 sections" }}
          next={{ label: "QC playbook", href: "/data/physical-ai/quality", sub: "15 hard rules · 3 human review layers" }}
        />
      </main>
      <Footer />
    </div>
  );
}
