"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Bot, Terminal, Video, Image as ImageIcon, MessageSquare, Cpu } from "lucide-react";
import { TiltCard } from "@/components/marketing/fx/TiltCard";
import { RevealOnScroll, StaggerContainer, STAGGER_ITEM } from "@/components/marketing/fx/RevealOnScroll";

const PILLARS = [
  {
    size: "md" as const,
    title: "Physical AI",
    subtitle: "Motion capture · Humanoid control · Sim-to-real",
    icon: Bot,
    accent: "#A78BFA",
    href: "/data/physical-ai",
    description:
      "Lab-grade human motion capture — not estimated from video — for training humanoid policies, imitation learning, and embodied agents.",
    visual: "physical",
  },
  {
    size: "md" as const,
    title: "Terminal-Bench",
    subtitle: "Agent evaluation at scale",
    icon: Terminal,
    accent: "#10B981",
    href: "/data/terminal-bench",
    description:
      "Multi-step, tool-using agent tasks with ground-truth traces and automated grading.",
    visual: "terminal",
  },
  {
    size: "md" as const,
    title: "Video annotation",
    subtitle: "Temporal labels at frame precision",
    icon: Video,
    accent: "#6C3CF4",
    href: "/services",
    description:
      "Frame-level boxes, segmentation, action recognition, and multi-view tracking.",
    visual: "video",
  },
  {
    size: "md" as const,
    title: "Image labeling",
    subtitle: "Pixel-perfect masks & boxes",
    icon: ImageIcon,
    accent: "#34D399",
    href: "/services",
    description:
      "Classification, detection, instance & semantic segmentation — calibrated for frontier vision models.",
    visual: "image",
  },
  {
    size: "md" as const,
    title: "Text QC & RLHF",
    subtitle: "Human preference at scale",
    icon: MessageSquare,
    accent: "#8B5CF6",
    href: "/services",
    description:
      "Preference ranking, rubric-based scoring, and red-team evals with audit trails.",
    visual: "text",
  },
  {
    size: "md" as const,
    title: "AI-native QC",
    subtitle: "Models that watch the models",
    icon: Cpu,
    accent: "#F59E0B",
    href: "/services",
    description:
      "Every sample runs through our confidence models — flagging edge cases before they hit your training run.",
    visual: "qc",
  },
];

