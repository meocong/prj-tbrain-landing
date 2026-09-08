import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroSamples } from "./_sections/HeroSamples";
import { CorpusLines } from "./_sections/CorpusLines";
import { SampleCatalog } from "./_sections/SampleCatalog";
import { DeliveryLayers } from "./_sections/DeliveryLayers";
import { TelemetryStrip } from "./_sections/TelemetryStrip";
import { Evidence } from "./_sections/Evidence";
import { AccessPaths } from "./_sections/AccessPaths";

const TITLE = "Sample Library: Robotics, Game and Off-the-shelf Data";
const OG_ALT = "Frames from Tbrain sample deliveries: workshop egocentric capture, gripper footage and game sessions";
const DESCRIPTION =
  "Play real delivery files from Tbrain's robotics, video game and off-the-shelf egocentric corpora. Frame-level telemetry, capture metadata and access to the full sets.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/samples" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/samples",
    type: "website",
    images: [{ url: "/samples/og.jpg", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/samples/og.jpg"],
  },
};

export default function SamplesPage() {
  return (
    <div className="samples-scope" style={{ background: "var(--sm-base)" }}>
      <Header />
      <main style={{ color: "var(--sm-text)" }}>
        <HeroSamples />
        <SampleCatalog />
        <CorpusLines />
        <DeliveryLayers />
        <TelemetryStrip />
        <Evidence />
        <AccessPaths />
      </main>
      <Footer />
    </div>
  );
}
