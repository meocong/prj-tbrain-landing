"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic looping video background.
 *
 * - Lazy: only starts loading when the component is in the viewport.
 * - Respects prefers-reduced-motion: stays on poster frame.
 * - Gracefully falls back to the plasma/poster below if the video fails.
 * - Both WebM (preferred) and MP4 (Safari) sources supported.
 */
export function VideoBackground({
  src,
  srcMp4,
  poster,
  className,
  overlay = "radial-gradient(ellipse at center, transparent 10%, rgba(2,6,23,0.55) 60%, rgba(2,6,23,0.92) 100%)",
}: {
  src: string;
  srcMp4?: string;
  poster?: string;
  className?: string;
  overlay?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldPlay(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldPlay(true);
        else if (ref.current) ref.current.pause();
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (shouldPlay && ref.current) {
      ref.current.play().catch(() => {
        /* autoplay blocked — poster stays */
      });
    }
  }, [shouldPlay]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {!failed && (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.9 }}
        >
          <source src={src} type="video/webm" />
          {srcMp4 && <source src={srcMp4} type="video/mp4" />}
        </video>
      )}
      {overlay && (
        <div className="absolute inset-0" style={{ background: overlay }} />
      )}
    </div>
  );
}
