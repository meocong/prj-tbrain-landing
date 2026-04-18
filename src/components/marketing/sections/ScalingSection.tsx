"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ScalingSection() {
  return (
    <section id="about" className="container mx-auto px-3 pt-24">
      <div className="text-center">
        <h3 className="mx-auto max-w-screen-lg text-4xl font-medium md:text-5xl">
          Optimized for{" "}
          <span className="gradient-text">Scaling Complexity</span>
        </h3>
        <p className="mx-auto mt-5 max-w-5xl text-lg font-normal text-[#78818f]">
          Legacy marketplaces break on high-stakes AI work. We provide the
          verifiable software systems and expert-led loops required for agents to
          self-improve.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-screen-lg px-1">
        {/* Row 1 */}
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 md:gap-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="flex min-h-[200px] flex-col justify-center rounded-2xl border border-[#6C3CF4]/40 bg-white/75 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <h4 className="mb-3 text-2xl font-bold text-[#6C3CF4]/90 md:text-3xl">
                Domain-Specific Expert Pods
              </h4>
              <p className="text-base font-normal text-[#0e1b2e] md:text-lg">
                Coding, STEM, Medical, Manufacturing, Agent Tool Use etc.
              </p>
            </div>
          </motion.div>
          <div className="mt-6 md:mt-10">
            <Image
              src="/images/3.png"
              loading="lazy"
              width={600}
              height={500}
              alt="Team collaboration"
              className="h-auto w-full rounded-2xl object-cover"
            />
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="flex min-h-[200px] flex-col justify-center rounded-2xl border border-[#6C3CF4]/40 bg-white/75 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <h4 className="mb-3 text-2xl font-bold text-[#6C3CF4]/90 md:text-3xl">
                Custom software & tools
              </h4>
              <p className="text-base font-normal text-[#0e1b2e] md:text-lg">
                to see immediate results
              </p>
            </div>
          </motion.div>
        </div>

        {/* Row 2 */}
        <div className="mt-4 grid grid-cols-1 items-end gap-4 sm:grid-cols-3 md:mt-6 md:gap-6">
          <div className="mt-6 md:mt-10">
            <Image
              src="/images/2.png"
              loading="lazy"
              width={600}
              height={500}
              alt="Expertise illustration"
              className="h-auto w-full rounded-2xl object-cover"
            />
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="flex min-h-[200px] flex-col justify-center rounded-2xl border border-[#6C3CF4]/40 bg-white/75 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <h4 className="mb-3 text-2xl font-bold text-[#6C3CF4]/90 md:text-3xl">
                17k +
              </h4>
              <p className="text-base font-normal text-[#0e1b2e] md:text-lg">
                Pipeline from top universities and research institutions
                including <span className="font-bold">PhDs</span> and{" "}
                <span className="font-bold">International Olympiad</span>{" "}
                medalists.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="flex min-h-[200px] flex-col justify-center rounded-2xl border border-[#6C3CF4]/40 bg-white/75 p-6 shadow-sm backdrop-blur-sm md:p-8">
              <h4 className="mb-3 text-2xl font-bold text-[#6C3CF4]/90 md:text-3xl">
                Verifiable
              </h4>
              <p className="text-base font-normal text-[#0e1b2e] md:text-lg">
                Closed-loop reinforcement learning systems for agents to
                self-improve.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
