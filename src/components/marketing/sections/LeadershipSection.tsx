"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { LEADERSHIP } from "@/lib/constants/marketing";

export function LeadershipSection() {
  return (
    <section className="container mx-auto px-3 pt-28">
      <div className="text-center">
        <h3 className="mx-auto max-w-screen-lg text-4xl font-medium md:text-5xl">
          Leadership has extensive experience in{" "}
          <span className="gradient-text">AI training</span> and{" "}
          <span className="gradient-text">resource management</span>
        </h3>
      </div>

      <div className="mx-auto max-w-screen-lg">
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
          {LEADERSHIP.map((leader, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="min-h-56"
            >
              <div className="h-full rounded-3xl bg-[#e8e6e664] p-8 backdrop-blur-xl">
                <Image
                  src={leader.avatar}
                  width={88}
                  height={88}
                  alt={leader.name}
                  className="rounded-full"
                />
                <h3 className="mt-6 text-3xl font-medium">{leader.name}</h3>
                <p className="mt-3 min-h-[130px] text-base font-normal text-[#78818f]">
                  {leader.bio}
                </p>
                <div className="flex gap-4">
                  {leader.logos.map((logo, j) => (
                    <Image
                      key={j}
                      src={`/icons/${logo}`}
                      alt=""
                      width={40}
                      height={40}
                      className="aspect-square shrink-0 rounded-[28px]"
                    />
                  ))}
                  <Image
                    src="/icons/3dots.svg"
                    alt=""
                    width={40}
                    height={40}
                    className="aspect-square shrink-0 rounded-[28px]"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
