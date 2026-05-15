"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { EXPERTISE_AREAS } from "@/lib/constants/marketing";

export function ExpertiseSection() {
  const col1 = EXPERTISE_AREAS.slice(0, 4);
  const col2 = EXPERTISE_AREAS.slice(4);

  return (
    <section id="skills" className="container mx-auto mb-32 px-3 pt-24">
      <div className="mx-auto max-w-screen-lg">
        <div className="border-gradient-rounded">
          <h3 className="mt-4 text-center font-medium gradient-text !text-[40px] md:mt-3">
            Deep Technical Expertise
          </h3>
          <div className="mx-auto max-w-3xl">
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-6">
                <ul className="mt-12">
                  {col1.map((area, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className={`flex items-center gap-4 ${i > 0 ? "mt-5" : ""}`}
                    >
                      <Image src="/icons/tick.svg" width={28} height={28} alt="" />
                      <p className="text-base font-normal">
                        <span className="gradient-text">{area.label}</span>{" "}
                        {area.detail}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </div>
              <div className="col-span-12 md:col-span-6">
                <ul className="mt-12">
                  {col2.map((area, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                      className="mt-5 flex items-center gap-4"
                    >
                      <Image src="/icons/tick.svg" width={28} height={28} alt="" />
                      <p className="text-base font-normal">
                        <span className="gradient-text">{area.label} </span>
                        {area.detail}
                      </p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="float-end">
            <div className="down-up">
              <Image src="/icons/3star-fill.svg" width={38} height={38} alt="" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
