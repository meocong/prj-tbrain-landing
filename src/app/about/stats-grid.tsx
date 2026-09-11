"use client";

import { AnimatedCounter } from "@/components/marketing/AnimatedCounter";
import type { AboutHeroStat } from "@/lib/landing/about-hero";

const STATS = [
  { value: 17, suffix: "K+", label: "Expert Pipeline" },
  { value: 8, suffix: "+", label: "Core Domains" },
  { value: 3, suffix: "+", label: "Data Modalities" },
  { value: 100, suffix: "%", label: "Verifiable Loops" },
];

export function StatsGrid({ stats = STATS }: { stats?: AboutHeroStat[] }) {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
      {stats.map((s, i) => (
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
