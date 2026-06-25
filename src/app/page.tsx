import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { HeroFoundry } from "@/components/marketing/sections/foundry/HeroFoundry";
import {
  ProblemSheet,
  CollectionPackSheet,
  FoundryLineSheet,
  QCSheet,
  LadderSheet,
  EnvironmentsSheet,
  DirectionsTeaser,
  StandardsStrip,
  UseCasesTeaser,
  BeyondRobotics,
} from "@/components/marketing/sections/foundry/Sheets";
import { ANCHOR_TRUST } from "@/lib/landing/physical-ai";

export const metadata: Metadata = {
  title: "Tbrain | The Robotics Data Foundry for Physical AI",
  description:
    "Lab-grade, action-paired robot training data — egocentric, UMI, teleoperation — captured by our own factory packs, QC'd by an AI-native pipeline, delivered RLDS-ready for Physical AI.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tbrain | The Robotics Data Foundry for Physical AI",
    description:
      "We forge lab-grade, action-paired datasets for robot foundation models — captured, synchronized, and QC'd at factory scale.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tbrain | The Robotics Data Foundry for Physical AI",
    description:
      "We forge lab-grade, action-paired datasets for robot foundation models — captured, synchronized, and QC'd at factory scale.",
  },
};

export const revalidate = 86400;

/* Anonymized anchor-trust strip (no named labs — NDA). */
function AnchorStrip() {
  return (
    <section className="bp-grid" style={{ borderTop: "1px solid var(--bp-line)", borderBottom: "1px solid var(--bp-line)", paddingTop: 28, paddingBottom: 28 }}>
      <div className="container mx-auto flex flex-col items-center gap-5 px-5 text-center lg:flex-row lg:justify-between lg:text-left">
        <div className="bp-mono" style={{ fontSize: 12, letterSpacing: "0.14em", color: "var(--bp-ink)" }}>
          {ANCHOR_TRUST.labs}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          {ANCHOR_TRUST.standards.map((s) => (
            <div key={s.name} className="text-center">
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--bp-cyan)" }}>{s.name}</div>
              <div className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Blueprint-themed closing CTA (keeps the dark sheet aesthetic). */
function FoundryCTA() {
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ paddingTop: 96, paddingBottom: 104 }}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,229,199,0.12), transparent 60%)" }} />
      <div className="container relative z-10 mx-auto max-w-3xl px-5 text-center">
        <h2 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(30px,5vw,52px)", lineHeight: 1.06, color: "var(--bp-ink)" }}>
          Forge your next dataset with us
        </h2>
        <p className="mx-auto mt-5 max-w-xl" style={{ fontSize: 17, color: "var(--bp-ink-dim)" }}>
          Tell us the task, the embodiment, and the format. We&apos;ll scope a sample batch — captured, QC&apos;d, and delivered RLDS-ready.
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/contact" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "#06231F", boxShadow: "0 10px 30px -10px rgba(0,229,199,0.6)" }}>
            See a sample dataset <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/data/physical-ai" className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>
            How the foundry works
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div style={{ background: "var(--bp-bg)" }}>
      <Header />
      <main>
        <HeroFoundry />
        <AnchorStrip />
        <ProblemSheet />
        <CollectionPackSheet />
        <FoundryLineSheet />
        <QCSheet />
        <LadderSheet />
        <EnvironmentsSheet />
        <DirectionsTeaser />
        <StandardsStrip />
        <UseCasesTeaser />
        <BeyondRobotics />
        <FoundryCTA />
      </main>
      <Footer />
    </div>
  );
}
