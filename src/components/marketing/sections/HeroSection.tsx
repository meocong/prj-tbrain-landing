"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { PlasmaBackground } from "@/components/marketing/fx/PlasmaBackground";
import { KineticHeadline, FadeIn } from "@/components/marketing/fx/KineticText";
import { MagneticButton } from "@/components/marketing/fx/MagneticButton";
import { LiveChips } from "@/components/marketing/fx/LiveChips";

export function HeroSection() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ background: "#020617", minHeight: "100vh", color: "white" }}
    >
      {/* Animated shader background */}
      <PlasmaBackground className="inset-0" />

      {/* Subtle grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      {/* Floating live-data chips */}
      <LiveChips />

      {/* Main hero content */}
      <div className="container mx-auto relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12">
        {/* Eyebrow badge */}
        <FadeIn delay={0}>
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
            animate={shouldReduce ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(10px)",
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: "#10B981", opacity: 0.6 }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
            </span>
            <span style={{ color: "#E2E8F0" }}>Trusted by frontier AI labs</span>
            <Sparkles className="h-3 w-3" style={{ color: "#A78BFA" }} />
          </motion.div>
        </FadeIn>

        {/* Kinetic headline */}
        <KineticHeadline
          className="text-center font-medium tracking-tight"
          words={[
            "The",
            "data",
            "factory",
            "for",
            { text: "robotics,", gradient: true, glow: true },
            { text: "agents", gradient: true, glow: true },
            "&",
            { text: "post-training.", gradient: true, glow: true },
          ]}
          delay={0.25}
        />

        {/* Subheading */}
        <FadeIn delay={1.1} className="mt-8">
          <p className="mx-auto max-w-2xl text-center text-lg md:text-xl leading-relaxed" style={{ color: "rgba(226,232,240,0.78)" }}>
            From ground-truth motion capture to multi-step agent benchmarks —
            <br className="hidden md:block" />
            purpose-built data for the models no one else can train.
          </p>
        </FadeIn>

        {/* Stats ribbon */}
        <FadeIn delay={1.3} className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm" style={{ color: "rgba(226,232,240,0.55)" }}>
            <StatPill value="48K+" label="expert annotators" />
            <Divider />
            <StatPill value="17+" label="countries" />
            <Divider />
            <StatPill value="0.98" label="QC confidence" />
            <Divider />
            <StatPill value="Lab-grade" label="precision" />
          </div>
        </FadeIn>

        {/* CTAs */}
        <FadeIn delay={1.5} className="mt-10">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton href="/contact" variant="primary">
              Talk to an expert <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="/data/physical-ai" variant="outline">
              Explore robotics data
            </MagneticButton>
          </div>
        </FadeIn>

        {/* Scroll indicator */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={shouldReduce ? {} : { opacity: [0, 1, 1, 0.4, 1] }}
          transition={{ delay: 2, duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ color: "rgba(226,232,240,0.4)" }}
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>
    </section>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "white" }}>
        {value}
      </span>
      <span className="opacity-70">{label}</span>
    </span>
  );
}

function Divider() {
  return <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />;
}
