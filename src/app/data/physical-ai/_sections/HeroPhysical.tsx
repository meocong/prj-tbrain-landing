"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { PlasmaBackground } from "@/components/marketing/fx/PlasmaBackground";
import { KineticHeadline, FadeIn } from "@/components/marketing/fx/KineticText";
import { MagneticButton } from "@/components/marketing/fx/MagneticButton";

export function HeroPhysical() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#020617", minHeight: "100vh", color: "white" }}
    >
      <PlasmaBackground className="inset-0" tint="green" />

      {/* Grid overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="container mx-auto relative z-10 min-h-screen px-4 pt-28 pb-16">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_420px] md:gap-12 md:pt-12">
          <div>
            <FadeIn>
              <motion.div
                initial={shouldReduce ? {} : { opacity: 0, scale: 0.9 }}
                animate={shouldReduce ? {} : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.24)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full"
                    style={{ background: "#10B981", opacity: 0.6 }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
                </span>
                <span style={{ color: "rgba(226,232,240,0.92)" }}>Physical AI &amp; Robotics</span>
                <Sparkles className="h-3 w-3" style={{ color: "#34D399" }} />
              </motion.div>
            </FadeIn>

            <KineticHeadline
              className="font-medium tracking-tight text-4xl md:text-6xl"
              words={[
                "Ground-truth",
                "motion",
                "data",
                "for",
                { text: "physical", gradient: true, glow: true },
                { text: "AI.", gradient: true, glow: true },
              ]}
              delay={0.2}
            />

            <FadeIn delay={1.0} className="mt-6">
              <p className="max-w-xl text-base md:text-lg leading-relaxed" style={{ color: "rgba(226,232,240,0.72)" }}>
                Multimodal datasets for humanoid control, imitation learning,
                and sim-to-real transfer. Lab-grade precision from optical
                capture — not estimated from monocular video.
              </p>
            </FadeIn>

            <FadeIn delay={1.2} className="mt-8">
              <div className="flex flex-col items-start gap-3 sm:flex-row">
                <MagneticButton href="/contact" variant="primary">
                  Start a data program <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                <MagneticButton href="#modalities" variant="outline">
                  Explore modalities
                </MagneticButton>
              </div>
            </FadeIn>

            <FadeIn delay={1.4} className="mt-10">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm uppercase tracking-wider" style={{ color: "rgba(226,232,240,0.55)" }}>
                <span>Optical MOCAP</span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
                <span>Multi-modal</span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
                <span>Scene-aware</span>
                <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
                <span>Sim-ready exports</span>
              </div>
            </FadeIn>
          </div>

          {/* Visual side */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, scale: 0.95, y: 20 }}
            animate={shouldReduce ? {} : { opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block"
          >
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 40px 80px -20px rgba(16,185,129,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              <Image
                src="/images/humanoid-ai.jpg"
                alt="Humanoid motion capture"
                width={860}
                height={1040}
                className="aspect-[4/5] w-full object-cover"
                priority
              />
              {/* Vignette */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(2,6,23,0) 40%, rgba(2,6,23,0.6) 100%)" }}
              />
              {/* Overlay data chip */}
              <div
                className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 backdrop-blur-md"
                style={{ background: "rgba(15,23,42,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={{ background: "rgba(16,185,129,0.18)", color: "#10B981" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v6m-4 4l4-4 4 4m-6 4l2-4m4 4l-2-4" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(226,232,240,0.6)" }}>
                    Capture session
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: "white" }}>
                    Full-body MOCAP · hand rig · 48-channel
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={shouldReduce ? {} : { opacity: [0, 1, 1, 0.4, 1] }}
          transition={{ delay: 2, duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ color: "rgba(226,232,240,0.4)" }}
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </div>
    </section>
  );
}
