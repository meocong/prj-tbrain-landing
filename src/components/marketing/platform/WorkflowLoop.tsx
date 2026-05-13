"use client";

import { Brain, Bot, Scale, Users, RefreshCw } from "lucide-react";

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
        {/* Animated dashed connector — desktop only */}
        <svg
          aria-hidden
          className="absolute inset-0 hidden md:block pointer-events-none"
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          viewBox="0 0 1000 220"
        >
          <defs>
            <linearGradient id="loop-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6C3CF4" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <path
            d="M 100 110 L 900 110"
            fill="none"
            stroke="url(#loop-line)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="loop-dash"
          />
          {/* Feedback arc — bends back from end to start */}
          <path
            d="M 900 110 Q 900 200 500 200 Q 100 200 100 110"
            fill="none"
            stroke="url(#loop-line)"
            strokeWidth="2"
            strokeDasharray="6 6"
            className="loop-dash"
            opacity="0.7"
          />
        </svg>

        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
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
            );
          })}
        </div>

        <p
          className="mt-10 text-center text-sm italic"
          style={{ color: "var(--text-muted)" }}
        >
          The dashed line is not just decoration. Every verdict really does
          flow back into the knowledge layer via the workflow engine.
        </p>
      </div>
    </div>
  );
}
