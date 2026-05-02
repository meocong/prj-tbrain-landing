"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Magnetic button that subtly pulls toward the cursor.
 * Inspired by Awwwards-tier sites.
 */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
  strength = 20,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });
  const translateX = useTransform(springX, (x) => x * strength);
  const translateY = useTransform(springY, (y) => y * strength);

  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };
  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const baseStyles =
    "relative inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-colors";
  const variants: Record<string, string> = {
    primary: "text-white",
    ghost: "text-white/90 hover:text-white",
    outline: "border backdrop-blur-sm",
  };

  return (
    <motion.span
      style={{ x: translateX, y: translateY, display: "inline-block" }}
    >
      <Link
        ref={ref}
        href={href}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        style={
          variant === "primary"
            ? {
                background: "linear-gradient(135deg, #6C3CF4 0%, #8B5CF6 60%, #10B981 160%)",
                boxShadow: "0 12px 40px -8px rgba(108,60,244,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
              }
            : variant === "outline"
              ? {
                  color: "var(--magnetic-outline-text)",
                  borderColor: "var(--magnetic-outline-border)",
                  background: "var(--magnetic-outline-bg)",
                }
              : undefined
        }
      >
        {variant === "primary" && (
          <span
            className="absolute inset-0 rounded-full opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
            style={{ background: "linear-gradient(135deg, #6C3CF4, #10B981)" }}
            aria-hidden
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </Link>
    </motion.span>
  );
}
