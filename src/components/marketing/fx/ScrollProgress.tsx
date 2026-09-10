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
        background: "linear-gradient(90deg, #4cb5ff 0%, #00e5c7 45%, #a78bfa 100%)",
        boxShadow: "0 0 12px #4cb5ff",
      }}
    />
  );
}
