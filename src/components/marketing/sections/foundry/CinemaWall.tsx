"use client";

/**
 * CinemaWall — full-viewport 6-cell asymmetric video wall with a big overlay
 * headline, live-look data ticker, and scroll-linked focus zoom. Every clip
 * is a real capture. Claru-style density.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { CountUp } from "@/components/marketing/fx/CountUp";

const CELLS = [
  { src: "/videos/textile-raw/iron_02.webm",     poster: "/images/textile-raw/iron_02.jpg",     tag: "IRON · TEXTILE",     span: "hero" },
  { src: "/videos/textile-raw/sew_02.webm",      poster: "/images/textile-raw/sew_02.jpg",      tag: "SEW · TEXTILE",       span: "aux" },
  { src: "/videos/textile-raw/arrange_02.webm",  poster: "/images/textile-raw/arrange_02.jpg",  tag: "ARRANGE · TEXTILE",   span: "aux" },
  { src: "/videos/textile-raw/package_01.webm",  poster: "/images/textile-raw/package_01.jpg",  tag: "PACKAGE · TEXTILE",   span: "aux" },
  { src: "/videos/real-captures/pick_up_the_cup.webm", poster: "/images/real-captures/pick_up_the_cup-loop.jpg", tag: "PICK · TABLETOP", span: "aux" },
  { src: "/videos/modalities/exo-mocap.webm",    poster: "/images/modalities/exo-mocap.jpg",    tag: "EXO · MOCAP",         span: "aux" },
];

const TICKER = [
  "17 tasks captured",
  "60+ episodes in queue",
  "15 hard-rules PASS on live sample",
  "schema_v3 · git 1b0cce1",
  "≤ 48h delivery · LeRobot v2",
  "8-model auto-label · zero staging",
];

function LazyLoop({ src, poster, index }: { src: string; poster: string; index: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) return;
    const start = () => el.play().catch(() => {});
    const stop = () => el.pause();
    const io = new IntersectionObserver(entries => entries.forEach(e => (e.isIntersecting ? start() : stop())), { threshold: 0.15 });
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
      preload={index < 2 ? "auto" : "metadata"}
      className="absolute inset-0 h-full w-full"
      style={{ objectFit: "cover" }}
    />
  );
}

export function CinemaWall() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setTickerIdx((i) => (i + 1) % TICKER.length), 2600);
    return () => clearInterval(t);
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.02, 1, 1.04]);
  const overlayY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  const hero = CELLS[0];
  const auxCells = CELLS.slice(1);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ background: "#000", color: "#fff" }}>
      <div className="relative grid gap-[1px]" style={{ gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto", background: "#000" }}>
        {/* Hero cell — huge */}
        <motion.div
          className="relative row-span-3 aspect-[4/3] overflow-hidden lg:aspect-auto"
          style={{ background: "#0b1220", minHeight: "min(80svh, 720px)" }}
        >
          <motion.div style={{ scale: heroScale }} className="absolute inset-0">
            <LazyLoop src={hero.src} poster={hero.poster} index={0} />
          </motion.div>
          {/* dark left → right for text */}
          <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 45%, transparent 78%)" }} />

          {/* Corner cross chrome */}
          <svg className="absolute left-4 top-4" width="20" height="20" viewBox="0 0 20 20" aria-hidden>
            <path d="M0 10 L20 10 M10 0 L10 20" stroke="#4cb5ff" strokeWidth="1.2" opacity="0.9" />
          </svg>
          <svg className="absolute right-4 top-4" width="20" height="20" viewBox="0 0 20 20" aria-hidden>
            <path d="M0 10 L20 10 M10 0 L10 20" stroke="#4cb5ff" strokeWidth="1.2" opacity="0.9" />
          </svg>
          <svg className="absolute left-4 bottom-4" width="20" height="20" viewBox="0 0 20 20" aria-hidden>
            <path d="M0 10 L20 10 M10 0 L10 20" stroke="#4cb5ff" strokeWidth="1.2" opacity="0.9" />
          </svg>
          <svg className="absolute right-4 bottom-4" width="20" height="20" viewBox="0 0 20 20" aria-hidden>
            <path d="M0 10 L20 10 M10 0 L10 20" stroke="#4cb5ff" strokeWidth="1.2" opacity="0.9" />
          </svg>

          {/* Top chip */}
          <div className="absolute left-8 top-8 flex items-center gap-2 rounded-full border border-white/12 bg-black/40 px-3 py-1.5 backdrop-blur-md" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, letterSpacing: "0.14em" }}>
            <motion.span animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.1, repeat: Infinity }} style={{ width: 7, height: 7, borderRadius: 8, background: "#ff5f57", boxShadow: "0 0 8px #ff5f57" }} />
            <span style={{ color: "#fff", fontWeight: 700 }}>RECORDING · REAL PRODUCTION</span>
          </div>

          {/* Big overlay headline */}
          <motion.div
            style={{ y: overlayY }}
            className="absolute inset-x-0 bottom-0 flex flex-col gap-6 px-8 pb-12 pt-24 lg:px-14 lg:pb-16"
          >
            <div className="bp-mono" style={{ fontSize: 11, color: "#4cb5ff", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              FIG.02 · CAPTURE WALL · 6 CONCURRENT SESSIONS
            </div>
            <h2 className="font-semibold text-white" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(2.6rem, 6.8vw, 5.6rem)", lineHeight: 0.98, letterSpacing: "-0.028em" }}>
              Real production.<br />
              <span style={{ background: "linear-gradient(100deg,#22e3c8,#8b6cf6)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>Zero staging.</span>
            </h2>
            <p className="max-w-lg text-white/70" style={{ fontSize: "clamp(14px,1.3vw,17px)", lineHeight: 1.55 }}>
              Every clip on this wall is a real capture from a real factory floor — auto-labeled, QC&apos;d against 15 machine-checkable rules, and diffable against its Rerun scene.
            </p>
            {/* Live counter */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: "#22e3c8", lineHeight: 1 }}>
                  <CountUp value={17} duration={1.5} />
                </div>
                <div className="bp-mono mt-1" style={{ fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase" }}>tasks live</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: "#4cb5ff", lineHeight: 1 }}>
                  <CountUp value={273} duration={1.5} />
                </div>
                <div className="bp-mono mt-1" style={{ fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase" }}>frames · sample</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(28px,3vw,40px)", fontWeight: 700, color: "#a78bfa", lineHeight: 1 }}>
                  15/15
                </div>
                <div className="bp-mono mt-1" style={{ fontSize: 10, color: "#8fa0c8", letterSpacing: "0.08em", textTransform: "uppercase" }}>hard rules PASS</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Aux cells 3x2 */}
        {auxCells.map((c, i) => (
          <motion.div
            key={c.src}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative aspect-[16/10] overflow-hidden"
            style={{ background: "#0b1220" }}
          >
            <LazyLoop src={c.src} poster={c.poster} index={i + 1} />
            {/* darken bottom */}
            <div aria-hidden className="absolute inset-x-0 bottom-0" style={{ height: "50%", background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 100%)" }} />
            {/* tag */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 backdrop-blur-md" style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 9, letterSpacing: "0.12em", color: "#4cb5ff", fontWeight: 700 }}>
              <span style={{ width: 5, height: 5, borderRadius: 6, background: "#4cb5ff", boxShadow: "0 0 6px #4cb5ff" }} />
              {c.tag}
            </div>
            {/* frame counter */}
            <div className="absolute right-3 top-3 bp-mono" style={{ fontSize: 9, color: "#8fa0c8", background: "rgba(0,0,0,0.55)", padding: "3px 7px", borderRadius: 4, letterSpacing: "0.08em" }}>
              LIVE
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom rolling ticker */}
      <div className="relative border-t border-white/10 bg-black" style={{ padding: "16px 0" }}>
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-3">
            <span className="bp-mono" style={{ fontSize: 10.5, color: "#8fa0c8", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              status
            </span>
            <motion.span
              key={tickerIdx}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bp-mono"
              style={{ fontSize: 12.5, color: "#22e3c8" }}
            >
              ● {TICKER[tickerIdx]}
            </motion.span>
          </div>
          <div className="bp-mono flex items-center gap-3" style={{ fontSize: 10.5, color: "#8fa0c8", letterSpacing: "0.06em" }}>
            <span>6 clips live</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>4 ego + 1 tabletop + 1 exo</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>consent signed · faces off-frame</span>
          </div>
        </div>
      </div>
    </section>
  );
}
