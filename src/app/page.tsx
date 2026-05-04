import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroSection } from "@/components/marketing/sections/HeroSection";
import { CapabilitiesMarquee } from "@/components/marketing/sections/CapabilitiesMarquee";
import { ProductPillarsSection } from "@/components/marketing/sections/ProductPillarsSection";
import { StatsSection } from "@/components/marketing/sections/StatsSection";
import { PlatformSection } from "@/components/marketing/sections/PlatformSection";
import { ExpertsSection } from "@/components/marketing/sections/ExpertsSection";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Tbrain — Trusted Human Infrastructure for Agentic AI",
  description:
    "Trusted human infrastructure for agentic AI — coding, robotics, evaluation, RLHF, SFT, and post-training data programs.",
  openGraph: {
    title: "Tbrain — Trusted Human Infrastructure for Agentic AI",
    description: "The data factory behind coding, robotics, agentic workflows, evaluation, and post-training programs.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tbrain — Trusted Human Infrastructure for Agentic AI",
    description: "The data factory behind coding, robotics, agentic workflows, evaluation, and post-training programs.",
  },
};

export const revalidate = 86400;

export default function Home() {
  return (
    <div style={{ background: "var(--bg-page)" }}>
      <link
        rel="preload"
        as="image"
        href="/images/home-cinema-poster.jpg"
        fetchPriority="high"
      />
      <Header />
      <main>
        <HeroSection />
        <CapabilitiesMarquee />
        <ProductPillarsSection />
        <StatsSection />
        <PlatformSection />
        <ExpertsSection />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
