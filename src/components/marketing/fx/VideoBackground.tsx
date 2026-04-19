"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic looping video background.
 *
 * - Lazy: only starts playing when the component is in the viewport.
 * - Auto-resumes on scroll-back (previously stopped because the play()
 *   effect only fired once; we now drive play/pause directly from the
 *   IntersectionObserver callback).
 * - Respects prefers-reduced-motion: stays on poster frame.
 * - Graceful fallback to poster if the video fails to load.
 */
export function VideoBackground({
  src,
  srcMp4,
  poster,
  className,
  overlay = "radial-gradient(ellipse at center, rgba(2,6,23,0.5) 0%, rgba(2,6,23,0.78) 55%, rgba(2,6,23,0.96) 100%)",
}: {
  src: string;
  srcMp4?: string;
  poster?: string;
  className?: string;
  overlay?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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

    // Also resume on page-visibility change (coming back to the tab)
    const onVisible = () => {
      if (document.visibilityState === "visible" && ref.current && !ref.current.paused === false) {
        // If it was left paused by the observer while off-screen, no-op.
        // If it was paused because the tab was hidden, re-trigger play when back.
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
  }, [reducedMotion]);

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
          preload="auto"
          poster={poster}
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: 0.55 }}
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
