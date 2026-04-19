import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import TableStart from "@/components/tables/TableStart";
import { HeroSection } from "@/components/marketing/sections/HeroSection";
import { TrustStrip } from "@/components/marketing/sections/TrustStrip";
import { ProductPillarsSection } from "@/components/marketing/sections/ProductPillarsSection";
import { PlatformSection } from "@/components/marketing/sections/PlatformSection";
import { ExpertsSection } from "@/components/marketing/sections/ExpertsSection";
import { LeadershipSection } from "@/components/marketing/sections/LeadershipSection";
import { ContactCTA } from "@/components/marketing/sections/ContactCTA";

export const metadata: Metadata = {
  title: "Tbrain — The Data Factory for Robotics, Agents & Post-Training",
  description:
    "Ground-truth motion capture, multi-step agent benchmarks, and custom data programs. 48K+ experts across 17+ countries. Lab-grade precision. AI-native QC.",
  openGraph: {
    title: "Tbrain — The Data Factory for Robotics, Agents & Post-Training",
    description:
      "From robotics to agent evaluation — purpose-built data for frontier AI.",
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
        <ExpertsSection />
        <LeadershipSection />
        <TableStart />
        <ContactCTA />
      </main>
      <Footer />
    </div>
  );
}
