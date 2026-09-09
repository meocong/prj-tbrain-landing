import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroSamples } from "./_sections/HeroSamples";
import { CategoryChooser } from "./_sections/CategoryChooser";
import { TwoRoutes } from "./_sections/TwoRoutes";
import { Coverage } from "./_sections/Coverage";
import { AccessPaths } from "./_sections/AccessPaths";

// Named by the three lines of business, matching the chooser below it.
//
// It has been narrowed twice and widened back both times. It once listed
// "Robotics, Game and Off-the-shelf", which put a purchase route beside two
// subjects; it then named a single modality, Egocentric, on a page that also
// sells gaming and Coding & STEM. This page is the front door for all three, so
// it is titled at that level and the modalities are titled on their own routes.
// "Training data" first, for the same reason the h1 leads with it: "Data
// Samples" alone does not say what the data is for. This is the shape our own
// `samples.tbrain.ai` already uses — "Tbrain — Egocentric Stereo Data · Sample
// Pack" — widened from one modality to the three lines this page covers.
const TITLE = "Training Data Samples: Robotics, Gaming, Coding and STEM";
const OG_ALT = "Frames from Tbrain sample deliveries: workshop egocentric capture, gripper footage and game sessions";
const DESCRIPTION =
  "Play real delivery files from every set Tbrain sells, off the shelf or collected to spec. Frame-level telemetry, capture metadata and access to the full sets.";

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
        {/* The front door, not the catalogue. Browsing happens at
            /samples/[category], where a page has room to say what a category is
            before showing 118 of it. CorpusLines used to sit here saying the
            same thing worse, per line rather than per category. */}
        {/* Five sections, down from eight.
            Tam, 2026-09-09: "trang chủ ngắn gọn súc tích, các ý chính thôi."

            Measured before cutting, so the three that went were the three
            costing the most for the least:

              hero                 76 w    812px   keep
              CategoryChooser     418 w  3,060px   keep — it IS the page
              TwoRoutes           122 w    716px   keep
              Coverage            142 w  1,082px   keep
              DeliveryLayers      241 w  2,255px → the category pages
              TelemetryStrip      132 w  1,423px → /samples/gaming
              Evidence            152 w  1,484px → the category pages
              AccessPaths          85 w    957px   keep

            11,789px to 6,627px, 1,445 words to 843. Nothing is deleted: each
            moved section answers a question the reader has asked by the time
            they are one level down, and answered nothing on a page they had
            not chosen a category on yet. */}
        <HeroSamples />
        <CategoryChooser />
        {/* Both purchase routes, then what is actually in the catalogue. Order
            matters: a buyer here for bespoke collection had no reason to keep
            scrolling a page that only ever showed a shelf, and the trades in
            Coverage are the argument for the shelf. */}
        <TwoRoutes />
        <Coverage />
        <AccessPaths />
      </main>
      <Footer />
    </div>
  );
}
