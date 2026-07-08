"use client";

/**
 * CinemaHero — premium video-first opening for the Tbrain robotics-data foundry.
 *
 *   HERO  — full-screen looping video of an operator wearing the capture rig.
 *           ALWAYS dark-styled (it's a dark video; white text). Theme-independent.
 *   PROBLEM → CONCEPT → DECOMPOSE — theme-aware (var(--bp-*)): light "engineering
 *           paper" in light mode, full cinematic dark in dark mode.
 *
 * Story: hero → "Physical AI is blocked by real-world data" (verified evidence)
 *        → "So we built a foundry" (pipeline) → "Every part is a data stream"
 *        (the rig, decomposed).
 *
 * Swap HERO_VIDEO for a custom Higgsfield render (operator in the rig, slow 360°
 * turntable) at /public/videos/worker-hero.mp4 — 1-line swap.
 */
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, RotateCw, Video, Clock, ShieldCheck, PackageCheck, Scan } from "lucide-react";
import { FOUNDRY_HERO, PROBLEM, PROOF_POINTS, HERO_MIX } from "@/lib/landing/physical-ai";
import { Defs } from "./PackExplodeScroll";
import { HeroMobileRail } from "./HeroMobileRail";

/* Hero media — cross-fades 3 ops-provided clips. Falls back to worker-hero
   when hero-mix videos aren't yet on disk (rclone pull pending). */
const HERO_POSTER = HERO_MIX.fallback.poster;
const HERO_FIT = "absolute inset-0 h-full w-full object-cover [object-position:58%_26%] md:[object-position:58%_30%] lg:[object-position:57%_32%]";

/* HeroMix — cycles HERO_MIX.clips at HERO_MIX.clipDurationSec; on error → fallback. */
function HeroMix({ reduce }: { reduce: boolean }) {
  const [idx, setIdx] = useState(0);
  const [errored, setErrored] = useState<boolean[]>(() => HERO_MIX.clips.map(() => false));
  const activeErrored = errored[idx];
  const allErrored = errored.every(Boolean);

  useEffect(() => {
    if (reduce || allErrored) return;
    const t = setTimeout(() => setIdx((i) => (i + 1) % HERO_MIX.clips.length), HERO_MIX.clipDurationSec * 1000);
    return () => clearTimeout(t);
  }, [idx, reduce, allErrored]);

  if (reduce || allErrored) {
    // Reduced-motion or all clips failed → static fallback video (worker-hero) or poster.
    if (reduce) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={HERO_POSTER} alt="" aria-hidden className={HERO_FIT}  loading="lazy" />;
    }
    return (
      // eslint-disable-next-line jsx-a11y/media-has-caption
      <video autoPlay loop muted playsInline preload="metadata" poster={HERO_POSTER} className={HERO_FIT}>
        <source src={HERO_MIX.fallback.src} type="video/webm" />
        <source src={HERO_MIX.fallback.mp4} type="video/mp4" />
      </video>
    );
  }

  // Only mount active + next clip <video>. Others render nothing so browser
  // never opens 6 decoders / fetches 6 sources on hero mount (~-25MB, mobile
  // decoder budget preserved). All other clips remain in the cycle via idx.
  const nextIdx = (idx + 1) % HERO_MIX.clips.length;
  return (
    <div className="absolute inset-0">
      {HERO_MIX.clips.map((clip, i) => {
        const active = i === idx;
        const mounted = i === idx || i === nextIdx;
        if (!mounted) return null;
        return (
          <motion.video
            key={clip.src}
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={clip.poster}
            className={HERO_FIT}
            style={{ pointerEvents: "none" }}
            onError={() => setErrored((prev) => prev.map((e, k) => (k === i ? true : e)))}
          >
            <source src={clip.src} type="video/webm" />
            <source src={clip.mp4} type="video/mp4" />
          </motion.video>
        );
      })}
      {activeErrored && (
        // eslint-disable-next-line @next/next/no-img-element
        <img key="fallback-poster" src={HERO_POSTER} alt="" aria-hidden className={HERO_FIT}  loading="lazy" />
      )}
    </div>
  );
}

const PILLS = ["Egocentric capture", "AI-native QC", "RLDS-ready"];

const EGO = [
  { k: "Egocentric POV", v: "First-person — the exact view a robot acts from." },
  { k: "Action-paired", v: "Every frame aligned to the action / teleop signal." },
  { k: "Hardware-clock sync", v: "Sub-frame alignment across all sensors." },
  { k: "Multi-modal", v: "RGB · Depth · IMU · Audio in one record." },
  { k: "RLDS / LeRobot-ready", v: "Drops straight into your training stack." },
  { k: "QC'd · ≤48h", v: "AI-native quality control, fast turnaround." },
];

