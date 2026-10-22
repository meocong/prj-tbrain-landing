import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ScrollProgress } from "@/components/marketing/fx/ScrollProgress";
import { RESEARCH_HERO, CONTACT, ABOUT } from "@/lib/landing/research";
import { ResearchHero } from "./_sections/ResearchHero";
import { SectionNav } from "./_sections/SectionNav";
import { Statement } from "./_sections/Statement";
import { WhyNow } from "./_sections/WhyNow";
import { Questions } from "./_sections/Questions";
import { Offer } from "./_sections/Offer";
import { Collaboration } from "./_sections/Collaboration";
import { Contact } from "./_sections/Contact";
import { RevealObserver, RS_JS_INIT } from "./_sections/motion";
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
  contactPoint: { "@type": "ContactPoint", name: CONTACT.person.name, email: CONTACT.person.email, contactType: RESEARCH_HERO.program },
};

const NAV = [
  { id: "why", label: "Why now" },
  { id: "questions", label: "Questions" },
  { id: "offer", label: "What we offer" },
  { id: "collaborate", label: "Collaboration" },
  { id: "contact", label: CONTACT.title },
];

export default function ResearchProgramPage() {
  return (
    <div className="bp-chrome" style={{ background: "var(--bp-bg)", color: "var(--bp-ink)" }}>
      {/* Before any section paints: lets the scroll reveals hide what is
          below the fold. Without it (no JS) everything is simply visible. */}
      <script dangerouslySetInnerHTML={{ __html: RS_JS_INIT }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      <RevealObserver />
      <TrackClicks />
      <ScrollProgress />
      <Header />
      <main id="main-content">
        <ResearchHero />
        <SectionNav items={NAV} />
        <Statement />
        <WhyNow />
        <Questions />
        <Offer />
        <Collaboration />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
