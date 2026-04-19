"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="wrap">
        <div className="one top-0 left-1/4 h-80 w-80" />
        <div className="two top-0 right-1/4 h-80 w-80" />
      </div>

      <div className="container mx-auto flex min-h-screen items-center justify-center px-3 pt-24 pb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3">
            <div className="up-down">
              <Image src="/icons/3star.svg" width={38} height={38} alt="" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="z-10 rounded-3xl bg-white px-5 py-2 text-sm font-medium text-[#6C3CF4] shadow"
            >
              Trusted by leading AI labs
            </motion.div>
          </div>

          <h1 className="mt-10 text-center text-5xl font-medium leading-tight md:text-7xl">
            The data factory for{" "}
            <span className="gradient-text">
              robotics, agents & post-training
            </span>
          </h1>

          <p className="mx-auto mt-10 max-w-screen-md text-center text-lg text-[#78818f]">
            From ground-truth motion capture to multi-step agent benchmarks,
            we partner with AI teams to build the data their models can&apos;t
            learn without. 48K+ experts. Lab-grade precision. AI-native QC.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              href="/contact"
              className="rounded-full bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3] hover:shadow-lg"
            >
              Talk to an expert
            </Link>
            <Link
              href="/data/physical-ai"
              className="rounded-full border border-gray-300 px-8 py-3 text-base font-medium text-[#0e1b2e] transition-all hover:border-[#6C3CF4] hover:text-[#6C3CF4]"
            >
              Explore robotics data
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute left-[27%] top-[15%] z-10 hidden md:block"
      >
        <Image src="/icons/home-1.png" width={110} height={110} alt="" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="absolute right-[13%] top-[55%] z-10 hidden md:block"
      >
        <Image src="/icons/home-2.png" width={130} height={130} alt="" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-[15%] left-[13%] z-10 hidden md:block"
      >
        <Image src="/icons/home-3.png" width={180} height={180} alt="" />
      </motion.div>
    </section>
  );
}
