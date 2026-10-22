"use client";

/**
 * The hero's figure, set like Figure 1 of a paper rather than a product reel:
 * one egocentric demonstration and what the pipeline already draws out of it.
 *
 *   (a) 3D hand pose + tracked object mask — the annotated clip itself
 *   (b) RGB frame        (c) monocular depth of the same frame
 *   (d) label tracks for task / action / object / timing — a SCHEMATIC of the
 *       structure the brief's "Structure" question asks about, marked as such;
 *       the blocks are not real label values. Its playhead follows (a).
 *
 * All media is real Tbrain pipeline output (textile line, ironing station).
 * The clip is a 1.7 MB re-encode of videos/textile-annotated/iron_01, mounted
 * only after the page has loaded; until then, and under reduced motion or the
 * header's pause switch, (a) is its still.
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion-pref";

const MEDIA = {
  video: { webm: "/videos/research/iron_01-annotated.webm", mp4: "/videos/research/iron_01-annotated.mp4" },
  still: "/images/research/iron_01-annotated.jpg",
  rgb: "/images/research/iron_01-rgb.jpg",
  depth: "/images/research/iron_01-depth.jpg",
};

/* Schematic segment layout per track, as [start, end] fractions of the clip. */
const TRACKS: { k: string; color: string; segs: [number, number][] }[] = [
  { k: "Task", color: "var(--bp-cyan)", segs: [[0.02, 0.98]] },
  { k: "Action", color: "var(--bp-purple)", segs: [[0.02, 0.22], [0.25, 0.47], [0.5, 0.71], [0.74, 0.98]] },
  { k: "Object", color: "var(--bp-amber)", segs: [[0.06, 0.4], [0.46, 0.93]] },
];

function Panel({ tag, label, children, className = "" }: { tag: string; label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ borderRadius: 10, background: "#0B0B14" }}>
      {children}
      <span
        className="bp-mono pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-md"
        style={{ fontSize: 9.5, padding: "3px 7px", color: "#fff", background: "rgba(6,6,14,0.62)", WebkitBackdropFilter: "blur(4px)", backdropFilter: "blur(4px)", letterSpacing: "0.1em" }}
      >
        <span style={{ color: "#5EEAD4" }}>({tag})</span>
        {label}
      </span>
    </div>
  );
}

export function ResearchFigure() {
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();
  const reduce = mounted && prefersReduced;
  const [loadVideo, setLoadVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Fetch the clip only once the page itself has finished loading.
  useEffect(() => {
    if (reduce) return;
    const go = () => setLoadVideo(true);
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, [reduce]);

  // Play only while on screen; drive the (d) playhead from the clip's clock.
  useEffect(() => {
    const v = videoRef.current;
    const wrap = wrapRef.current;
    if (!v || !wrap || !loadVideo || reduce) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.15 });
    io.observe(wrap);
    let raf = 0;
    const tick = () => {
      if (headRef.current && v.duration) headRef.current.style.left = `${(v.currentTime / v.duration) * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [loadVideo, reduce]);

  return (
    <div ref={wrapRef} className="relative">
      <figure className="bp-card relative" style={{ padding: 10, borderRadius: 20 }}>
        <div className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
          <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-cyan)" }}>FIG.01</span>
          <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>one egocentric demonstration · a–d</span>
        </div>

        <Panel tag="a" label="3D hands + object mask" className="aspect-video">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={MEDIA.still} alt="Egocentric frame with 3D hand pose and the tracked garment mask drawn over it" className="absolute inset-0 h-full w-full object-cover" />
          {loadVideo && !reduce && (
            <video ref={videoRef} poster={MEDIA.still} muted loop playsInline autoPlay preload="auto" aria-hidden className="absolute inset-0 h-full w-full object-cover">
              <source src={MEDIA.video.webm} type="video/webm" />
              <source src={MEDIA.video.mp4} type="video/mp4" />
            </video>
          )}
        </Panel>

        <div className="mt-2 grid grid-cols-2 gap-2">
          <Panel tag="b" label="RGB" className="aspect-[16/8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MEDIA.rgb} alt="The same frame, RGB" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </Panel>
          <Panel tag="c" label="Depth" className="aspect-[16/8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={MEDIA.depth} alt="The same frame as a monocular depth map" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          </Panel>
        </div>

        {/* (d) label tracks — schematic */}
        <div className="mt-2" style={{ borderRadius: 10, border: "1px solid var(--bp-line)", background: "var(--bp-surface-2)", padding: "10px 12px 10px" }} aria-hidden>
          <div className="mb-2 flex items-center justify-between">
            <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink)" }}>
              <span style={{ color: "var(--bp-cyan)" }}>(d)</span> labels
            </span>
            <span className="bp-mono" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>schematic</span>
          </div>
          <div className="relative">
            {TRACKS.map((t) => (
              <div key={t.k} className="flex items-center gap-2.5" style={{ height: 15 }}>
                <span className="bp-mono w-[52px] shrink-0" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>{t.k}</span>
                <span className="relative h-[7px] flex-1 rounded-full" style={{ background: "var(--bp-line)" }}>
                  {t.segs.map(([a, b], i) => (
                    <span key={i} className="absolute inset-y-0 rounded-full" style={{ left: `${a * 100}%`, width: `${(b - a) * 100}%`, background: t.color, opacity: 0.85 }} />
                  ))}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-2.5" style={{ height: 15 }}>
              <span className="bp-mono w-[52px] shrink-0" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>Timing</span>
              <span className="relative h-[7px] flex-1">
                {Array.from({ length: 16 }, (_, i) => (
                  <span key={i} className="absolute top-0 w-px" style={{ left: `${(i / 15) * 100}%`, height: i % 5 === 0 ? 7 : 4, background: "var(--bp-ink-faint)", opacity: 0.7 }} />
                ))}
              </span>
            </div>
            {/* Playhead over the track area (offset by the label column). */}
            <span className="pointer-events-none absolute inset-y-[-3px] right-0" style={{ left: 62 }}>
              <span ref={headRef} className="absolute inset-y-0 w-px" style={{ left: reduce ? "38%" : "0%", background: "var(--bp-red)", boxShadow: "0 0 0 1px color-mix(in srgb, var(--bp-red) 25%, transparent)" }}>
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45" style={{ background: "var(--bp-red)" }} />
              </span>
            </span>
          </div>
        </div>

        <figcaption className="bp-mono mt-2.5 px-1.5 pb-0.5" style={{ fontSize: 9.5, lineHeight: 1.6, color: "var(--bp-ink-faint)" }}>
          Labels for tasks, actions, objects and timing
        </figcaption>
      </figure>
    </div>
  );
}
