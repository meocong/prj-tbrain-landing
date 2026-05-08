"use client";

import { useEffect, useRef, useState } from "react";

type Kpi = { value: number; suffix?: string; prefix?: string; label: string };

const KPIS: Kpi[] = [
  { value: 96, suffix: "%", label: "Pass rate" },
  { value: 1000, suffix: "+", label: "Tasks / program" },
  { value: 24, label: "Workflow nodes" },
  { value: 151, label: "Active reviewers" },
  { value: 76, label: "Batches in flight" },
  { value: 0, label: "Lost runs" },
];

export function PlatformKpiBand() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStart(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl px-6 py-10 md:px-12 md:py-14"
      style={{
        background:
          "linear-gradient(135deg, #0b0d12 0%, #1a1530 45%, #0b0d12 100%)",
        border: "1px solid rgba(108,60,244,0.25)",
        boxShadow: "0 25px 80px -30px rgba(108,60,244,0.45)",
      }}
    >
      {/* subtle grid pattern */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {/* glow */}
      <div
        aria-hidden
        className="absolute -top-32 left-1/2 h-80 w-[120%] -translate-x-1/2 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at center, rgba(108,60,244,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        {KPIS.map((k) => (
          <KpiCell key={k.label} kpi={k} animate={start} />
        ))}
      </div>

      <p className="relative mt-6 text-center text-[11px] italic" style={{ color: "rgba(255,255,255,0.55)" }}>
        Aggregated from a representative 1,000-task evaluation campaign run on Expert OS.
      </p>
    </div>
  );
}

function KpiCell({ kpi, animate }: { kpi: Kpi; animate: boolean }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!animate) return;
    if (kpi.value === 0) {
      setN(0);
      return;
    }
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * kpi.value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, kpi.value]);

  const display = kpi.value === 0 ? "0" : n.toLocaleString();

  return (
    <div className="text-center">
      <div
        className="text-4xl md:text-5xl font-bold leading-none"
        style={{
          fontFamily: "var(--font-heading)",
          background: "linear-gradient(120deg, #ffffff 0%, #c4b5fd 60%, #6C3CF4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {kpi.prefix}
        {display}
        {kpi.suffix}
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.6)" }}>
        {kpi.label}
      </div>
    </div>
  );
}
