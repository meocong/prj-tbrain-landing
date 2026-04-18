"use client";

import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";

const STATS = [
  { value: 48000, suffix: "+", label: "AI Training Experts" },
  { value: 250, suffix: "+", label: "Projects Delivered" },
  { value: 17, suffix: "+", label: "Countries" },
  { value: 15, suffix: "+", label: "Years Combined Leadership" },
];

export function StatsGrid() {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
      {STATS.map((s, i) => (
        <div key={i} className="glass-card p-6 text-center">
          <div className="text-3xl font-bold text-[#6C3CF4]">
            <AnimatedCounter value={s.value} suffix={s.suffix} duration={2} />
          </div>
          <div className="mt-1 text-sm text-[#78818f]">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
