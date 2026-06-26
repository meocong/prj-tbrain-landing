"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { FOUNDRY_HERO, COLLECTION_PACK } from "@/lib/landing/physical-ai";
import { FigLabel, IsoAxis, TitleBlock } from "@/components/marketing/blueprint/kit";
import { PackHeroArt } from "./PackExplodeScroll";

export function HeroFoundry() {
  const d = COLLECTION_PACK.drawing;
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ minHeight: "92vh", color: "var(--bp-ink)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 55% 45% at 78% 32%, color-mix(in srgb, var(--bp-cyan) 9%, transparent), transparent 60%)",
      }} />
      <div className="container relative z-10 mx-auto grid min-h-[92vh] items-center gap-12 px-5 pt-28 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div>
          <div className="hero-reveal hero-reveal-0"><FigLabel>{FOUNDRY_HERO.fig}</FigLabel></div>
          <div className="hero-reveal hero-reveal-1 bp-mono mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ fontSize: 11, color: "var(--bp-cyan)", border: "1px solid var(--bp-line)", background: "color-mix(in srgb, var(--bp-cyan) 7%, transparent)" }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--bp-cyan)" }} />
            {FOUNDRY_HERO.eyebrow}
          </div>
          <h1 className="hero-reveal hero-reveal-2 mt-6 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(38px, 6vw, 70px)", lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            The Robotics Data{" "}
            <span style={{ background: "var(--bp-forge)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Foundry</span>{" "}
            for Physical AI
          </h1>
          <p className="hero-reveal hero-reveal-3 mt-6 max-w-xl" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--bp-ink-dim)" }}>{FOUNDRY_HERO.sub}</p>
          <div className="hero-reveal hero-reveal-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={FOUNDRY_HERO.ctaPrimary.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03]"
              style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}>
              {FOUNDRY_HERO.ctaPrimary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={FOUNDRY_HERO.ctaSecondary.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>
              {FOUNDRY_HERO.ctaSecondary.label}
            </Link>
          </div>
          <div className="hero-reveal hero-reveal-5 bp-mono mt-8" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.12em" }}>{FOUNDRY_HERO.trust}</div>
        </div>

        {/* Kit illustration */}
        <div className="hero-reveal hero-reveal-3 relative">
          <div className="mb-3 flex items-center justify-between">
            <FigLabel>TBRAIN · MK-001</FigLabel>
            <IsoAxis />
          </div>
          <PackHeroArt />
          <TitleBlock unit={d.unit} title={d.title} dwg={d.dwg} scale={d.scale} sheet={d.sheet} className="mt-3 hidden md:block" />
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1" style={{ color: "var(--bp-ink-faint)" }}>
        <span className="bp-mono" style={{ fontSize: 9 }}>Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}