/* Proof-point stats now use solid --bp-cyan; the cyan→purple gradient is
   reserved for a single hero moment ("Foundry") to avoid repeat-gradient slop. */

/* ── Live-capture HUD — REC + streams + input→robot (the "it's a working rig" cue) */
function CaptureHUD({ reduce }: { reduce: boolean }) {
  const [t, setT] = useState(5565); // 01:32:45
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setT((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, [reduce]);
  const pad = (n: number) => String(n).padStart(2, "0");
  const time = `${pad(Math.floor(t / 3600))}:${pad(Math.floor((t % 3600) / 60))}:${pad(t % 60)}`;
  const STREAMS = ["RGB", "Depth", "IMU", "Audio", "Pose", "Lang"];
  return (
    <div className="pointer-events-none absolute right-6 top-24 z-20 hidden w-[214px] flex-col gap-2.5 lg:flex">
      <div className="flex items-center justify-between rounded-xl border border-white/15 px-3.5 py-2.5" style={{ background: "rgba(6,6,14,0.72)" }}>
        <span className="inline-flex items-center gap-2">
          <motion.span style={{ width: 8, height: 8, borderRadius: 99, background: "#ff4d5e" }}
            animate={reduce ? {} : { opacity: [1, 0.25, 1] }} transition={{ duration: 1.1, repeat: Infinity }} />
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, letterSpacing: "0.14em", color: "#fff" }}>REC</span>
        </span>
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "#fff", fontVariantNumeric: "tabular-nums" }}>{time}</span>
      </div>
      <div className="rounded-xl border border-white/15 px-3.5 py-3" style={{ background: "rgba(6,6,14,0.72)" }}>
        <div style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>CAPTURING · 8 STREAMS</div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {STREAMS.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, color: "rgba(255,255,255,0.85)" }}>
              <motion.span style={{ width: 6, height: 6, borderRadius: 99, background: "#22e3c8" }}
                animate={reduce ? {} : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }} />
              {s}
            </span>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, color: "rgba(127,243,228,0.9)" }}>
          <motion.span animate={reduce ? {} : { rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} style={{ display: "inline-flex" }} aria-hidden>
            <RotateCw className="h-3 w-3" />
          </motion.span>
          hardware-clock synced
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5" style={{ borderColor: "color-mix(in srgb, #22e3c8 35%, transparent)", background: "color-mix(in srgb, #22e3c8 12%, rgba(6,6,14,0.72))" }}>
        <ArrowRight className="h-3.5 w-3.5" style={{ color: "#22e3c8" }} />
        <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, color: "#bff6ee" }}>trains VLA · robot policy</span>
      </div>
    </div>
  );
}

