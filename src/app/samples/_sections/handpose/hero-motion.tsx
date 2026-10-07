"use client";

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import { CountUp } from "@/components/marketing/fx/CountUp";
import { useReducedMotion } from "@/lib/motion-pref";

/**
 * The hero's entrance, on the site's own motion: the timing and easing of
 * `FadeIn` (components/marketing/fx/KineticText) and the site's `CountUp`, not
 * new ones. Spans rather than `FadeIn`'s div, because these sit inside an `<h1>`
 * and a `<dd>`. Nothing moves under reduced motion or the pause switch.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
/**
 * Reduced motion arrives at the end state at once. `initial` stays the same in
 * both cases on purpose: the server renders it, and an `initial` that changed
 * with the preference would not match the HTML on a reader who has it set.
 */
const INSTANT = { duration: 0 } as const;

export function HeroRise({
  children,
  delay = 0,
  y = 18,
  as = "span",
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  /** `span` inside the heading, `div` around blocks. */
  as?: "span" | "div";
  className?: string;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  const M = as === "div" ? motion.div : motion.span;
  return (
    <M
      className={className ?? "block"}
      style={style}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? INSTANT : { duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

/** The footage settles in: a fade and a slight scale, once. */
export function HeroFootageIn({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className="h-full w-full"
      initial={{ opacity: 0, scale: 1.06 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduce ? INSTANT : { duration: 1.6, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A hero figure counting up. `CountUp` rounds to whole numbers, so a figure
 * with decimals counts in tenths and is printed back with one decimal.
 */
export function HeroCount({ value, decimals = 0, suffix = "" }: { value: number; decimals?: 0 | 1; suffix?: string }) {
  const k = decimals ? 10 : 1;
  return (
    <CountUp
      value={Math.round(value * k)}
      duration={1.6}
      suffix={suffix}
      format={(n) => (decimals ? (n / k).toFixed(1) : String(n))}
    />
  );
}
