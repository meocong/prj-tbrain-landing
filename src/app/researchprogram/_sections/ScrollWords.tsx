"use client";

/**
 * A statement that inks itself in as it scrolls through the viewport, word by
 * word. Screen readers get the sentence once, as plain text; the animated
 * words are aria-hidden. Under reduced motion / pause it is static text.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";

export interface WordsPart {
  text: string;
  color: string;
}

export function ScrollWords({ parts, className, style }: { parts: WordsPart[]; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  /* Server HTML and the first client render are the static sentence, so it
     reads in full with no JS and in print; the scroll inking takes over after
     mount (the block sits below the hero, so the switch is never on screen). */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = parts.flatMap((p) => p.text.split(" ").map((w) => ({ w, color: p.color })));
  const full = parts.map((p) => p.text).join(" ");

  if (reduce || !mounted) {
    return (
      <p ref={ref} className={className} style={style}>
        {parts.map((p, i) => (
          <span key={i} style={{ color: p.color }}>
            {p.text}
            {i < parts.length - 1 ? " " : ""}
          </span>
        ))}
      </p>
    );
  }

  return (
    <p ref={ref} className={`rs-words ${className ?? ""}`} style={style}>
      <span className="sr-only">{full}</span>
      <span aria-hidden>
        {words.map((x, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} color={x.color}>
            {x.w}
            {i < words.length - 1 ? " " : ""}
          </Word>
        ))}
      </span>
    </p>
  );
}

function Word({ children, progress, range, color }: { children: React.ReactNode; progress: MotionValue<number>; range: [number, number]; color: string }) {
  // Floor of 0.42 keeps un-inked words above 3:1 against the page.
  const opacity = useTransform(progress, range, [0.42, 1]);
  return (
    <motion.span style={{ opacity, color }}>
      {children}
    </motion.span>
  );
}