/* ── Hero (always dark — it's a dark video) ───────────────────────── */
function HeroVideo() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const reduce = useReducedMotion() ?? false;

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden" style={{ background: "#06060E" }}>
      <HeroMix reduce={reduce} />
      {/* legibility: solid dark left for white text; bottom blends into the next (themed) section */}
      <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(5,5,12,0.86) 0%, rgba(5,5,12,0.4) 42%, transparent 70%)" }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0" style={{ height: "34%", background: "linear-gradient(to top, var(--bp-bg), transparent)" }} />

      <CaptureHUD reduce={reduce} />
      <HeroMobileRail />

      <div className="absolute inset-0 z-10 flex flex-col px-5 sm:px-10 lg:px-14 pb-6 sm:pb-12 lg:pb-16">
        <div className="flex-1" />
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[720px]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.05 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5"
              style={{ background: "rgba(6,6,14,0.6)", fontFamily: "var(--font-mono, monospace)", fontSize: 11, letterSpacing: "0.06em", color: "#7ff3e4" }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: "#22e3c8" }} />
              {FOUNDRY_HERO.eyebrow}
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.12 }}
              className="mt-5 font-semibold text-white"
              style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.2rem, 6.2vw, 5.2rem)", lineHeight: 1.04, letterSpacing: "-0.025em" }}>
              The Robotics Data{" "}
              <span style={{ fontWeight: 700, background: "linear-gradient(100deg,#22e3c8,#8b6cf6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Foundry</span>{" "}
              for Physical AI
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-5 max-w-[540px] text-white/70" style={{ fontSize: "clamp(13px,1.4vw,18px)", lineHeight: 1.6 }}>
              {FOUNDRY_HERO.sub}
            </motion.p>

            <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.28 }}
              onSubmit={(e) => { e.preventDefault(); if (email.trim()) setSent(true); }}
              className="relative mt-7 max-w-[440px]">
              <div className="relative flex items-center rounded-full transition-colors focus-within:ring-2 focus-within:ring-[color:var(--bp-focus-ring)] focus-within:ring-offset-2 focus-within:ring-offset-[#06060E]" style={{ background: "rgba(6,6,14,0.72)", border: "1px solid rgba(255,255,255,0.14)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                {sent ? (
                  <span className="flex items-center gap-2 px-5 py-3.5 text-sm sm:py-4" style={{ color: "#fff" }}>
                    <Check className="h-4 w-4" style={{ color: "#22e3c8" }} /> Thanks — we&apos;ll reach out about a sample batch.
                  </span>
                ) : (
                  <>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your work email"
                      aria-label="Work email"
                      className="w-full bg-transparent px-5 py-3.5 text-sm outline-none sm:py-4 sm:px-6"
                      style={{ color: "#fff" }} />
                    <button type="submit" className="absolute right-1.5 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold sm:px-5 sm:py-2.5 sm:text-sm cursor-pointer"
                      style={{ background: "linear-gradient(100deg, #22e3c8 0%, #4cb5ff 100%)", color: "#0b0b14", boxShadow: "0 6px 18px -8px rgba(34,227,200,0.55)" }}>
                      Request a sample <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>
            </motion.form>

            <div className="mt-5 flex flex-wrap gap-2 sm:hidden">
              {PILLS.map((p) => (
                <span key={p} className="rounded-full border border-white/15 px-3 py-2 text-xs text-white/85" style={{ background: "rgba(6,6,14,0.55)" }}>{p}</span>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.36 }}
            className="hidden flex-col items-end gap-2.5 sm:flex">
            {PILLS.map((p) => (
              <span key={p} className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-white/85" style={{ background: "rgba(6,6,14,0.55)" }}>{p}</span>
            ))}
            <span className="mt-1 text-[11px] tracking-wide text-white/40" style={{ fontFamily: "var(--font-mono, monospace)" }}>{FOUNDRY_HERO.trust}</span>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-white/55 md:flex" aria-hidden>
        <span className="text-[10px] tracking-[0.2em]" style={{ fontFamily: "var(--font-mono, monospace)" }}>SCROLL — SEE THE FOUNDRY</span>
        <motion.span animate={reduce ? {} : { y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity }} style={{ display: "inline-flex" }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </div>
    </section>
  );
}

/* ── Data-gap diagram — model scale races ahead, real-world data lags ── */
function DataGapDiagram() {
  return (
    <div className="bp-card mt-10 p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="bp-mono" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--bp-ink-faint)" }}>FIG.00 — THE DATA GAP</div>
        <div className="flex gap-4 bp-mono" style={{ fontSize: 10 }}>
          <span style={{ color: "var(--bp-cyan)" }}>● Model &amp; compute scale</span>
          <span style={{ color: "var(--bp-amber)" }}>● Real-world data</span>
        </div>
      </div>
      <svg viewBox="0 0 600 240" className="w-full" preserveAspectRatio="xMidYMid meet" aria-label="Models scale faster than real-world data">
        <line x1="40" y1="208" x2="572" y2="208" stroke="var(--bp-line)" strokeWidth="1" />
        <motion.path d="M40 200 C 240 188, 380 120, 564 36 L 564 178 C 380 182, 240 192, 40 200 Z" fill="color-mix(in srgb, var(--bp-cyan) 9%, transparent)"
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.8, delay: 0.7 }} />
        {/* Safari fix: pathLength={1} + strokeDasharray + strokeDashoffset ensures the
            stroke-dashoffset animation renders on iOS Safari 15+ hydration */}
        <motion.path d="M40 200 C 240 188, 380 120, 564 36" fill="none" stroke="var(--bp-cyan)" strokeWidth="3" strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1"
          initial={{ strokeDashoffset: 1 }} whileInView={{ strokeDashoffset: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
        {/* Amber: dashed appearance via opacity fade (Safari-safe) instead of stroke-dashoffset,
            because dashed-pattern draw animations render inconsistently on iOS Safari */}
        <motion.path d="M40 200 C 240 190, 380 182, 564 174" fill="none" stroke="var(--bp-amber)" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round"
          initial={{ opacity: 0, pathLength: 0 }} whileInView={{ opacity: 1, pathLength: 1 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }} />
        <motion.g initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.1, duration: 0.5 }}>
          <line x1="516" y1="56" x2="516" y2="174" stroke="var(--bp-ink-faint)" strokeWidth="1" strokeDasharray="3 4" />
          <text x="504" y="109" textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--bp-ink-dim)">the gap</text>
          <text x="504" y="125" textAnchor="end" fontSize="12" fontFamily="var(--font-mono)" fontWeight="700" fill="var(--bp-cyan)">Tbrain fills</text>
        </motion.g>
      </svg>
      <p className="bp-mono mt-2" style={{ fontSize: 10.5, lineHeight: 1.5, color: "var(--bp-ink-dim)" }}>Compute &amp; model scale race ahead; real-world, action-paired data lags. That gap — not compute — is the bottleneck.</p>
    </div>
  );
}

