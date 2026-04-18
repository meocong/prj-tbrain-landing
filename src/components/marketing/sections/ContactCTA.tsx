"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export function ContactCTA() {
  return (
    <section id="contact" className="container mx-auto px-3 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h3 className="mx-auto max-w-screen-lg text-4xl font-medium md:text-5xl">
          Ready to <span className="gradient-text">start now</span>
        </h3>
        <p className="mx-auto mt-4 mb-8 max-w-2xl text-lg font-normal text-[#0e1b2e]">
          Whether you need a benchmark, a training data program, or a managed
          expert team for a complex domain, Tbrain can help you move faster with
          higher confidence.
        </p>
      </motion.div>

      <div className="mx-auto max-w-screen-lg">
        <Image
          src="/images/image.jpg"
          loading="lazy"
          height={500}
          width={2000}
          className="rounded-[30px] md:rounded-[61px]"
          alt="Contact Tbrain"
        />
        <div className="my-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3] hover:shadow-lg"
          >
            Contact Us
          </Link>
          <a
            href="mailto:info@tbrain.ai"
            className="text-lg font-medium text-[#6C3CF4] underline"
          >
            info@tbrain.ai
          </a>
        </div>
      </div>
    </section>
  );
}
