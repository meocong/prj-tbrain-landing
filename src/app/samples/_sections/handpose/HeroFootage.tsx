"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/motion-pref";

/**
 * The hero's footage: sample 13's camera video with the hand pose drawn over it,
 * faces blurred, looping behind the headline. Decorative — the caption beside it
 * says what it is — so it is hidden from assistive tech and has no controls.
 *
 * Muted and without controls, so the header's "Pause animations" switch stills it
 * with the site's other ambient video; under the OS's reduced-motion setting it
 * stays on its poster.
 */
export function HeroFootage({ src, poster, position }: { src: string; poster: string; position?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduce) v.pause();
    else v.play().catch(() => {});
  }, [reduce]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
      className="h-full w-full object-cover"
      style={{ objectPosition: position }}
    />
  );
}