/* ── Problem band (theme-aware) ───────────────────────────────────── */
function ProblemBand() {
  return (
    <section className="bp-grid relative overflow-hidden" style={{ background: "var(--bp-bg)", color: "var(--bp-ink)" }}>
      <div className="container relative z-10 mx-auto max-w-6xl px-5 pt-20 pb-16 sm:pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bp-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--bp-purple)" }}>
            <span style={{ width: 18, height: 1, background: "var(--bp-purple)" }} /> THE PROBLEM
          </div>
          {/* Section H2 sits heavier than hero H1 (weight-inversion). */}
          <h2 className="mt-4 max-w-3xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(28px,4.6vw,54px)", lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            Physical AI is blocked by real-world data — <span style={{ color: "var(--bp-ink-faint)", fontWeight: 500 }}>not compute.</span>
          </h2>
          <p className="mt-5 max-w-2xl" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{PROBLEM.lead}</p>
        </motion.div>

        <DataGapDiagram />

        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PROOF_POINTS.map((p, i) => (
            <motion.a key={p.src} href={p.href} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bp-card bp-card-hover group p-5">
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(24px,3vw,36px)", lineHeight: 1, color: "var(--bp-cyan)", letterSpacing: "-0.02em" }}>{p.stat}</div>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--bp-ink-dim)" }}>{p.claim}</p>
              <div className="bp-mono mt-3 inline-flex items-center gap-1" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>{p.src} <ArrowUpRight className="h-3 w-3" aria-hidden /></div>
            </motion.a>
          ))}
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-8 max-w-3xl" style={{ fontSize: 18, lineHeight: 1.6, color: "var(--bp-ink)" }}>
          <span style={{ color: "var(--bp-cyan)", fontWeight: 600 }}>The scarce resource</span>{" "}is real, diverse, action-paired demonstrations — QC&apos;d to lab standard.
        </motion.p>
      </div>
    </section>
  );
}

/* ── Concept band (theme-aware) ───────────────────────────────────── */
const FOUNDRY_STEPS = [
  { icon: Video, k: "Collect", v: "50–500 capture packs in the real world" },
  { icon: Clock, k: "Sync", v: "Hardware-clock aligned, offline-first" },
  { icon: Scan, k: "Annotate", v: "MANO hand + object masks + verb-noun" },
  { icon: ShieldCheck, k: "QC", v: "AI filter + 3-layer human review" },
  { icon: PackageCheck, k: "Deliver", v: "RLDS / LeRobot · ≤48h · zero-trust" },
];

