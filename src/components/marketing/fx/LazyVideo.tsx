"use client";

/**
 * LazyVideo — defers the actual video byte-fetch until the element is near the
 * viewport. Shows the poster image first; only when the wrapper intersects (with
 * a rootMargin lead) does it mount a <video> with `src`, so heavy autoplay loops
 * far below the fold never load on initial page paint.
 *
 * Reduced-motion: never mounts the video, keeps the static poster.
 */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";

export function LazyVideo({
  src,
  poster,
  alt = "",
  className = "",
  style,
  aspectRatio,
  rootMargin = "300px",
}: {
  src: string;
  poster: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  aspectRatio?: string;
  rootMargin?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mount, setMount] = useState(false);
  const reduce = useReducedMotion();

  // Mount the <video> once the wrapper nears the viewport.
  useEffect(() => {
    if (reduce) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setMount(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce, rootMargin]);

  // Pause/play the mounted video by visibility to save decode cost off-screen.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !mount) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [mount]);

  // Poster sits in normal flow so it establishes the box height (no fixed ratio
  // needed); the video overlays it once mounted. Pass `aspectRatio` to override.
  return (
    <div ref={wrapRef} className={`relative ${className}`} style={{ aspectRatio, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={poster}
        alt={alt}
        loading="lazy"
        className={aspectRatio ? "absolute inset-0 h-full w-full object-cover" : "block w-full h-auto"}
        style={{ opacity: mount ? 0 : 1, transition: "opacity 0.4s ease" }}
      />
      {mount && (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          aria-label={alt || undefined}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
