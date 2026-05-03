"use client";

import { useEffect, useRef, useState } from "react";

type Source = { src: string; srcMp4?: string; poster?: string };

/**
 * Cinematic looping video background.
 *
 * Perf:
 * - preload="metadata" — browser only fetches the moov atom upfront (~tens of KB),
 *   not the full video. Body bytes start when play() fires.
 * - IntersectionObserver gates play(): off-screen → pause + no further buffering.
 * - Save-Data + reduced-motion users → poster only, no rotation.
 * - Carousel rotation: 22s/clip (was 14s) and prefetches next clip 3s before swap
 *   so the swap is seamless without burning data on clips the user never sees.
 */
export function VideoBackground({
  src,
  srcMp4,
  poster,
  sources,
  className,
  overlay = "radial-gradient(ellipse at center, rgba(2,6,23,0.5) 0%, rgba(2,6,23,0.78) 55%, rgba(2,6,23,0.96) 100%)",
}: {
  src?: string;
  srcMp4?: string;
  poster?: string;
  sources?: Array<Source>;
  className?: string;
  overlay?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const playlist: Source[] = sources?.length ? sources : src ? [{ src, srcMp4, poster }] : [];
  const active = playlist[activeIndex % Math.max(playlist.length, 1)];
  const primaryType = active?.src.endsWith(".mp4") ? "video/mp4" : "video/webm";

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (conn?.saveData) setSaveData(true);
  }, []);

  // Stable refs so re-renders from parent (scroll, hover, animation frames)
  // don't restart the rotation timer.
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;
  const playlistLen = playlist.length;

  // Carousel rotation — paused when reduced-motion / save-data / single clip.
  useEffect(() => {
    if (reducedMotion || saveData || playlistLen < 2) return;
    const ROTATE_MS = 12_000;
    const PREFETCH_LEAD_MS = 3_000;

    const prefetchTimer = window.setTimeout(() => {
      const list = playlistRef.current;
      const next = list[(activeIndex + 1) % list.length];
      if (!next) return;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "video";
      link.href = next.src;
      document.head.appendChild(link);
      window.setTimeout(() => link.remove(), PREFETCH_LEAD_MS + 500);
    }, ROTATE_MS - PREFETCH_LEAD_MS);

    const rotateTimer = window.setTimeout(() => {
      setFailed(false);
      setActiveIndex((current) => (current + 1) % playlistRef.current.length);
    }, ROTATE_MS);

    return () => {
      window.clearTimeout(prefetchTimer);
      window.clearTimeout(rotateTimer);
    };
  }, [activeIndex, playlistLen, reducedMotion, saveData]);

  useEffect(() => {
    if (reducedMotion) return;
    const host = hostRef.current;
    if (!host) return;

    const tryPlay = () => {
      const v = ref.current;
      if (!v) return;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };

    if (typeof IntersectionObserver === "undefined") {
      tryPlay();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const v = ref.current;
        if (!v) return;
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          v.pause();
        }
      },
      { threshold: 0 }
    );
    io.observe(host);

    const onVisible = () => {
      if (document.visibilityState === "visible" && ref.current) {
        const rect = host.getBoundingClientRect();
        const inView = rect.bottom > 0 && rect.top < window.innerHeight;
        if (inView) tryPlay();
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [activeIndex, reducedMotion]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {!failed && active && (
        <video
          key={active.src}
          ref={ref}
          muted
          loop
          playsInline
          preload="metadata"
          poster={active.poster}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.55 }}
        >
          <source src={active.src} type={primaryType} />
          {active.srcMp4 && <source src={active.srcMp4} type="video/mp4" />}
        </video>
      )}
      {overlay && (
        <div className="absolute inset-0" style={{ background: overlay }} />
      )}
    </div>
  );
}
