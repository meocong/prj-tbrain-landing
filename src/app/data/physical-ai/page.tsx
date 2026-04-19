import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroPhysical } from "./_sections/HeroPhysical";
import { BentoWhy } from "./_sections/BentoWhy";
import { UseCasesGrid } from "./_sections/UseCasesGrid";
import { ModalitiesGrid } from "./_sections/ModalitiesGrid";
import { AccuracyTiers } from "./_sections/AccuracyTiers";
import { RefDatasets } from "./_sections/RefDatasets";
import { CapabilitiesMarquee } from "@/components/marketing/sections/CapabilitiesMarquee";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Physical AI & Robotics Data",
  description:
    "Ground-truth human motion data for training humanoid control policies, imitation learning, and sim-to-real transfer. Lab-grade precision, not estimated from video.",
};

export default function PhysicalAIPage() {
  return (
    <div style={{ background: "#020617" }}>
      <Header />
      <main style={{ color: "white" }}>
        <HeroPhysical />
        <CapabilitiesMarquee />
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
