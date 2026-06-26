import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroPhysical } from "./_sections/HeroPhysical";
import { PipelineStrip } from "./_sections/PipelineStrip";
import { BentoWhy } from "./_sections/BentoWhy";
import { UseCasesGrid } from "./_sections/UseCasesGrid";
import { ModalitiesGrid } from "./_sections/ModalitiesGrid";
import { AccuracyTiers } from "./_sections/AccuracyTiers";
import { RefDatasets } from "./_sections/RefDatasets";
import { DirectionsExplorer, FactorySystem, PricingLadder } from "./_sections/FoundryDeep";
import { SystemInAction, SensorRichness, Partners } from "@/components/marketing/sections/foundry/SystemShowcase";
import { CapabilitiesMarquee } from "@/components/marketing/sections/CapabilitiesMarquee";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Physical AI — The Robotics Data Foundry",
  description:
    "How Tbrain forges lab-grade robot training data: the Tbrain capture system, the 11 Physical AI research directions and the data each needs, AI-native QC, and RLDS/LeRobot delivery.",
  alternates: { canonical: "/data/physical-ai" },
  openGraph: {
    title: "Physical AI — The Robotics Data Foundry",
    description:
      "The Tbrain capture system, 11 research directions, AI-native QC, and RLDS-ready delivery for robot foundation models.",
    url: "/data/physical-ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physical AI — The Robotics Data Foundry",
    description:
      "The Tbrain capture system, 11 research directions, AI-native QC, and RLDS-ready delivery for robot foundation models.",
  },
};

export default function PhysicalAIPage() {
  return (
    <div style={{ background: "#020617" }}>
      <link
        rel="preload"
        as="image"
        href="/images/physical-poster.jpg"
        fetchPriority="high"
      />
      <Header />
      <main style={{ color: "white" }}>
        <HeroPhysical />
        <CapabilitiesMarquee />
        <FactorySystem />
        <SystemInAction />
        <DirectionsExplorer />
        <SensorRichness />
        <PipelineStrip />
        <BentoWhy />
        <UseCasesGrid />
        <ModalitiesGrid />
        <AccuracyTiers />
        <PricingLadder />
        <Partners />
        <RefDatasets />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
