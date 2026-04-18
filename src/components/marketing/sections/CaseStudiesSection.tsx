"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FEATURED_CASE_STUDIES } from "@/lib/constants/marketing";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

export function CaseStudiesSection() {
  return (
    <section className="container mx-auto max-w-[1200px] px-3 pb-24 pt-12 relative">
      <div className="mb-12 text-center">
        <h3 className="mx-auto max-w-screen-lg text-4xl font-medium md:text-5xl">
          <span className="gradient-text">How We Deliver Values</span>
        </h3>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {FEATURED_CASE_STUDIES.map((cs, i) => (
          <motion.div
            key={i}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
            className="flex flex-col rounded-[24px] bg-white/80 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
          >
            <div className="group relative mb-5 overflow-hidden rounded-[20px]">
              <Image
                width={600}
                height={320}
                className="h-[280px] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                src={cs.image}
                alt={cs.title}
              />
              <div className="absolute left-3 top-3 rounded-full bg-[#6C3CF4] px-3 py-1.5 text-sm font-semibold text-white shadow-lg">
                Featured
              </div>
            </div>

            <div className="flex flex-1 flex-col">
              <h2 className="mb-2 text-2xl font-semibold leading-tight text-[#0e1b2e]">
                {cs.title}
              </h2>
              <p className="mb-3 text-base font-medium text-[#6C3CF4]">
                {cs.shortDescription}
              </p>
              <p className="mb-5 text-sm font-normal leading-relaxed text-[#78818f]">
                {cs.description}
              </p>
              <div className="mb-5 grid grid-cols-2 gap-2">
                {cs.metrics.map((m, idx) => (
                  <div key={idx} className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-2.5">
                    <div className="text-xl font-bold text-[#6C3CF4]">{m.value}</div>
                    <div className="text-xs text-[#78818f]">{m.label}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/casestudy"
                className="group mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#6C3CF4] transition-all hover:gap-3"
              >
                View Details
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/casestudy"
          className="group inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3] hover:shadow-lg"
        >
          View More Case Studies
          <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
