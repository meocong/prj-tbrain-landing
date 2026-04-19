"use client";

import { motion } from "framer-motion";
import { PLATFORM_FEATURES } from "@/lib/constants/marketing";
import { ShieldCheck, BarChart3, Lock, Workflow } from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  ShieldCheck,
  BarChart3,
  Lock,
  Workflow,
};

export function PlatformSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="container mx-auto px-3">
        <div className="text-center">
          <h2 className="text-4xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
            Built on Our{" "}
            <span className="gradient-text">AI-Native Platform</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#78818f]">
            Custom-built infrastructure that scales quality. Not a spreadsheet —
            a production system with automated QC, real-time visibility, and
            agentic workflows.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {PLATFORM_FEATURES.map((feature, i) => {
            const Icon = ICON_MAP[feature.icon] || ShieldCheck;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#6C3CF4]/5">
                  <Icon className="h-5 w-5 text-[#6C3CF4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#0e1b2e]" style={{ fontFamily: "var(--font-heading)" }}>
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#78818f]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
