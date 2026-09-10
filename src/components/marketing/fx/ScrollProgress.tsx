"use client";

/**
 * ScrollProgress — thin gradient bar at the top of the viewport that tracks
 * page scroll. Blueprint-styled to match the foundry aesthetic.
 */
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 220, damping: 40, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        /* The literals these replace — #4cb5ff, #00e5c7, #a78bfa — were the
           blueprint DARK values, so the bar stayed neon on every light-theme
           page that mounts it. The tokens carry both halves. */
        background:
          "linear-gradient(90deg, var(--bp-blue) 0%, var(--bp-cyan) 45%, var(--bp-purple) 100%)",
        boxShadow: "0 0 12px color-mix(in srgb, var(--bp-blue) 70%, transparent)",
      }}
    />
  );
}
