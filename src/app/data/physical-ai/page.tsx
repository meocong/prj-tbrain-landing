import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { CinemaHero } from "@/components/marketing/sections/foundry/CinemaHero";
import {
  DataForWhatYouBuild,
  WhyTbrainSheet,
  BeyondRobotics,
} from "@/components/marketing/sections/foundry/Sheets";
import { Catalog, EngagementLadder } from "@/components/marketing/sections/foundry/DeckSections";
import { LiveTicker } from "@/components/marketing/sections/foundry/LiveTicker";
import { HardwareShowcase } from "@/components/marketing/sections/foundry/HardwareShowcase";
import { CapturesGallery } from "@/components/marketing/sections/foundry/CapturesGallery";
import { RerunEmbed } from "@/components/marketing/sections/foundry/RerunEmbed";
import { PublicDatasetWall } from "@/components/marketing/sections/foundry/PublicDatasetWall";
import { PipelineOverview } from "@/components/marketing/sections/foundry/PipelineOverview";
import { AutoLabelDeepDive } from "@/components/marketing/sections/foundry/AutoLabelDeepDive";
import { QCFlow } from "@/components/marketing/sections/foundry/QCFlow";
import { GlanceStats } from "@/components/marketing/sections/foundry/GlanceStats";
import { ANCHOR_TRUST } from "@/lib/landing/physical-ai";

export const metadata: Metadata = {
  title: "The Robotics Data Foundry for Physical AI",
  description:
    "Lab-grade, action-paired robot training data across the full range — egocentric, exocentric, UMI, teleoperation, and lab-grade mocap — QC'd by an AI-native pipeline and delivered RLDS / LeRobot-ready for Physical AI.",
  alternates: { canonical: "/data/physical-ai" },
  openGraph: {
    title: "Tbrain | The Robotics Data Foundry for Physical AI",
    description: "We forge lab-grade, action-paired datasets for robot foundation models — captured, synchronized, and QC'd at factory scale.",
    url: "/data/physical-ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tbrain | The Robotics Data Foundry for Physical AI",
    description: "We forge lab-grade, action-paired datasets for robot foundation models — captured, synchronized, and QC'd at factory scale.",
  },
};

export const revalidate = 86400;

const BASE_URL = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
const SERVICE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Robotics Training Data",
  serviceType: "Robot training data for Physical AI",
  provider: { "@type": "Organization", name: "Tbrain", url: BASE_URL },
  areaServed: "Worldwide",
  url: `${BASE_URL}/data/physical-ai`,
  description:
    "Action-paired robot training data across the full range — egocentric, exocentric, UMI, teleoperation, and lab-grade mocap — QC'd by an AI-native pipeline and delivered RLDS / LeRobot-ready.",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Data modalities",
    itemListElement: [
      "Egocentric video capture",
      "Spatial / multi-view RGB-D capture",
      "UMI / handheld gripper demonstrations",
      "Teleoperation demonstrations",
      "Lab-grade motion capture",
      "Annotation & QA",
    ].map((n) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: n } })),
  },
};

function AnchorStrip() {
  return (
    <section className="bp-grid" style={{ borderTop: "1px solid var(--bp-line)", borderBottom: "1px solid var(--bp-line)", paddingTop: 28, paddingBottom: 28 }}>
      <div className="container mx-auto flex flex-col items-center gap-5 px-5 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="bp-mono" style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--bp-ink)" }}>{ANCHOR_TRUST.labs}</div>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {ANCHOR_TRUST.standards.map((s) => (
            <div key={s.name} className="text-center">
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bp-cyan)" }}>{s.name}</div>
              <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FoundryCTA() {
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ paddingTop: 92, paddingBottom: 100 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, color-mix(in srgb, var(--bp-cyan) 9%, transparent), transparent 60%)" }} />
      <div className="container relative z-10 mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.06, color: "var(--bp-ink)" }}>Forge your next dataset with us</h2>
        <p className="mx-auto mt-5 max-w-xl" style={{ fontSize: 17, color: "var(--bp-ink-dim)" }}>Tell us the task, the embodiment, and the format. We&apos;ll scope a sample batch — captured, QC&apos;d, and delivered RLDS-ready.</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}>See a sample dataset <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>Talk to us</Link>
        </div>
      </div>
    </section>
  );
}

export default function PhysicalAIPage() {
  return (
    <div style={{ background: "var(--bp-bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSONLD) }} />
      <Header />
      <main>
        {/* 01 · Cinema hero */}
        <CinemaHero />

        {/* 02 · Live ticker — delivered vs capacity */}
        <LiveTicker />

        {/* 03 · Anchor trust strip */}
        <AnchorStrip />

        {/* 03b · At-a-glance stat row */}
        <GlanceStats />

        {/* 04 · Pipeline overview — canonical 5-phase diagram */}
        <PipelineOverview />

        {/* 05 · Capture ledger — real episodes surface first */}
        <CapturesGallery />

        {/* 06 · Auto-label deep dive — 4-tab per-stage · full detail on /auto-label */}
        <AutoLabelDeepDive />

        {/* 07 · QC flow — 15 hard rules teaser · full detail on /quality */}
        <QCFlow />

        {/* 08 · Rerun episode viewer */}
        <RerunEmbed />

        {/* 09 · Ten modalities · one export contract */}
        <Catalog />

        {/* 10 · Hardware pack + operator app concept */}
        <HardwareShowcase />

        {/* 11 · Data for what you build (use cases) */}
        <DataForWhatYouBuild />

        {/* 12 · Public egocentric dataset wall */}
        <PublicDatasetWall />

        {/* 13 · Why Tbrain */}
        <WhyTbrainSheet />

        {/* 14 · Engagement ladder */}
        <EngagementLadder />

        {/* 15 · Beyond robotics footer band */}
        <BeyondRobotics />

        {/* 16 · CTA */}
        <FoundryCTA />
      </main>
      <Footer />
    </div>
  );
}
