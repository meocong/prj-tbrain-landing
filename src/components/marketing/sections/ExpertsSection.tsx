"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EXPERT_NETWORK } from "@/lib/constants/marketing";

export function ExpertsSection() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-24">
      <div className="container mx-auto px-3">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2
            className="text-4xl font-medium md:text-5xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            <span className="gradient-text">{EXPERT_NETWORK.headline}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#78818f]">
            {EXPERT_NETWORK.subheadline}
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-8 md:gap-16">
          {EXPERT_NETWORK.stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-[#6C3CF4]">{s.value}</div>
              <div className="mt-1 text-sm text-[#78818f]">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Expert cards */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERT_NETWORK.experts.map((expert, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:shadow-md"
            >
              <Image
                src={expert.avatar}
                width={80}
                height={80}
                alt={expert.name}
                className="mx-auto rounded-full"
              />
              <h3
                className="mt-3 text-base font-semibold text-[#0e1b2e]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {expert.name}
              </h3>
              <p className="mt-0.5 text-xs font-medium text-[#6C3CF4]">
                {expert.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#78818f]">
                {expert.detail}
              </p>
              <div className="mt-3">
                <span className="inline-block rounded-full bg-gray-100 px-3 py-0.5 text-[10px] font-medium text-gray-600">
                  {expert.domain}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
