import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TableStart from "@/components/tables/TableStart";
import { HeroSection } from "@/components/marketing/sections/HeroSection";
import { CaseStudiesSection } from "@/components/marketing/sections/CaseStudiesSection";
import { ScalingSection } from "@/components/marketing/sections/ScalingSection";
import { ExpertsSection } from "@/components/marketing/sections/ExpertsSection";
import { ProjectsSection } from "@/components/marketing/sections/ProjectsSection";
import { LeadershipSection } from "@/components/marketing/sections/LeadershipSection";
import { ExpertiseSection } from "@/components/marketing/sections/ExpertiseSection";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Tbrain — AI Training Data & Evaluation",
  description:
    "Expert-validated environments and data to measure and improve agent performance. Fast, scalable, and reliable. 48K+ experts across 17+ countries.",
  openGraph: {
    title: "Tbrain — AI Training Data & Evaluation",
    description:
      "The improvement layer for agentic AI training data and evaluation.",
    type: "website",
  },
};

export const revalidate = 86400; // 24h ISR

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <CaseStudiesSection />
        <ScalingSection />
        <ExpertsSection />
        <div className="wrap">
          <div className="one top-0 left-0 h-80 w-80" />
          <div className="two top-0 right-0 h-80 w-80" />
        </div>
        <ProjectsSection />
        <LeadershipSection />
        <ExpertiseSection />
        <TableStart />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