export function ProductPillarsSection() {
  return (
    <section
      id="products"
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#020617", color: "white" }}
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse at center top, black 30%, transparent 85%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(108,60,244,0.25) 0%, transparent 65%)", filter: "blur(60px)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 right-1/4 h-[500px] w-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)", filter: "blur(60px)" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <RevealOnScroll>
          <div className="text-center mb-14 md:mb-20">
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#A78BFA" }}
            >
              What we build
            </span>
            <h2
              className="text-4xl md:text-6xl font-medium tracking-tight"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Data programs,{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA, #10B981)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                purpose-built
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg" style={{ color: "rgba(226,232,240,0.65)" }}>
              Six capabilities. One data factory. From embodied AI to agent evals, we ship the gold-standard set your team can&apos;t assemble in-house.
            </p>
          </div>
        </RevealOnScroll>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-[minmax(280px,auto)]">
          {PILLARS.map((p) => (
            <motion.div
              key={p.title}
              variants={STAGGER_ITEM}
              className=""
            >
              <TiltCard className="h-full" intensity={4}>
                <Link
                  href={p.href}
                  className="group relative block h-full overflow-hidden rounded-3xl p-6 md:p-8"
                  style={{
                    background: "linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute -top-16 -right-16 h-40 w-40 rounded-full transition-opacity duration-700 group-hover:opacity-100 opacity-40"
                    style={{ background: `radial-gradient(circle, ${p.accent}44 0%, transparent 70%)`, filter: "blur(28px)" }}
                  />

                  <PillarVisual kind={p.visual} accent={p.accent} />

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <span
                        className="flex h-11 w-11 items-center justify-center rounded-xl"
                        style={{ background: `${p.accent}22`, color: p.accent, border: `1px solid ${p.accent}33` }}
                      >
                        <p.icon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight
                        className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45 group-hover:translate-x-1"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
                      {p.title}
                    </h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wider" style={{ color: p.accent }}>
                      {p.subtitle}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed max-w-md" style={{ color: "rgba(226,232,240,0.68)" }}>
                      {p.description}
                    </p>
                  </div>
                </Link>
              </TiltCard>
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

function PillarVisual({ kind, accent }: { kind: string; accent: string }) {
  if (kind === "physical") {
    const JOINTS = [
      [280, 70], [280, 100], [280, 160], [235, 140], [325, 140],
      [215, 180], [350, 175], [255, 225], [305, 225], [245, 275], [320, 275],
    ] as const;
    return (
      <div aria-hidden className="absolute inset-0 flex items-end justify-end pointer-events-none opacity-70">
        <svg viewBox="0 0 400 300" className="h-full w-auto" style={{ color: accent, filter: `drop-shadow(0 0 20px ${accent}55)` }}>
          <g fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <circle cx="280" cy="70" r="10" />
            <line x1="280" y1="80" x2="280" y2="160" />
            <line x1="280" y1="100" x2="235" y2="140" />
            <line x1="280" y1="100" x2="325" y2="140" />
            <line x1="235" y1="140" x2="215" y2="180" />
            <line x1="325" y1="140" x2="350" y2="175" />
            <line x1="280" y1="160" x2="255" y2="225" />
            <line x1="280" y1="160" x2="305" y2="225" />
            <line x1="255" y1="225" x2="245" y2="275" />
            <line x1="305" y1="225" x2="320" y2="275" />
            {JOINTS.map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2.4" className="pillar-joint" style={{ animationDelay: `${i * 0.18}s` }} />
            ))}
          </g>
          <path className="pillar-trail" d="M 100 250 Q 150 180, 200 220 T 300 200" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.45" />
        </svg>
      </div>
    );
  }

  if (kind === "terminal") {
    const LINES = [
      { color: "#64748B", text: "$ tb run --task agent.clone" },
      { color: accent,    text: "→ step 3/7 · search_docs(\"memory\")" },
      { color: "#10B981", text: "✓ test 4 passed" },
    ];
    return (
      <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none opacity-60">
        <div
          className="mx-6 mb-6 rounded-lg p-3 text-[10px] font-mono leading-relaxed overflow-hidden"
          style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {LINES.map((l, i) => (
            <div key={i} className="pillar-typewriter" style={{ color: l.color, animationDelay: `${i * 0.8}s` }}>
              {l.text}
              <span className="pillar-caret" style={{ color: accent }}>▍</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none opacity-70">
        <div className="mx-6 mb-6 flex h-14 items-end gap-[2px] rounded" style={{ background: "rgba(0,0,0,0.3)" }}>
          {Array.from({ length: 38 }).map((_, i) => (
            <span
              key={i}
              className="flex-1 pillar-bar"
              style={{
                background: accent,
                animationDelay: `${(i * 0.06) % 1.2}s`,
                boxShadow: `0 0 6px ${accent}55`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "image") {
    return (
      <div aria-hidden className="absolute right-6 bottom-6 grid grid-cols-4 gap-1 pointer-events-none opacity-70">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="block h-5 w-5 rounded-sm pillar-pixel"
            style={{
              background: `${accent}55`,
              border: `1px solid ${accent}66`,
              animationDelay: `${(i * 0.08) % 1.5}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (kind === "text") {
    return (
      <div aria-hidden className="absolute inset-x-0 bottom-0 pointer-events-none opacity-65">
        <div className="mx-6 mb-6 space-y-1.5">
          {[85, 62, 92, 54].map((w, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full pillar-text-bar"
              style={{
                width: `${w}%`,
                background: i === 2 ? accent : "rgba(255,255,255,0.22)",
                animationDelay: `${i * 0.35}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "qc") {
    return (
      <div aria-hidden className="absolute inset-0 flex items-end justify-end pointer-events-none opacity-70">
        <svg viewBox="0 0 400 280" className="h-full w-auto" style={{ color: accent, filter: `drop-shadow(0 0 20px ${accent}55)` }}>
          <defs>
            <linearGradient id="qcGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 20 220 Q 80 200, 120 180 T 240 120 T 380 60 L 380 240 L 20 240 Z" fill="url(#qcGrad)" />
          <path
            className="pillar-chart-line"
            d="M 20 220 Q 80 200, 120 180 T 240 120 T 380 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {[[120, 180], [180, 155], [240, 120], [310, 85], [380, 60]].map(([cx, cy], i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="3.5"
              fill="currentColor"
              className="pillar-chart-dot"
              style={{ animationDelay: `${0.4 + i * 0.15}s` }}
            />
          ))}
        </svg>
      </div>
    );
  }
  return null;
}
