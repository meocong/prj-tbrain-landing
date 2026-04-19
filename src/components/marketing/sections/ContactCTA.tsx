"use client";

import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/marketing/fx/MagneticButton";
import { RevealOnScroll } from "@/components/marketing/fx/RevealOnScroll";

export function ContactCTA() {
  return (
    <section
      className="relative overflow-hidden py-28 md:py-40"
      style={{ background: "#020617", color: "white" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(108,60,244,0.32) 0%, transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 20% 80%, rgba(16,185,129,0.25) 0%, transparent 55%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center">
        <RevealOnScroll>
          <h2
            className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.05]"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
          >
            Let&apos;s build{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 50%, #10B981 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              the dataset
            </span>{" "}
            <br className="hidden md:block" />
            your model needs.
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl text-base md:text-lg" style={{ color: "rgba(226,232,240,0.65)" }}>
            Tell us your training target. We&apos;ll scope a program in 48 hours and ship first samples in 2 weeks.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.3}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <MagneticButton href="/contact" variant="primary">
              Talk to an expert <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <MagneticButton href="/casestudy" variant="outline">
              See case studies
            </MagneticButton>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delay={0.5}>
          <p className="mt-10 text-xs uppercase tracking-widest" style={{ color: "rgba(226,232,240,0.4)" }}>
            Tbrain · Data Factory · Hanoi · Singapore
          </p>
        </RevealOnScroll>
      </div>
    </section>
  );
}
