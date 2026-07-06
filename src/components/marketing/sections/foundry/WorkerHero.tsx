"use client";

/**
 * WorkerHero — ONE connected, pinned cinematic scene (no separate hero + a
 * different section below). As you scroll the pinned stage:
 *   phase 1: cinematic mouse-scrubbed video + big headline
 *   phase 2: the video fades and, IN THE SAME SPOT, its components peel apart
 *            into a labeled exploded view while the Bill of Materials fills
 *   phase 3: the scene cross-fades out and hands off to the next section
 *
 * The kit is shown exactly once — it emerges from the hero, so the two scenes
 * are one continuous element. Pinning works via overflow-x:clip on html/body.
 * Swap HERO_VIDEO for a custom Higgsfield clip (drop files in /public/videos).
 */
import { useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { FOUNDRY_HERO } from "@/lib/landing/physical-ai";
import { FigLabel, IsoAxis, TitleBlock } from "@/components/marketing/blueprint/kit";
import { Defs, CX, PARTS, PartG, Bom } from "./PackExplodeScroll";
import { ScrubVideo } from "./ScrubVideo";

const HERO_VIDEO = {
  webm: "/videos/robotics-cinema.webm",
  mp4: "/videos/robotics-cinema.mp4",
  poster: "/images/robotics-cinema-poster.jpg",
};

function Stage({ reduce }: { reduce: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // rect-based section progress (robust; framer useScroll target was binding to the document here)
  const scrollYProgress = useMotionValue(0);
  useEffect(() => {
    const onScroll = () => {
      const el = wrap.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const total = Math.max(1, r.height - window.innerHeight);
      scrollYProgress.set(Math.min(1, Math.max(0, -r.top / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, [scrollYProgress]);

  const heroOpacity = useTransform(scrollYProgress, [0.06, 0.22], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.22], [0, -36]);
  const videoOpacity = useTransform(scrollYProgress, [0, 0.14, 0.3], [1, 1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.06]);
  const kitOpacity = useTransform(scrollYProgress, [0.22, 0.34], [0, 1]);
  const explode = useTransform(scrollYProgress, [0.3, 0.74], [0, 1], { clamp: true });
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.92, 1], [1, 1, 0]);

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return; const el = stageRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    el.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  };

  const pinned = (
    <div ref={stageRef} onMouseMove={onMove} className="relative h-screen min-h-[640px] w-full overflow-hidden bp-grid">
      {/* visual stage: video that peels into the kit (same spot) */}
      <motion.div className="absolute inset-0 z-0" style={reduce ? { opacity: 0 } : { opacity: videoOpacity, scale: videoScale }}>
        <ScrubVideo {...HERO_VIDEO} className="h-full w-full" />
      </motion.div>
      <motion.div aria-hidden className="absolute inset-0 z-[1]" style={reduce ? { opacity: 0 } : { opacity: videoOpacity }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, var(--bp-bg) 0%, color-mix(in srgb, var(--bp-bg) 90%, transparent) 36%, color-mix(in srgb, var(--bp-bg) 32%, transparent) 64%, transparent 100%)" }} />
        <div className="absolute inset-x-0 bottom-0" style={{ height: "32%", background: "linear-gradient(to top, var(--bp-bg), transparent)" }} />
      </motion.div>

      {/* exploded kit — appears where the video was, then peels apart */}
      <motion.div className="absolute inset-0 z-[2] flex items-center justify-center" style={{ opacity: reduce ? 1 : kitOpacity }}>
        <div className="w-full max-w-[980px] px-5" style={{ transform: "translate(calc(var(--px,0)*-16px), calc(var(--py,0)*-10px))", transition: "transform .25s ease-out" }}>
          <svg viewBox="0 0 560 540" className="mx-auto h-[78vh] w-full" preserveAspectRatio="xMidYMid meet" aria-label="Capture pack exploded view">
            <Defs />
            <line x1={CX} y1="56" x2={CX} y2="510" stroke="var(--bp-line-strong)" strokeWidth="1" strokeDasharray="3 6" />
            {PARTS.map((p, i) => <PartG key={p.num} p={p} explode={explode} i={i} frozen={reduce} />)}
          </svg>
        </div>
      </motion.div>

      {/* phase 1 hero copy */}
      <div className="container relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-5">
        <motion.div className="max-w-2xl" style={reduce ? { display: "none" } : { opacity: heroOpacity, y: heroY }}>
          <FigLabel>{FOUNDRY_HERO.fig}</FigLabel>
          <div className="bp-mono mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ fontSize: 11, color: "var(--bp-cyan)", border: "1px solid var(--bp-line)", background: "color-mix(in srgb, var(--bp-cyan) 8%, transparent)", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)" }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--bp-cyan)" }} />{FOUNDRY_HERO.eyebrow}
          </div>
          <h1 className="mt-6 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(42px, 6.6vw, 82px)", lineHeight: 1.01, letterSpacing: "-0.025em" }}>
            The Robotics Data <span style={{ background: "var(--bp-forge)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Foundry</span> for Physical AI
          </h1>
          <p className="mt-6 max-w-xl" style={{ fontSize: 18, lineHeight: 1.65, color: "var(--bp-ink-dim)" }}>{FOUNDRY_HERO.sub}</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href={FOUNDRY_HERO.ctaPrimary.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.04]" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}>
              {FOUNDRY_HERO.ctaPrimary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={FOUNDRY_HERO.ctaSecondary.href} className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)", background: "color-mix(in srgb, var(--bp-bg) 55%, transparent)", WebkitBackdropFilter: "blur(6px)", backdropFilter: "blur(6px)" }}>{FOUNDRY_HERO.ctaSecondary.label}</Link>
          </div>
        </motion.div>
      </div>

      {/* phase 2 heading */}
      <motion.div className="absolute left-0 right-0 top-24 z-10" style={{ opacity: reduce ? 1 : kitOpacity }}>
        <div className="container mx-auto flex max-w-7xl items-start justify-between px-5">
          <div>
            <FigLabel>FIG.01 — TBRAIN CAPTURE PACK · EXPLODED</FigLabel>
            <h2 className="mt-3 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(22px,3vw,38px)", lineHeight: 1.08 }}>The same rig, peeled apart</h2>
          </div>
          <IsoAxis className="hidden lg:block" />
        </div>
      </motion.div>

      {/* phase 2 BOM + title block */}
      <motion.div className="absolute bottom-8 left-0 right-0 z-10" style={{ opacity: reduce ? 1 : kitOpacity }}>
        <div className="container mx-auto flex max-w-7xl items-end justify-between px-5">
          <Bom explode={explode} frozen={reduce} />
          <TitleBlock unit="TBRAIN" title="CAPTURE PACK" dwg="MK-001 · REV A" scale="1:2 · ISO 30°" sheet="1 OF 1" className="hidden lg:block" />
        </div>
      </motion.div>

      {!reduce && (
        <motion.div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1" style={{ color: "var(--bp-ink-faint)", opacity: heroOpacity }}>
          <span className="bp-mono" style={{ fontSize: 9 }}>Move cursor · scroll to peel apart</span><ChevronDown className="h-4 w-4 bp-anim-float" />
        </motion.div>
      )}
    </div>
  );

  if (reduce) return <section className="bp-frame relative" style={{ color: "var(--bp-ink)" }}>{pinned}</section>;

  return (
    <section ref={wrap} className="bp-frame relative" style={{ height: "320vh", color: "var(--bp-ink)" }}>
      <motion.div className="sticky top-0" style={{ opacity: sceneOpacity }}>{pinned}</motion.div>
    </section>
  );
}

export function WorkerHero() {
  const reduce = useReducedMotion() ?? false;
  return <Stage reduce={reduce} />;
}
