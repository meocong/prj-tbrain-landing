"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useMotionValue, useReducedMotion } from "framer-motion";

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  duration = 2,
  className,
  format,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const mv = useMotionValue(0);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (shouldReduce) {
      if (ref.current) ref.current.textContent = `${prefix}${format ? format(value) : value.toLocaleString()}${suffix}`;
      return;
    }
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) {
          const n = Math.round(latest);
          ref.current.textContent = `${prefix}${format ? format(n) : n.toLocaleString()}${suffix}`;
        }
      },
    });
    return () => controls.stop();
  }, [inView, value, duration, prefix, suffix, mv, shouldReduce, format]);

  return <span ref={ref} className={className}>0{suffix}</span>;
}
