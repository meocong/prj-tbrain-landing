"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE } from "./tokens";

/**
 * Scroll reveal, shared.
 *
 * `CategoryChooser` had one and every section built after it had none, so the
 * page went from cards that arrive to blocks that are simply there. This is the
 * same motion in one place rather than six copies of it.
 *
 * Measured off `claru.ai/data-catalog` on 2026-09-09 rather than invented:
 * copy blocks rise from `translateY(30px)` at `opacity 0`, media cards come up
 * from `scale(0.95)`, and 25 of 60 elements below the fold carry one or the
 * other. Two variants is the whole system there, and two is enough here.
 *
 * Ours rises 22px rather than 30. At 30 the eight-column stat rows on a
 * category header read as a curtain dropping rather than as content settling,
 * because eight items moving 30px in step is a lot of travel for a line of
 * numbers.
 *
 * `once` is always true. A block that re-animates every time it re-enters is a
 * page that will not sit still, and this one is read rather than watched.
 */
export function Reveal({
  children,
  variant = "rise",
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** `rise` for copy and data, `zoom` for anything with a frame in it. */
  variant?: "rise" | "zoom";
  /** Seconds. Use for stagger within a group, never above ~0.3. */
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  const hidden =
    variant === "zoom" ? { opacity: 0, scale: 0.96 } : { opacity: 0, y: 22 };
  const shown = variant === "zoom" ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={reduce ? false : hidden}
      whileInView={shown}
      // 0.2 rather than a larger amount: several of these blocks are taller
      // than the viewport, and a section that only fires once it is 40% visible
      // never fires at all on a laptop.
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
