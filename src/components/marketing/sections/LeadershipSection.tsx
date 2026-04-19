"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LEADERSHIP } from "@/lib/constants/marketing";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

export function LeadershipSection() {
  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#020617", color: "white" }}
    >
      <div
        aria-hidden
        className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(167,139,250,0.16) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#A78BFA" }}
            >
              Leadership
            </span>
            <h2
              className="text-4xl md:text-6xl font-medium tracking-tight"
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
                background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                aria-hidden
                className="absolute -top-12 -right-12 h-36 w-36 rounded-full pointer-events-none opacity-30"
                style={{ background: "radial-gradient(circle, rgba(108,60,244,0.5) 0%, transparent 70%)", filter: "blur(24px)" }}
              />
              <div className="relative z-10">
                <Image
                  src={leader.avatar}
                  width={72}
                  height={72}
                  alt={leader.name}
                  className="rounded-full"
                  style={{ border: "2px solid rgba(255,255,255,0.15)" }}
                />
                <h3
                  className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight"
                  style={{ fontFamily: "var(--font-heading)", color: "white" }}
                >
                  {leader.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.65)" }}>
                  {leader.bio}
                </p>
                <div className="mt-5 flex gap-3">
                  {leader.logos.map((logo, j) => (
                    <span
                      key={j}
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      <Image
                        src={`/icons/${logo}`}
                        alt=""
                        width={22}
                        height={22}
                        className="opacity-80"
                        style={{ filter: "brightness(0) invert(1)" }}
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
