"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LEADERSHIP } from "@/lib/constants/marketing";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

export function LeadershipSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}
    >
      <div
        aria-hidden
        className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.10) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#6C3CF4" }}
            >
              Leadership
            </span>
            <h2
              className="text-4xl md:text-6xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Built by operators with{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                deep AI-training chops
              </span>
            </h2>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="mx-auto max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-5">
          {LEADERSHIP.map((leader, i) => (
            <motion.div
              key={i}
              variants={STAGGER_ITEM}
              className="relative h-full overflow-hidden rounded-3xl p-6 md:p-8"
              style={{
                background: "white",
                border: "1px solid rgba(15,23,42,0.06)",
                boxShadow: "0 6px 24px -8px rgba(15,23,42,0.10)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-12 -right-12 h-36 w-36 rounded-full pointer-events-none opacity-30"
                style={{ background: "radial-gradient(circle, rgba(108,60,244,0.30) 0%, transparent 70%)", filter: "blur(24px)" }}
              />
              <div className="relative z-10">
                <Image
                  src={leader.avatar}
                  width={72}
                  height={72}
                  alt={leader.name}
                  className="rounded-full"
                  style={{ border: "2px solid rgba(15,23,42,0.08)" }}
                />
                <h3
                  className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                >
                  {leader.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {leader.bio}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {leader.logos.map((logo, j) => (
                    <span
                      key={j}
                      className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shrink-0"
                      style={{ background: "white", border: "1px solid rgba(15,23,42,0.10)" }}
                      title={logo.replace(/_logo\.svg$/, "")}
                    >
                      {/* Plain <img> bypasses next/image SVG optimization that blurs
                          raster-in-SVG brand logos. Intrinsic size is 40×40 so we
                          render at 32 with crisp-edges for sharp downscale. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/icons/${logo}`}
                        alt=""
                        width={32}
                        height={32}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: 32,
                          height: 32,
                          objectFit: "contain",
                          imageRendering: "auto",
                        }}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
