"use client";

/**
 * The hero's figure: real factory-floor captures, one clip at a time.
 *
 * One <video> plays and the next clip loads only when its turn comes, so the
 * hero pays for a single ~2 MB loop instead of a wall of them. The thumbnails
 * are the controls (and the progress bars); under reduced motion or the
 * header's pause switch nothing autoplays and the thumbnails swap stills.
 *
 * Clips come from ENVIRONMENTS — the same ops footage /data/physical-ai shows —
 * not from real-captures/, whose loops carry a burned-in pipeline debug banner.
 */
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";
import { ENVIRONMENTS } from "@/lib/landing/physical-ai";

const ORDER = ["may_san_pham", "gan_tag", "is_san_pham", "kiem_tra_qc"] as const;
const CLIPS = ORDER.map((k) => ENVIRONMENTS.items.find((i) => i.key === k)!).filter((c) => c && c.video);

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const s = Math.floor(t);
  return `00:${String(s).padStart(2, "0")}`;
}

export function CaptureReel() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timeRef = useRef<HTMLSpanElement>(null);
  const clip = CLIPS[idx];

  // Only spend bytes and decode while the figure is on screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    if (inView) v.play().catch(() => {});
    else v.pause();
  }, [inView, reduce, idx]);

  // Progress: one rAF loop drives the active thumbnail's bar and the timecode
  // by writing styles directly — no re-render per frame.
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const tick = () => {
      const v = videoRef.current;
      const bar = barRefs.current[idx];
      if (v && bar && v.duration) {
        bar.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`;
        if (timeRef.current) timeRef.current.textContent = `${fmt(v.currentTime)} / ${fmt(v.duration)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    barRefs.current.forEach((b, i) => {
      if (b && i !== idx) b.style.transform = `scaleX(${i < idx ? 1 : 0})`;
    });
    return () => cancelAnimationFrame(raf);
  }, [idx, reduce]);

  const next = () => setIdx((i) => (i + 1) % CLIPS.length);

  return (
    <div ref={wrapRef} className="relative">
      {/* A second sheet under the figure — the plate reads as one of a stack. */}
      <div
        aria-hidden
        className="bp-card absolute inset-0 hidden sm:block"
        style={{ transform: "rotate(2.2deg) translate(14px, 10px)", borderRadius: 20, opacity: 0.7 }}
      />
      <figure className="bp-card relative" style={{ padding: 10, borderRadius: 20 }}>
        <div className="relative overflow-hidden" style={{ aspectRatio: "4 / 3", borderRadius: 12, background: "#0B0B14" }}>
          <AnimatePresence initial={false}>
            <motion.div
              key={clip.key}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {reduce ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={clip.poster} alt={clip.name} className="h-full w-full object-cover" />
              ) : (
                <video
                  /* AnimatePresence keeps the outgoing clip mounted while it
                     fades, so its unmount must not null the incoming ref. */
                  ref={(el) => {
                    if (el) videoRef.current = el;
                  }}
                  src={clip.video}
                  poster={clip.poster}
                  muted
                  playsInline
                  preload="auto"
                  autoPlay={inView}
                  onEnded={(e) => {
                    if (e.currentTarget === videoRef.current) next();
                  }}
                  aria-label={clip.name}
                  className="h-full w-full object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,14,0.78) 0%, rgba(6,6,14,0.0) 42%), linear-gradient(to bottom, rgba(6,6,14,0.45) 0%, transparent 22%)" }} />

          {/* Viewfinder corners */}
          {(["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "left-3 bottom-3 border-l border-b", "right-3 bottom-3 border-r border-b"] as const).map((c) => (
            <span key={c} aria-hidden className={`pointer-events-none absolute h-4 w-4 ${c}`} style={{ borderColor: "rgba(255,255,255,0.55)" }} />
          ))}

          <div className="pointer-events-none absolute left-5 right-5 top-4 flex items-center justify-between">
            <span className="bp-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>FIG.01 · egocentric</span>
            <span className="bp-mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>
              {String(idx + 1).padStart(2, "0")} / {String(CLIPS.length).padStart(2, "0")}
            </span>
          </div>

          <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div aria-live="polite">
              <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, color: "#fff", letterSpacing: "-0.01em" }}>{clip.name}</div>
              <div className="bp-mono mt-1" style={{ fontSize: 9.5, color: "rgba(255,255,255,0.72)" }}>{clip.note}</div>
            </div>
            {!reduce && (
              <span ref={timeRef} aria-hidden className="bp-mono shrink-0" style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em" }}>
                00:00 / 00:00
              </span>
            )}
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-4 gap-2.5" role="group" aria-label="Capture clips">
          {CLIPS.map((c, i) => {
            const on = i === idx;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setIdx(i)}
                aria-pressed={on}
                aria-label={`Show ${c.name}`}
                className="group relative block overflow-hidden text-left"
                style={{
                  borderRadius: 8,
                  outline: on ? "2px solid var(--bp-cyan)" : "1px solid var(--bp-line)",
                  outlineOffset: on ? 1 : 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.poster}
                  alt=""
                  loading="lazy"
                  className="block w-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-105"
                  style={{ aspectRatio: "4 / 3", opacity: on ? 1 : 0.62 }}
                />
                {!reduce && (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: "rgba(255,255,255,0.25)" }}>
                    <span
                      ref={(el) => {
                        barRefs.current[i] = el;
                      }}
                      className="block h-full origin-left"
                      style={{ background: "var(--bp-cyan)", transform: "scaleX(0)" }}
                    />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 pb-0.5">
          <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>Real working environments</span>
          <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>Tbrain capture · factory floor</span>
        </figcaption>
      </figure>
    </div>
  );
}