/* Ecosystem / integrator diagram — Vietnam partner network → Tbrain foundry → robot models */
function EcosystemDiagram() {
  const INPUTS = [
    "Garment factories · 1,000+ operators",
    "Auto garages & repair workshops",
    "Electronics assembly lines",
    "Commercial kitchens & food service",
    "Warehouses · markets · retail",
  ];
  const OUTPUTS = [
    "VLA / foundation models",
    "World models & neural sim",
    "Humanoid robots",
    "Manipulation & RL policies",
  ];
  const Arrow = () => <ArrowRight className="mx-auto hidden h-6 w-6 shrink-0 lg:block" style={{ color: "var(--bp-cyan)" }} />;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
      className="mt-12 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1.05fr_auto_1fr] lg:items-center lg:gap-2.5">
      <div className="bp-card bp-card-hover p-5">
        <div className="bp-mono mb-3" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--bp-ink-faint)" }}>SOURCE · VIETNAM PARTNER NETWORK</div>
        <div className="grid gap-2">
          {INPUTS.map((s) => (
            <div key={s} className="bp-row rounded-lg px-3 py-2" style={{ background: "var(--bp-surface-2)", fontSize: 12.5, color: "var(--bp-ink-dim)" }}>{s}</div>
          ))}
        </div>
      </div>
      <Arrow />
      <div className="bp-card bp-card-hover p-5" style={{ borderColor: "var(--bp-cyan)", boxShadow: "0 0 0 1px var(--bp-cyan), 0 18px 40px -22px color-mix(in srgb, var(--bp-cyan) 50%, transparent)" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 20, color: "var(--bp-ink)", letterSpacing: "-0.01em" }}>Tbrain · the data foundry</div>
        <div className="bp-mono mb-3 mt-0.5" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>CAPTURE · SYNC · QC · ANNOTATE → RLDS</div>
        <div className="grid gap-2">
          {FOUNDRY_STEPS.map((s, i) => (
            <div key={s.k} className="bp-row flex items-center gap-2.5 rounded-lg px-3 py-2" style={{ background: "color-mix(in srgb, var(--bp-cyan) 7%, transparent)" }}>
              <s.icon className="h-4 w-4 shrink-0" style={{ color: "var(--bp-cyan)" }} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--bp-ink)" }}>{s.k}</span>
              <span className="bp-mono ml-auto" style={{ fontSize: 9, color: "var(--bp-ink-faint)" }}>0{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      <Arrow />
      <div className="bp-card bp-card-hover p-5">
        <div className="bp-mono mb-3" style={{ fontSize: 10, letterSpacing: "0.1em", color: "var(--bp-ink-faint)" }}>POWERS · ROBOT FOUNDATION MODELS</div>
        <div className="grid gap-2">
          {OUTPUTS.map((s) => (
            <div key={s} className="bp-row flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "var(--bp-surface-2)", fontSize: 12.5, color: "var(--bp-ink-dim)" }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--bp-purple)", flexShrink: 0 }} />{s}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ConceptBand() {
  return (
    <section className="bp-grid relative overflow-hidden" style={{ background: "var(--bp-bg)", color: "var(--bp-ink)" }}>
      <div className="container relative z-10 mx-auto max-w-6xl px-5 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bp-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--bp-cyan)" }}>
            <span style={{ width: 18, height: 1, background: "var(--bp-cyan)" }} /> THE FOUNDRY
          </div>
          <h2 className="mt-4 max-w-3xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(26px,4.2vw,48px)", lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            So we built a foundry for it
          </h2>
          <p className="mt-5 max-w-2xl" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>
            Tbrain is a robotics-data foundry: we capture real, action-paired demonstrations on our own hardware and forge them into lab-grade, training-ready datasets.
          </p>
        </motion.div>

        <EcosystemDiagram />
      </div>
    </section>
  );
}

/* ── Decompose grid (theme-aware) ─────────────────────────────────── */
function DecomposeGrid() {
  return (
    <section className="bp-grid bp-frame relative overflow-hidden" style={{ background: "var(--bp-bg)", color: "var(--bp-ink)" }}>
      <div className="container relative z-10 mx-auto max-w-6xl px-5 pt-20 pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 bp-mono" style={{ fontSize: 11, letterSpacing: "0.14em", color: "var(--bp-cyan)" }}>
            <span style={{ width: 18, height: 1, background: "var(--bp-cyan)" }} /> FIG.01 — THE DELIVERY SPEC
          </div>
          <h2 className="mt-4 max-w-2xl" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(28px,4.4vw,52px)", lineHeight: 1.04, letterSpacing: "-0.02em" }}>
            Built to the spec world-model teams ask for
          </h2>
          <p className="mt-4 max-w-xl" style={{ fontSize: 16, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>
            Every episode ships to one spec — the exact signals world-model teams request, hardware-clock synced, QC&apos;d, and delivered RLDS / LeRobot-ready.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
          className="bp-card mt-10 p-6 sm:p-9">
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {EGO.map((e) => (
              <div key={e.k} className="pt-4" style={{ borderTop: "1px solid var(--bp-line)" }}>
                <div style={{ fontFamily: "var(--font-body, var(--font-sans, system-ui))", fontSize: 14, fontWeight: 700, letterSpacing: "-0.005em", color: "var(--bp-ink)" }}>{e.k}</div>
                <div style={{ fontFamily: "var(--font-body, var(--font-sans, system-ui))", fontSize: 13, fontWeight: 400, lineHeight: 1.55, marginTop: 4, color: "var(--bp-ink-dim)" }}>{e.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={FOUNDRY_HERO.ctaPrimary.href} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", background: "var(--bp-cyan)", color: "var(--bp-on-cyan)" }}>
              {FOUNDRY_HERO.ctaPrimary.label} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={FOUNDRY_HERO.ctaSecondary.href} className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--bp-ink)", border: "1px solid var(--bp-line-strong)" }}>
              {FOUNDRY_HERO.ctaSecondary.label}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function CinemaHero() {
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden><Defs /></svg>
      <HeroVideo />
      <ProblemBand />
      <ConceptBand />
      <DecomposeGrid />
    </>
  );
}
