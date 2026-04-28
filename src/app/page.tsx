import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroSection } from "@/components/marketing/sections/HeroSection";
import { CapabilitiesMarquee } from "@/components/marketing/sections/CapabilitiesMarquee";
import { ProductPillarsSection } from "@/components/marketing/sections/ProductPillarsSection";
import { StatsSection } from "@/components/marketing/sections/StatsSection";
import { PlatformSection } from "@/components/marketing/sections/PlatformSection";
import { ExpertsSection } from "@/components/marketing/sections/ExpertsSection";
import { LeadershipSection } from "@/components/marketing/sections/LeadershipSection";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Tbrain — The Data Factory for Robotics, Agents & Post-Training",
  description:
    "Ground-truth motion capture, multi-step agent benchmarks, and custom data programs. Lab-grade precision. AI-native QC. Global expert network.",
  openGraph: {
    title: "Tbrain — The Data Factory for Robotics, Agents & Post-Training",
    description: "From robotics to agent evaluation — purpose-built data for frontier AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tbrain — The Data Factory for Robotics, Agents & Post-Training",
    description: "From robotics to agent evaluation — purpose-built data for frontier AI.",
  },
};

export const revalidate = 86400;

export default function Home() {
  return (
    <div style={{ background: "var(--bg-page)" }}>
      <Header />
      <main>
        <HeroSection />
        <CapabilitiesMarquee />
        <ProductPillarsSection />
        <StatsSection />
        <PlatformSection />
        <ExpertsSection />
        <LeadershipSection />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
