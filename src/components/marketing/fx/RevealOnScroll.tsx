"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

const DEFAULT_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function RevealOnScroll({
  children,
  delay = 0,
  className,
  variants = DEFAULT_VARIANTS,
  amount = 0.25,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variants?: Variants;
  /**
   * Framer's own type, not just `number`. A fraction is a fraction OF THE
   * ELEMENT, so on a block taller than the viewport it asks for more pixels
   * than the viewport has and the reveal can never fire — `"some"` is the only
   * safe value there. See the note in samples/_sections/Reveal.tsx, which hit
   * exactly that with a 7,367px catalogue grid.
   */
  amount?: number | "some" | "all";
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={shouldReduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={variants}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  stagger = 0.08,
  amount = 0.2,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </motion.div>
  );
}

export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
