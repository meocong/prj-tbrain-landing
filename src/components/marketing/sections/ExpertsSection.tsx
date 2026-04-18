"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EXPERTS } from "@/lib/constants/marketing";

export function ExpertsSection() {
  return (
    <section className="container mx-auto mt-32 px-3">
      <div className="relative">
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 blur-sm md:block">
          <Image src="/images/bgr-ab.png" loading="lazy" width={1000} height={1000} alt="" />
        </div>
        <div className="text-center">
          <h3 className="mx-auto max-w-screen-lg text-4xl font-medium md:text-5xl">
            <span className="gradient-text">Sample Experts</span>
          </h3>
        </div>
        <div className="mx-auto mt-16 max-w-screen-lg">
          <div className="grid grid-cols-12 gap-4">
            {EXPERTS.map((expert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="col-span-12 flex flex-col items-center px-8 md:col-span-6 xl:col-span-3"
              >
                <Image
                  src={expert.avatar}
                  loading="lazy"
                  width={500}
                  height={500}
                  alt={expert.name}
                />
                <h2 className="my-3 text-center text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {expert.name}
                </h2>
                <p className="text-center text-base font-normal text-[#78818f] whitespace-pre-line">
                  {expert.bio}
                </p>
                <div className="mt-auto flex pt-4">
                  <span className="mx-auto w-fit rounded-full bg-[#6C3CF4] px-4 py-1 text-sm text-white">
                    {expert.domain}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
