import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { RESEARCH_HERO, CONTACT, ABOUT } from "@/lib/landing/research";
import { PaperBody, PaperHero } from "./_sections/Paper";
import { TrackClicks } from "./_sections/TrackClicks";

const TITLE = `${RESEARCH_HERO.program} — ${RESEARCH_HERO.title}`;
const DESCRIPTION = `${RESEARCH_HERO.lead} ${RESEARCH_HERO.question} ${RESEARCH_HERO.weBring} ${RESEARCH_HERO.youBring}`;

export const metadata: Metadata = {
  title: { absolute: `${RESEARCH_HERO.program} | Tbrain` },
  description: DESCRIPTION,
  alternates: { canonical: "/researchprogram" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/researchprogram",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const revalidate = 86400;

const BASE_URL = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
const JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: RESEARCH_HERO.program,
  headline: RESEARCH_HERO.title,
  description: DESCRIPTION,
  url: `${BASE_URL}/researchprogram`,
  publisher: { "@type": "Organization", name: "Tbrain", url: BASE_URL, description: ABOUT.body },
  contactPoint: { "@type": "ContactPoint", email: CONTACT.email, contactType: RESEARCH_HERO.program },
};

export default function ResearchProgramPage() {
  return (
    <div className="rp">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <TrackClicks />
      <Header />
      <main id="main-content">
        <PaperHero />
        <PaperBody />
      </main>
      <Footer />
    </div>
  );
}
