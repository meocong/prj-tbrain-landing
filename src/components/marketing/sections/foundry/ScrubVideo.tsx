"use client";

/**
 * ScrubVideo — a cinematic background video that the viewer "scrubs" by moving
 * the mouse horizontally (desktop), giving a premium interactive feel. On
 * mobile it simply autoplays/loops; on reduced-motion it stays on the poster.
 *
 * Generic technique (mousemove → video.currentTime); asset-agnostic — point it
 * at the project's bundled robotics footage now, or a custom Higgsfield render
 * later by swapping the webm/mp4/poster props.
 */
import { useEffect, useRef } from "react";

export function ScrubVideo({
  webm, mp4, poster, className = "", sensitivity = 0.8,
}: { webm: string; mp4: string; poster: string; className?: string; sensitivity?: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // poster only

    const desktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!desktop) {
      v.muted = true; v.loop = true; v.autoplay = true;
      v.play().catch(() => {});
      return;
    }

    // desktop: scrub the timeline with horizontal mouse movement
    v.pause();
    let prevX: number | null = null;
    let target = 0;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const d = v.duration;
      if (!d || Number.isNaN(d)) return;
      if (prevX == null) { prevX = e.clientX; return; }
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      target += (dx / window.innerWidth) * sensitivity * d;
      target = Math.max(0, Math.min(d - 0.05, target));
    };
    const tick = () => {
      const d = v.duration;
      if (d && !Number.isNaN(d)) {
        const next = v.currentTime + (target - v.currentTime) * 0.12;
        if (Math.abs(next - v.currentTime) > 0.01) v.currentTime = next;
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [sensitivity]);

  return (
    <video ref={ref} muted playsInline preload="auto" poster={poster} className={className} style={{ width: "100%", height: "100%", objectFit: "cover" }}>
      <source src={webm} type="video/webm" />
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
