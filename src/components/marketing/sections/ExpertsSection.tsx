"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { EXPERT_NETWORK } from "@/lib/constants/marketing";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

export function ExpertsSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#020617", color: "white" }}
    >
      <div
        aria-hidden
        className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.14) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-10 md:mb-16">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#10B981" }}
            >
              The network
            </span>
            <h2
              className="text-4xl md:text-6xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {EXPERT_NETWORK.headline}
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg" style={{ color: "rgba(226,232,240,0.65)" }}>
              {EXPERT_NETWORK.subheadline}
            </p>
          </div>
        </RevealOnScroll>

        {/* Expert cards */}
        <StaggerContainer className="mx-auto grid max-w-5xl grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {EXPERT_NETWORK.experts.map((expert, i) => (
            <motion.div
              key={i}
              variants={STAGGER_ITEM}
              className="relative overflow-hidden rounded-2xl p-5 text-center"
              style={{
                background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Image
                src={expert.avatar}
                width={72}
                height={72}
                alt={expert.name}
                className="mx-auto rounded-full"
                style={{ border: "2px solid rgba(255,255,255,0.12)" }}
              />
              <h3 className="mt-3 text-base font-semibold" style={{ fontFamily: "var(--font-heading)", color: "white" }}>
                {expert.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium" style={{ color: "#A78BFA" }}>
                {expert.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(226,232,240,0.55)" }}>
                {expert.detail}
              </p>
              <span
                className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(226,232,240,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {expert.domain}
              </span>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
