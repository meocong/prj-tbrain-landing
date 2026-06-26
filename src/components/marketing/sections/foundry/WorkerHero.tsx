"use client";

/**
 * WorkerHero — motionsites-style cinematic opening.
 *  - HeroBlock: big typography + operator figure (floats + cursor parallax).
 *  - DisassembleBlock: a PINNED, scroll-scrubbed scene — the worker pins in
 *    view, fades out while the real components fly apart in place (labels +
 *    Bill of Materials fill), then the whole scene cross-fades out (scene
 *    transition). Cursor parallax adds interactivity.
 *
 * Pinning works now that html/body use overflow-x:clip (not hidden).
 * Falls back to /images/worker-hero.png when present; vector silhouette else.
 */
import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { FOUNDRY_HERO } from "@/lib/landing/physical-ai";
import { FigLabel, IsoAxis, TitleBlock } from "@/components/marketing/blueprint/kit";
import { Defs, CX, PARTS, PartG, Bom } from "./PackExplodeScroll";

/* ── Vector worker fallback ──────────────────────────────────────── */
function WorkerSilhouette({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 410" className={className} role="img" aria-label="Operator wearing the Tbrain Capture Pack" style={{ color: "var(--bp-ink-dim)" }}>
      <Defs />
      <path d="M34 410 q8 -126 116 -126 q108 0 116 126 z" fill="var(--bp-surface-2)" stroke="currentColor" strokeWidth="2" />
      <rect x="126" y="250" width="48" height="52" rx="16" fill="var(--bp-surface-2)" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="150" cy="186" rx="66" ry="76" fill="var(--bp-surface)" stroke="currentColor" strokeWidth="2" />
      <path d="M88 152 q62 -46 124 0" fill="none" stroke="var(--bp-purple)" strokeWidth="6" opacity="0.85" />
      <rect x="138" y="116" width="26" height="18" rx="3" fill="url(#pk-dark)" stroke="#1a1d24" strokeWidth="0.8" />
      <rect x="102" y="150" width="96" height="26" rx="6" fill="url(#pk-metal)" stroke="#3a3f4a" strokeWidth="1.4" />
      <circle cx="123" cy="163" r="7.5" fill="#0e1116" /><circle cx="123" cy="163" r="4" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
      <circle cx="177" cy="163" r="7.5" fill="#0e1116" /><circle cx="177" cy="163" r="4" fill="none" stroke="var(--bp-cyan)" strokeWidth="1.6" />
      <circle cx="150" cy="163" r="4" fill="#0e1116" />
      <path d="M196 172 q44 54 -16 150" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="2 5" opacity="0.7" />
      <rect x="150" y="322" width="74" height="38" rx="7" fill="url(#pk-metal)" stroke="#3a3f4a" strokeWidth="1.4" />
      <rect x="188" y="334" width="34" height="14" rx="2.5" fill="rgba(108,60,244,0.14)" stroke="var(--bp-purple)" strokeWidth="1" />
      <text x="205" y="344" textAnchor="middle" fontSize="8" fontFamily="var(--font-heading)" fontWeight="700" fill="var(--bp-purple)">Tbrain</text>
    </svg>
  );
}

function WorkerFigure() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative flex h-full items-center justify-center">
      <WorkerSilhouette className="h-full w-auto" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/worker-hero.png" alt="Operator wearing the Tbrain Capture Pack" onLoad={() => setLoaded(true)}
        className="absolute inset-0 m-auto h-full w-auto"
        style={{ opacity: loaded ? 1 : 0, transition: "opacity .5s ease", objectFit: "contain", filter: "drop-shadow(0 28px 56px rgba(10,20,40,0.22))" }} />
    </div>
  );
}

