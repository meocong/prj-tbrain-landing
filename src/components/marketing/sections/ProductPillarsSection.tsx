"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PRODUCT_PILLARS } from "@/lib/constants/marketing";
import { Terminal, Bot, Database, ArrowRight } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Terminal,
  Bot,
  Database,
};

export function ProductPillarsSection() {
  return (
    <section className="container mx-auto px-3 py-24">
      <div className="text-center">
        <h2 className="text-4xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
          Our <span className="gradient-text">Data Products</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#78818f]">
          Purpose-built data solutions for the most demanding AI challenges
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
        {PRODUCT_PILLARS.map((pillar, i) => {
          const Icon = ICON_MAP[pillar.icon] || Database;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#6C3CF4]/30 hover:shadow-lg"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${pillar.color}10` }}
              >
                <Icon className="h-6 w-6" style={{ color: pillar.color }} />
              </div>

              <h3 className="mt-4 text-xl font-semibold text-[#0e1b2e]" style={{ fontFamily: "var(--font-heading)" }}>
                {pillar.title}
              </h3>
              <p className="mt-1 text-sm font-medium" style={{ color: pillar.color }}>
                {pillar.subtitle}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-[#78818f]">
                {pillar.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {pillar.metrics.map((m, j) => (
                  <div
                    key={j}
                    className="rounded-lg bg-gray-50 p-2.5 text-center"
                  >
                    <div className="text-lg font-bold" style={{ color: pillar.color }}>
                      {m.value}
                    </div>
                    <div className="text-[10px] text-[#78818f]">{m.label}</div>
                  </div>
                ))}
              </div>

              <Link
                href={pillar.href}
                className="group/link mt-5 inline-flex items-center gap-2 text-sm font-semibold transition-all"
                style={{ color: pillar.color }}
              >
                Learn more
                <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
