import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TableStart from "@/components/tables/TableStart";
import { HeroSection } from "@/components/marketing/sections/HeroSection";
import { TrustStrip } from "@/components/marketing/sections/TrustStrip";
import { ProductPillarsSection } from "@/components/marketing/sections/ProductPillarsSection";
import { PlatformSection } from "@/components/marketing/sections/PlatformSection";
import { CaseStudiesSection } from "@/components/marketing/sections/CaseStudiesSection";
import { ExpertsSection } from "@/components/marketing/sections/ExpertsSection";
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

export const revalidate = 86400;

export default function Home() {
  return (
    <div>
      <Header />
      <main>
        <HeroSection />
        <TrustStrip />
        <ProductPillarsSection />
        <PlatformSection />
        <CaseStudiesSection />
        <ExpertsSection />
        <LeadershipSection />
        <ExpertiseSection />
        <TableStart />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
