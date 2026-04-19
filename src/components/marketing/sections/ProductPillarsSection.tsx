"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { PRODUCT_PILLARS } from "@/lib/constants/marketing";
import { ArrowRight } from "lucide-react";

export function ProductPillarsSection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
            Purpose-built data for the{" "}
            <span className="gradient-text">hardest AI problems</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#78818f]">
            From robotics to agent evaluation, we build the data infrastructure
            that frontier AI teams depend on.
          </p>
        </motion.div>

        <div className="mx-auto mt-20 max-w-6xl space-y-20">
          {PRODUCT_PILLARS.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className={`flex flex-col gap-12 lg:flex-row ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text content */}
              <div className="flex-1">
                <div
                  className="inline-block rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white"
                  style={{ backgroundColor: pillar.color }}
                >
                  {pillar.title}
                </div>
                <h3
                  className="mt-4 text-3xl font-medium md:text-4xl"
                  style={{ fontFamily: "var(--font-heading)", color: "#0e1b2e" }}
                >
                  {pillar.subtitle}
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[#78818f]">
                  {pillar.description}
                </p>
                <Link
                  href={pillar.href}
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: pillar.color }}
                >
                  Explore {pillar.title.toLowerCase()}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              {/* Numbered features */}
              <div className="flex-1 space-y-6">
                {pillar.features.map((f, j) => (
                  <div key={j} className="flex gap-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: pillar.color }}
                    >
                      {f.num}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0e1b2e]">{f.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-[#78818f]">
                        {f.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
