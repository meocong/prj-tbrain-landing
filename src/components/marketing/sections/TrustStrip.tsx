"use client";

import { motion } from "framer-motion";
import { TRUST_METRICS } from "@/lib/constants/marketing";

export function TrustStrip() {
  return (
    <section className="border-y border-gray-100 bg-white/60 py-8 backdrop-blur-sm">
      <div className="container mx-auto px-3">
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {TRUST_METRICS.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <div className="text-2xl font-bold text-[#6C3CF4] md:text-3xl">
                {m.value}
              </div>
              <div className="mt-1 text-xs font-medium text-[#78818f] md:text-sm">
                {m.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