/* ── Hero block (float + cursor parallax) ────────────────────────── */
function HeroBlock() {
  const paraRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = paraRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };
  const reset = () => { const el = paraRef.current; if (el) { el.style.setProperty("--px", "0"); el.style.setProperty("--py", "0"); } };
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ minHeight: "92vh", color: "var(--bp-ink)" }} onMouseMove={onMove} onMouseLeave={reset}>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 55% 50% at 80% 36%, color-mix(in srgb, var(--bp-cyan) 10%, transparent), transparent 60%)" }} />
      <div className="container relative z-10 mx-auto grid min-h-[92vh] items-center gap-10 px-5 pt-28 pb-16 lg:grid-cols-[1.04fr_0.96fr]">
        <div>
          <div className="hero-reveal hero-reveal-0"><FigLabel>{FOUNDRY_HERO.fig}</FigLabel></div>
          <div className="hero-reveal hero-reveal-1 bp-mono mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ fontSize: 11, color: "var(--bp-cyan)", border: "1px solid var(--bp-line)", background: "color-mix(in srgb, var(--bp-cyan) 7%, transparent)" }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--bp-cyan)" }} />{FOUNDRY_HERO.eyebrow}
          </div>
          <h1 className="hero-reveal hero-reveal-2 mt-6 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(40px, 6.4vw, 76px)", lineHeight: 1.02, letterSpacing: "-0.02em" }}>
            The Robotics Data <span style={{ background: "var(--bp-forge)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Foundry</span> for Physical AI
          </h1>
          <p className="hero-reveal hero-reveal-3 mt-6 max-w-xl" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--bp-ink-dim)" }}>{FOUNDRY_HERO.sub}</p>
          <div className="hero-reveal hero-reveal-4 mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={FOUNDRY_HERO.ctaPrimary.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.04]" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}>
              {FOUNDRY_HERO.ctaPrimary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={FOUNDRY_HERO.ctaSecondary.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-colors hover:border-[var(--bp-cyan)]" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>{FOUNDRY_HERO.ctaSecondary.label}</Link>
          </div>
          <div className="hero-reveal hero-reveal-5 bp-mono mt-8" style={{ fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.12em" }}>{FOUNDRY_HERO.trust}</div>
        </div>

        <div className="hero-reveal hero-reveal-3 relative">
          <div className="mb-2 flex items-center justify-between"><FigLabel>OPERATOR · MK-001</FigLabel><IsoAxis /></div>
          <div ref={paraRef} className="bp-anim-float relative" style={{ height: "clamp(420px, 60vh, 600px)", transform: "translate(calc(var(--px,0)*22px), calc(var(--py,0)*16px))", transition: "transform .25s ease-out" }}>
            <WorkerFigure />
          </div>
        </div>
      </div>
      <div className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1" style={{ color: "var(--bp-ink-faint)" }}>
        <span className="bp-mono" style={{ fontSize: 9 }}>Scroll to disassemble</span><ChevronDown className="h-4 w-4 bp-anim-float" />
      </div>
    </section>
  );
}

/* ── Pinned, scrubbed disassemble scene ──────────────────────────── */
function DisassembleBlock() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  const explode = useTransform(scrollYProgress, [0.08, 0.62], [0, 1], { clamp: true });
  const workerOpacity = useTransform(explode, [0, 0.32], [reduce ? 0 : 1, 0], { clamp: true });
  const workerScale = useTransform(explode, [0, 0.42], [1, 1.08], { clamp: true });
  // scene transition: fade the pinned scene in at the start, out at the end
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.05, 0.9, 1], [0, 1, 1, 0]);

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return; const el = stage.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };

  const Stage = (
    <div className="container relative mx-auto flex w-full flex-col px-5" style={{ height: reduce ? "auto" : "100vh", paddingTop: 92, paddingBottom: 40 }}>
      <div className="flex items-start justify-between">
        <div>
          <FigLabel>FIG.01 — TBRAIN CAPTURE PACK · EXPLODED</FigLabel>
          <h2 className="mt-3 max-w-xl font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(24px,3.4vw,40px)", lineHeight: 1.08 }}>The same rig, taken apart</h2>
        </div>
        <IsoAxis className="hidden lg:block" />
      </div>
      <div ref={stage} onMouseMove={onMove} className="relative mx-auto mt-2 w-full flex-1" style={{ maxWidth: 980 }}>
        <motion.div className="pointer-events-none absolute inset-y-0 z-10" style={{ left: "3%", width: "44%", opacity: workerOpacity, scale: workerScale }}>
          <WorkerFigure />
        </motion.div>
        <div className="absolute inset-0" style={{ transform: "translate(calc(var(--px,0)*-18px), calc(var(--py,0)*-12px))", transition: "transform .25s ease-out" }}>
          <svg viewBox="0 0 560 540" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-label="Capture pack exploded view">
            <Defs />
            <line x1={CX} y1="56" x2={CX} y2="510" stroke="var(--bp-line-strong)" strokeWidth="1" strokeDasharray="3 6" />
            {PARTS.map((p, i) => <PartG key={p.num} p={p} explode={explode} i={i} frozen={reduce} />)}
          </svg>
        </div>
      </div>
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <Bom explode={explode} frozen={reduce} />
        <TitleBlock unit="TBRAIN" title="CAPTURE PACK" dwg="MK-001 · REV A" scale="1:2 · ISO 30°" sheet="1 OF 1" className="hidden lg:block" />
      </div>
    </div>
  );

  if (reduce) return <section className="bp-grid bp-frame relative overflow-hidden" style={{ color: "var(--bp-ink)" }}>{Stage}</section>;

  return (
    <section ref={wrap} className="bp-grid bp-frame relative" style={{ height: "240vh", color: "var(--bp-ink)" }}>
      <motion.div className="sticky top-0 flex h-screen min-h-[640px] items-stretch overflow-hidden" style={{ opacity: sceneOpacity }}>
        {Stage}
      </motion.div>
    </section>
  );
}

export function WorkerHero() {
  return (<><HeroBlock /><DisassembleBlock /></>);
}
