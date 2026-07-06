"use client";

/**
 * Full-bleed 4-cell video showcase — real captures loop simultaneously.
 * Not mocap, not staged: actual textile-raw + real-capture footage.
 */
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

const CELLS = [
  { src: "/videos/textile-raw/iron_01.webm",     poster: "/images/textile-raw/iron_01.jpg",     tag: "IRON · TEXTILE",       cap: "iron_product · op mobile · 450 f" },
  { src: "/videos/textile-raw/sew_01.webm",      poster: "/images/textile-raw/sew_01.jpg",      tag: "SEW · TEXTILE",        cap: "sew_hem · op mobile · 450 f" },
  { src: "/videos/textile-raw/arrange_01.webm",  poster: "/images/textile-raw/arrange_01.jpg",  tag: "ARRANGE · TEXTILE",    cap: "arrange_fabric · op mobile · 450 f" },
  { src: "/videos/real-captures/pick_up_the_cup.webm", poster: "/images/real-captures/pick_up_the_cup-loop.jpg", tag: "PICK · TABLETOP",   cap: "pick_up_the_cup · op unknown · 273 f · 15/15 PASS" },
];

function LazyLoopVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full"
      style={{ objectFit: "cover" }}
    />
  );
}

export function RealVideoStrip() {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "#050a12" }}>
      <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 1, background: "#4cb5ff" }}>
        {CELLS.map((c, i) => (
          <motion.div
            key={c.src}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="relative aspect-[4/3] overflow-hidden"
            style={{ background: "#0b1220" }}
          >
            <LazyLoopVideo src={c.src} poster={c.poster} />
            {/* corner cross */}
            <svg className="absolute left-2 top-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M0 7 L14 7 M7 0 L7 14" stroke="#4cb5ff" strokeWidth="1" opacity="0.9" />
            </svg>
            <svg className="absolute right-2 top-2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M0 7 L14 7 M7 0 L7 14" stroke="#4cb5ff" strokeWidth="1" opacity="0.9" />
            </svg>
            {/* fig chip */}
            <div className="absolute left-3 top-4" style={{
              fontFamily: "var(--font-mono, monospace)", fontSize: 9.5,
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(11,18,32,0.85)", color: "#4cb5ff",
              border: "1px solid rgba(76,181,255,0.3)",
              letterSpacing: "0.08em",
            }}>{c.tag}</div>
            {/* REC pulse */}
            <div className="absolute right-3 top-4 flex items-center gap-1.5" style={{
              fontFamily: "var(--font-mono, monospace)", fontSize: 9,
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(11,18,32,0.85)", color: "#ff5f57",
              border: "1px solid rgba(255,95,87,0.3)",
              letterSpacing: "0.14em", fontWeight: 700,
            }}>
              <motion.span
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: 6, background: "#ff5f57", boxShadow: "0 0 6px #ff5f57" }} />
              REAL
            </div>
            {/* bottom caption */}
            <div className="absolute inset-x-0 bottom-0" style={{
              background: "linear-gradient(0deg, rgba(5,10,18,0.92) 0%, transparent 100%)",
              padding: "18px 14px 12px",
            }}>
              <div className="bp-mono" style={{ fontSize: 10.5, color: "#c8d3f0", letterSpacing: "0.04em" }}>{c.cap}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-5" style={{ padding: "24px 20px" }}>
        <div className="bp-mono" style={{ fontSize: 11, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Real captures · zero staging · every clip auto-labeled + QC'd on this landing
        </div>
        <div className="flex items-center gap-3 bp-mono" style={{ fontSize: 10.5, color: "#8fa0c8" }}>
          <span style={{ color: "#4cb5ff" }}>● 4 clips live-looping</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>ego + tabletop</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>faces off-frame · consent signed</span>
        </div>
      </div>
    </section>
  );
}
