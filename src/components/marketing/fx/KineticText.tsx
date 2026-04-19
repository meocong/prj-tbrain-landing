"use client";

import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode } from "react";

type HeadlineTag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

/** Splits children into words + letters and staggers them in. */
export function KineticHeadline({
  words,
  as: Tag = "h1",
  className,
  delay = 0,
}: {
  words: Array<string | { text: string; gradient?: boolean; glow?: boolean }>;
  as?: HeadlineTag;
  className?: string;
  delay?: number;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <Tag className={className}>
      {words.map((w, wi) => {
        const { text, gradient, glow } = typeof w === "string" ? { text: w, gradient: false, glow: false } : w;
        return (
          <span
            key={wi}
            className="inline-block"
            style={{
              marginRight: "0.3em",
              background: gradient ? "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 40%, #10B981 100%)" : undefined,
              WebkitBackgroundClip: gradient ? "text" : undefined,
              WebkitTextFillColor: gradient ? "transparent" : undefined,
              backgroundClip: gradient ? "text" : undefined,
              textShadow: glow ? "0 0 42px rgba(108,60,244,0.55)" : undefined,
            }}
          >
            {Array.from(text).map((ch, ci) => (
              <motion.span
                key={ci}
                className="inline-block"
                initial={shouldReduce ? {} : { y: "110%", opacity: 0, rotateX: -90 }}
                animate={shouldReduce ? {} : { y: 0, opacity: 1, rotateX: 0 }}
                transition={{
                  duration: 0.6,
                  delay: delay + wi * 0.08 + ci * 0.02,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{ transformOrigin: "bottom center" }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </span>
        );
      })}
    </Tag>
  );
}

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={shouldReduce ? {} : { opacity: 0, y }}
      animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
