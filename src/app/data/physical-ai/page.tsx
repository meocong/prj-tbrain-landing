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
import { CapabilitiesMarquee } from "@/components/marketing/sections/CapabilitiesMarquee";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Physical AI — Human Motion Data for Training Humanoids",
  description:
    "Lab-grade demonstration datasets for training humanoid robots: whole-body control, dexterous manipulation, imitation learning, sim-to-real transfer. Human demo → mocap → retarget → policy-ready exports.",
  alternates: { canonical: "/data/physical-ai" },
  openGraph: {
    title: "Physical AI — Human Motion Data for Training Humanoids",
    description:
      "Cinema-grade motion capture and policy-ready embodied AI datasets for humanoids, manipulation, and sim-to-real transfer.",
    url: "/data/physical-ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Physical AI — Human Motion Data for Training Humanoids",
    description:
      "Cinema-grade motion capture and policy-ready embodied AI datasets for humanoids, manipulation, and sim-to-real transfer.",
  },
};

export default function PhysicalAIPage() {
  return (
    <div style={{ background: "#020617" }}>
      <Header />
      <main style={{ color: "white" }}>
        <HeroPhysical />
        <CapabilitiesMarquee />
        <PipelineStrip />
        <BentoWhy />
        <UseCasesGrid />
        <ModalitiesGrid />
        <AccuracyTiers />
        <RefDatasets />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
