"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { FOUNDRY_HERO, COLLECTION_PACK } from "@/lib/landing/physical-ai";
import { FigLabel, IsoAxis, TitleBlock, BillOfMaterials, type BomRow } from "@/components/marketing/blueprint/kit";
import { EgoKitPack3DLazy } from "@/components/marketing/three/Lazy3D";

const BOM_ROWS: BomRow[] = COLLECTION_PACK.bom.map((b, i) => ({
  num: b.num, part: b.part, status: i < 2 ? "MOV" : i === COLLECTION_PACK.bom.length - 1 ? "SEP" : "STBY",
}));

/** Static blueprint poster shown on mobile / reduced-motion / no-WebGL. */
function PackPoster() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bp-anim-float">
      <svg viewBox="0 0 240 200" className="w-[78%]" aria-hidden>
        <g fill="none" stroke="#00E5C7" strokeWidth="1.2" opacity="0.9">
          <rect x="70" y="90" width="100" height="60" rx="6" />
          <path d="M70 90 l18 -16 h100 l-18 16 M170 90 l18 -16 v60 l-18 16" opacity="0.5" />
          <rect x="92" y="34" width="56" height="22" rx="4" />
          <circle cx="106" cy="45" r="6" stroke="#5EEAD4" />
          <circle cx="134" cy="45" r="6" stroke="#5EEAD4" />
          <path d="M70 120 q-40 -10 -40 -54" stroke="#6C3CF4" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

export function HeroFoundry() {
  return (
    <section
      className="bp-grid bp-grid-fade bp-frame relative overflow-hidden"
      style={{ minHeight: "100vh", color: "var(--bp-ink)" }}
    >
      {/* forge glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{
        background:
          "radial-gradient(ellipse 60% 50% at 75% 30%, rgba(0,229,199,0.12), transparent 60%)," +
          "radial-gradient(ellipse 70% 60% at 20% 70%, rgba(108,60,244,0.14), transparent 60%)",
      }} />

      <div className="container relative z-10 mx-auto grid min-h-screen items-center gap-10 px-5 pt-28 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ── Copy ── */}
        <div>
          <div className="hero-reveal hero-reveal-0">
            <FigLabel>{FOUNDRY_HERO.fig}</FigLabel>
          </div>
          <div
            className="hero-reveal hero-reveal-1 bp-mono mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{ fontSize: 11, color: "var(--bp-cyan-soft)", border: "1px solid var(--bp-line-strong)", background: "rgba(0,229,199,0.06)" }}
          >
            <span className="bp-anim-blink" style={{ width: 7, height: 7, borderRadius: 99, background: "var(--bp-cyan)" }} />
            {FOUNDRY_HERO.eyebrow}
          </div>

          <h1
            className="hero-reveal hero-reveal-2 mt-6 font-semibold"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(38px, 6vw, 72px)", lineHeight: 1.04, letterSpacing: "-0.02em" }}
          >
            The Robotics Data{" "}
            <span style={{
              background: "var(--bp-forge)", WebkitBackgroundClip: "text", backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Foundry</span>{" "}
            for Physical AI
          </h1>

          <p className="hero-reveal hero-reveal-3 mt-6 max-w-xl" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--bp-ink-dim)" }}>
            {FOUNDRY_HERO.sub}
          </p>

          <div className="hero-reveal hero-reveal-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href={FOUNDRY_HERO.ctaPrimary.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.03]"
              style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "#06231F", boxShadow: "0 10px 30px -10px rgba(0,229,199,0.6)" }}
            >
              {FOUNDRY_HERO.ctaPrimary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={FOUNDRY_HERO.ctaSecondary.href}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold"
              style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)", background: "rgba(232,240,255,0.04)" }}
            >
              {FOUNDRY_HERO.ctaSecondary.label}
            </Link>
          </div>

          <div className="hero-reveal hero-reveal-5 bp-mono mt-8" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.14em" }}>
            {FOUNDRY_HERO.trust}
          </div>
        </div>

        {/* ── 3D pack ── */}
        <div className="hero-reveal hero-reveal-3 relative h-[380px] sm:h-[480px] lg:h-[560px]">
          <div className="absolute left-0 top-0 z-20"><FigLabel>TBRAIN · MK-001</FigLabel></div>
          <IsoAxis className="absolute right-0 top-0 z-20" />
          <EgoKitPack3DLazy interactive className="absolute inset-0" fallback={<PackPoster />} />
          <div className="bp-scan" style={{ zIndex: 15 }} />
          <BillOfMaterials rows={BOM_ROWS} count={`${BOM_ROWS.filter(r => r.status !== "STBY").length} / ${BOM_ROWS.length}`} className="absolute bottom-0 left-0 z-20 hidden sm:block" />
          <TitleBlock {...{ unit: COLLECTION_PACK.drawing.unit, title: COLLECTION_PACK.drawing.title, dwg: COLLECTION_PACK.drawing.dwg, scale: COLLECTION_PACK.drawing.scale, sheet: COLLECTION_PACK.drawing.sheet }} className="absolute bottom-0 right-0 z-20 hidden md:block" />
        </div>
      </div>

      <div className="bp-anim-float absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1" style={{ color: "var(--bp-ink-faint)" }}>
        <span className="bp-mono" style={{ fontSize: 9 }}>Scroll</span>
        <ChevronDown className="h-4 w-4" />
      </div>
    </section>
  );
}
