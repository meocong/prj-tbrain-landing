"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Tour = {
  src: string;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
};

const TOURS: Tour[] = [
  {
    src: "/images/platform/dashboard.png",
    eyebrow: "Live operations",
    title: "Real‑time across every program",
    body:
      "One control room for every active program. Audit activity, member pipeline, project velocity, and provider health stream in from Supabase the moment they happen.",
    bullets: [
      "Live audit log with 7-day rolling chart",
      "Project assessment with velocity + monitor signals",
      "Failure-rate alarms surfaced before customers feel them",
    ],
  },
  {
    src: "/images/platform/project-overview.png",
    eyebrow: "Per‑project command",
    title: "1,000 tasks, 151 reviewers, one screen",
    body:
      "Every project gets an isolated schema and a single overview that rolls up batches, tasks, submissions, pass rate, and a 'needs attention' queue that pulls failed QC and unassigned work to the top.",
    bullets: [
      "76 batches, 1,000 tasks, 96% pass rate at a glance",
      "Quick actions for batch assignment + QC queue",
      "Project Health score with weighted risk signals",
    ],
  },
  {
    src: "/images/platform/knowledge.png",
    eyebrow: "Agent Knowledge Base",
    title: "Versioned grounding for every agent",
    body:
      "Each agent reads from a curated knowledge base that is versioned, searchable, and categorized, so you can audit which guides any answer was grounded in. Add a doc once and every agent that needs it picks it up.",
    bullets: [
      "Per-agent and per-project knowledge scopes",
      "Categories + search + change history",
      "One-click attach into the workflow context",
    ],
  },
  {
    src: "/images/platform/ai-providers.png",
    eyebrow: "Provider routing",
    title: "Pluggable models, no vendor lock‑in",
    body:
      "Configure providers per project with their own keys, fallbacks, and rate limits. Workflow nodes pick a provider by policy; runs track cost so eval programs stay within budget.",
    bullets: [
      "Per-project provider + key isolation",
      "Fallback chains across providers",
      "Run-level cost + token telemetry",
    ],
  },
  {
    src: "/images/platform/batches-list.png",
    eyebrow: "Ops pipeline",
    title: "Batched assignment + status visibility",
    body:
      "Ops leads carve work into batches, assign reviewers, and track progress without a spreadsheet. Customer names and assignees are redacted from this screenshot.",
    bullets: [
      "Drag-and-drop batch assignment",
      "Status pills (Pending → Assigned → Done)",
      "Search + filter across hundreds of batches",
    ],
  },
  {
    src: "/images/platform/ctv-active-tasks.png",
    eyebrow: "Reviewer queue",
    title: "Personal queue with live KPIs",
    body:
      "Reviewers see only their claimed work, with counters for claimed, available, passed, and pending. Internal task IDs are blurred for client privacy.",
    bullets: [
      "Personal KPI tiles update on submission",
      "QC review side panel for inline verdicts",
      "Tool fix surface for video / data corrections",
    ],
  },
];

export function PlatformFeatureTour() {
  return (
    <div className="space-y-24 md:space-y-32">
      {TOURS.map((tour, i) => (
        <FeatureRow key={tour.src} tour={tour} index={i} />
      ))}
    </div>
  );
}

function FeatureRow({ tour, index }: { tour: Tour; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const redactionAreas = tour.src === "/images/platform/knowledge.png"
    ? [
        { top: 35, left: 4, width: 92, height: 12 },
        { top: 49, left: 4, width: 92, height: 12 },
        { top: 63, left: 4, width: 92, height: 12 },
        { top: 77, left: 4, width: 92, height: 12 },
      ]
    : [];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const flipped = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`grid gap-10 md:gap-14 md:grid-cols-2 md:items-center transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className={`${flipped ? "md:order-2" : ""}`}>
        <p
          className="font-family_avt text-xs uppercase tracking-[0.22em]"
          style={{ color: "#6C3CF4" }}
        >
          / {tour.eyebrow}
        </p>
        <h3
          className="mt-3 text-3xl font-semibold md:text-4xl leading-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          {tour.title}
        </h3>
        <p
          className="mt-5 text-base leading-relaxed md:text-lg"
          style={{ color: "var(--text-secondary)" }}
        >
          {tour.body}
        </p>
        <ul className="mt-6 space-y-2.5">
          {tour.bullets.map((b) => (
            <li
              key={b}
              className="flex items-start gap-3 text-sm md:text-base"
              style={{ color: "var(--text-primary)" }}
            >
              <span
                className="mt-1.5 inline-block h-2 w-2 rounded-full shrink-0"
                style={{ background: "linear-gradient(120deg, #6C3CF4, #10B981)" }}
              />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`relative overflow-hidden rounded-2xl ${flipped ? "md:order-1" : ""}`}
        style={{
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 30px 60px -25px rgba(108,60,244,0.25), 0 0 0 1px rgba(108,60,244,0.04)",
          background: "#0b0d12",
        }}
      >
        <div className="relative aspect-[16/10]">
          <Image
            src={tour.src}
            alt={tour.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-top"
          />
          {redactionAreas.map((area, areaIndex) => (
            <div
              key={`${tour.src}-${areaIndex}`}
              className="pointer-events-none absolute rounded-lg backdrop-blur-md"
              style={{
                top: `${area.top}%`,
                left: `${area.left}%`,
                width: `${area.width}%`,
                height: `${area.height}%`,
                background: "rgba(11,13,18,0.48)",
              }}
            />
          ))}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(11,13,18,0) 60%, rgba(11,13,18,0.5) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
