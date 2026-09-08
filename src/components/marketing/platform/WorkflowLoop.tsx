"use client";

import { ArrowRight, Brain, Bot, Scale, Users, RefreshCw } from "lucide-react";

const STEPS = [
  {
    icon: Brain,
    title: "Knowledge",
    body: "Curated, versioned reference set",
    color: "#6C3CF4",
  },
  {
    icon: Bot,
    title: "Agent run",
    body: "Grounded answer with citations",
    color: "#8b5cf6",
  },
  {
    icon: Scale,
    title: "LLM judge",
    body: "Auto-eval gate before humans",
    color: "#a78bfa",
  },
  {
    icon: Users,
    title: "Reviewer",
    body: "Domain-expert verdict + correction",
    color: "#10B981",
  },
  {
    icon: RefreshCw,
    title: "Feedback",
    body: "Updates back into the knowledge base",
    color: "#34d399",
  },
];

export function WorkflowLoop() {
  return (
    <div
      className="relative overflow-hidden rounded-3xl px-6 py-12 md:px-12 md:py-16"
      style={{
        background:
          "linear-gradient(135deg, rgba(108,60,244,0.05) 0%, rgba(16,185,129,0.04) 100%)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div className="text-center mb-12">
        <p
          className="font-family_avt text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--text-muted)" }}
        >
          / the loop
        </p>
        <h2
          className="mt-3 text-3xl font-semibold md:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          The <span className="gradient-text">closed loop</span> that improves agents
        </h2>
        <p
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          Every reviewer verdict feeds back into the knowledge layer. Agents
          get smarter with every batch, without quarterly retraining cycles.
        </p>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <svg
          aria-hidden
          className="absolute inset-x-8 -bottom-12 hidden h-28 md:block pointer-events-none"
          preserveAspectRatio="none"
          viewBox="0 0 1000 120"
        >
          <defs>
            <linearGradient id="loop-return-line" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#6C3CF4" stopOpacity="0.55" />
            </linearGradient>
            <marker
              id="loop-return-arrow"
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto"
            >
              <path d="M 0 0 L 7 3.5 L 0 7 z" fill="#6C3CF4" opacity="0.72" />
            </marker>
          </defs>
          <path
            d="M 955 24 C 760 106 240 106 45 24"
            fill="none"
            stroke="url(#loop-return-line)"
            strokeWidth="1.75"
            strokeDasharray="6 8"
            strokeLinecap="round"
            markerEnd="url(#loop-return-arrow)"
            className="loop-dash"
          />
          <circle cx="955" cy="24" r="4" fill="#10B981" opacity="0.75" />
        </svg>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative">
                {i > 0 ? (
                  <div
                    aria-hidden
                    className="absolute -left-5 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full md:flex"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "var(--shadow-card)",
                      color: step.color,
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>
                ) : null}
                <div
                  className="relative rounded-2xl p-5 text-center backdrop-blur-sm"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                  animation: `loopPulse 4s ease-in-out ${i * 0.4}s infinite`,
                }}
              >
                <span
                  className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: `${step.color}1a`,
                    border: `1px solid ${step.color}33`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: step.color }} />
                </span>
                <div
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em]"
                  style={{ color: step.color }}
                >
                  Step {i + 1}
                </div>
                <h3
                  className="mt-1 text-lg font-semibold"
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "var(--text-primary)",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  className="mt-1.5 text-xs leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {step.body}
                </p>
                </div>
              </div>
            );
          })}
        </div>

        <p
          className="mt-14 text-center text-sm italic"
          style={{ color: "var(--text-muted)" }}
        >
          The dashed line is not just decoration. Every verdict really does
          flow back into the knowledge layer via the workflow engine.
        </p>
      </div>
    </div>
  );
}
