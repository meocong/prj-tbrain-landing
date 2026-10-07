"use client";

import { MotionConfig, motion, type Variants } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";
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
  /* `initial` is the same whatever the preference: the server renders it, and
     one that followed the preference failed hydration for every reader with
     reduced motion set. Under reduced motion the block goes to `visible` at
     once, without waiting to be scrolled to, and without a transition. */
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView={shouldReduce ? undefined : "visible"}
      animate={shouldReduce ? "visible" : undefined}
      viewport={{ once: true, amount }}
      variants={variants}
      transition={shouldReduce ? { duration: 0 } : { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
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
  const shouldReduce = useReducedMotion();
  return (
    // Same `initial` either way, for hydration; see RevealOnScroll.
    <motion.div
      className={className}
      initial="hidden"
      whileInView={shouldReduce ? undefined : "visible"}
      animate={shouldReduce ? "visible" : undefined}
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: shouldReduce ? 0 : stagger } },
      }}
    >
      {/* The items carry their own transition (STAGGER_ITEM); under reduced
          motion this drops their movement and leaves only the fade. */}
      <MotionConfig reducedMotion={shouldReduce ? "always" : "never"}>{children}</MotionConfig>
    </motion.div>
  );
}

export const STAGGER_ITEM: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
