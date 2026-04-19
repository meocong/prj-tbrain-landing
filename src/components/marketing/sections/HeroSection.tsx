"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import StartNow from "@/components/common/StartNow";

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden">
      {/* Background blobs */}
      <div className="wrap">
        <div className="one top-0 left-1/4 h-80 w-80" />
        <div className="two top-0 right-1/4 h-80 w-80" />
      </div>

      <div className="container mx-auto flex min-h-screen items-center justify-center px-3 pt-20 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3">
            <div className="up-down">
              <Image src="/icons/3star.svg" width={38} height={38} alt="" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="z-10 text-nowrap rounded-3xl bg-white px-5 py-2 text-sm font-medium text-[#6C3CF4] shadow"
            >
              The human power of RLHF and SFT
            </motion.div>
          </div>

          <h1 className="mt-10 text-5xl font-medium leading-tight md:text-7xl">
            The Improvement Layer for{" "}
            <span className="gradient-text">
              Agentic AI Training Data & Evaluation
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-screen-md text-lg text-[#78818f]">
            Expert-validated environments and data to measure and improve agent
            performance. Fast, scalable, and reliable.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-10 flex items-center justify-center"
          >
            <StartNow />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating images */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute left-[10%] top-[20%] z-10 hidden md:block"
      >
        <Image src="/icons/home-1.png" width={110} height={110} alt="" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute right-[10%] top-[55%] z-10 hidden md:block"
      >
        <Image src="/icons/home-2.png" width={130} height={130} alt="" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-[15%] left-[5%] z-10 hidden md:block"
      >
        <Image src="/icons/home-3.png" width={180} height={180} alt="" />
      </motion.div>
    </section>
  );
}
