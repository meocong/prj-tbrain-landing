"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import type { EnvSlot } from "@/lib/landing/physical-ai";

export function EnvTile({ slot }: { slot: EnvSlot }) {
  const ref = useRef<HTMLVideoElement>(null);
  const shouldReduce = useReducedMotion();
  const [videoOk, setVideoOk] = useState<boolean | null>(null);
  const hasVideo = Boolean(slot.video);

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldReduce || !hasVideo) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldReduce, hasVideo]);

  const chipTone =
    slot.source === "OPS"
      ? { fg: "var(--bp-cyan)", bg: "rgba(0,229,199,0.16)", label: videoOk === false ? "PENDING · OPS" : "OPS · ON DRIVE" }
      : { fg: "var(--bp-purple)", bg: "rgba(150,100,255,0.14)", label: "SOURCED" };

  const posterSrc = videoOk === false || !hasVideo ? slot.stock : slot.poster;

  return (
    <article
      className="bp-card bp-card-hover group relative overflow-hidden transition-[transform,box-shadow] duration-300 will-change-transform hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-20px_rgba(0,229,199,0.45)]"
      style={{ padding: 0 }}
    >
      <div className="relative" style={{ aspectRatio: "16 / 10", overflow: "hidden" }}>
        {hasVideo && !shouldReduce && videoOk !== false ? (
          <video
            ref={ref}
            src={slot.video}
            poster={posterSrc}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={slot.name}
            onError={() => setVideoOk(false)}
            onLoadedData={() => setVideoOk(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
          />
        ) : (
          <Image
            src={posterSrc}
            alt={slot.name}
            fill
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
            unoptimized
          />
        )}

        <div
          className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-95"
          style={{ background: "linear-gradient(to top, rgba(5,5,12,0.88), rgba(5,5,12,0.1) 55%, transparent)" }}
        />

        <span
          className="bp-mono absolute left-2 top-2 rounded px-1.5 py-0.5"
          style={{
            fontSize: 9,
            letterSpacing: "0.06em",
            color: chipTone.fg,
            background: chipTone.bg,
          }}
        >
          {chipTone.label}
        </span>

        <span
          className="bp-mono absolute right-2 top-2 rounded px-1.5 py-0.5"
          style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", background: "rgba(0,0,0,0.35)" }}
        >
          {slot.durationHint}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-3.5 transition-transform duration-300 group-hover:-translate-y-0.5">
          <div style={{ fontWeight: 700, fontSize: 14.5, color: "#fff" }}>{slot.name}</div>
          <div className="bp-mono mt-0.5" style={{ fontSize: 9.5, color: "rgba(255,255,255,0.72)" }}>{slot.note}</div>
        </div>
      </div>
    </article>
  );
}
