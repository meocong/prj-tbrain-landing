"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { SAMPLE_PROJECTS } from "@/lib/constants/marketing";

export function ProjectsSection() {
  return (
    <section className="container mx-auto mt-32 flex max-w-screen-xl flex-col items-center px-3">
      <div className="text-center">
        <h3 className="mx-auto max-w-screen-lg text-4xl font-medium md:text-5xl">
          <span className="gradient-text">Sample Projects</span>
        </h3>
      </div>

      <div className="mt-16 grid w-fit grid-cols-1 gap-6 md:grid-cols-3">
        {SAMPLE_PROJECTS.map((project, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="h-[362px] w-[352px] bg-[linear-gradient(0deg,rgba(255,255,255,0)_0%,rgba(108,60,244,0.05)_50%,rgba(108,60,244,0.15)_100%)] p-8 gradient-border-top"
          >
            <div className="mb-6 h-[90px] w-[90px]">
              <Image src={project.icon} width={90} height={90} alt={project.title} />
            </div>
            <h4 className="mb-4 text-[20px] font-bold text-[#6C3CF4]">
              {project.title}
            </h4>
            <p className="text-[#0e1b2e]">{project.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
