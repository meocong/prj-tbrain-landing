"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RERUN_EMBED } from "@/lib/landing/physical-ai";
import { Sheet, SheetHeading } from "@/components/marketing/blueprint/kit";
import { motion, useReducedMotion } from "framer-motion";

export function RerunEmbed({ variant = "full" }: { variant?: "full" | "teaser" } = {}) {
  const [origin, setOrigin] = useState<string>("");
  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const rerunHref = useMemo(() => {
    if (!origin) return "";
    return `${RERUN_EMBED.externalHrefPrefix}${encodeURIComponent(origin + RERUN_EMBED.rrd)}`;
  }, [origin]);

  if (variant === "teaser") {
    return (
      <Sheet id="rerun-embed" fig={RERUN_EMBED.fig} axis={false}>
        <SheetHeading title={RERUN_EMBED.title} lead="Open any capture as a scrubbable multi-track scene. Full viewer lives on the auto-label deep dive." />
        <div className="mt-6 bp-card relative overflow-hidden" style={{ borderRadius: 14, background: "#050a12", height: 240 }}>
          <video
            src={RERUN_EMBED.fallbackVideo}
            poster="/images/real-captures/pick_up_the_cup-loop.jpg"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ opacity: 0.55 }}
          />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,10,18,0.25), rgba(5,10,18,0.85))" }} />
          {rerunHref && (
            <a
              href={rerunHref}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 bp-mono"
              style={{ zIndex: 3, fontSize: 12, padding: "10px 14px", borderRadius: 8, background: "var(--bp-cyan)", color: "#0b1220", fontWeight: 700, textDecoration: "none", boxShadow: "0 8px 22px -12px var(--bp-cyan)" }}
            >
              ↗ Open sample scene in Rerun
            </a>
          )}
          <div className="absolute bottom-4 left-4 bp-mono" style={{ fontSize: 10.5, color: "#8fa0c8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            9 tracks · scrubbable · v0.24
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet id="rerun-embed" fig={RERUN_EMBED.fig} axis={false}>
      <SheetHeading title={RERUN_EMBED.title} lead={RERUN_EMBED.lead} />

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Video preview panel */}
        <div className="bp-card" style={{ padding: 0, borderRadius: 14, overflow: "hidden", background: "#050a12", position: "relative" }}>
          {/* window chrome */}
          <div className="flex items-center gap-2 bp-mono" style={{ padding: "10px 14px", fontSize: 10, color: "var(--bp-ink-faint)", borderBottom: "1px solid var(--bp-line)" }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ff5f57" }} />
            <span style={{ width: 8, height: 8, borderRadius: 8, background: "#ffbd2e" }} />
            <span style={{ width: 8, height: 8, borderRadius: 8, background: "#28c840" }} />
            <span style={{ marginLeft: 10, color: "var(--bp-cyan)" }}>Rerun · aloha-4cam.rrd</span>
            <span style={{ marginLeft: "auto" }}>9 tracks · 273 frames · with manifest</span>
          </div>

          <RerunLoop src={RERUN_EMBED.fallbackVideo} />

          <div
            aria-hidden
            style={{
              position: "absolute", inset: 0, top: 40,
              background:
                "linear-gradient(180deg, rgba(5,10,18,0) 55%, rgba(5,10,18,0.85) 100%), " +
                "repeating-linear-gradient(180deg, rgba(0,229,199,0.03) 0 2px, transparent 2px 4px)",
              pointerEvents: "none",
            }}
          />

          {rerunHref ? (
            <a
              href={rerunHref}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-4 right-4 bp-mono"
              style={{
                zIndex: 3,
                fontSize: 12,
                padding: "10px 14px",
                borderRadius: 8,
                background: "var(--bp-cyan)",
                color: "#0b1220",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 8px 22px -12px var(--bp-cyan)",
              }}
            >
              ↗ {RERUN_EMBED.externalLabel}
            </a>
          ) : null}
        </div>

        {/* Track list */}
        <div className="bp-card" style={{ padding: 0, borderRadius: 12, overflow: "hidden" }}>
          <div
            className="bp-mono"
            style={{ padding: "10px 16px", fontSize: 11, color: "var(--bp-ink-faint)", letterSpacing: "0.06em", borderBottom: "1px solid var(--bp-line)" }}
          >
            SCENE TRACKS
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {RERUN_EMBED.tracks.map((t, i) => (
              <li
                key={t}
                className="bp-mono flex items-center gap-3"
                style={{
                  padding: "12px 16px",
                  borderTop: i === 0 ? "none" : "1px solid var(--bp-line)",
                  fontSize: 12,
                  color: "var(--bp-ink-dim)",
                }}
              >
                <span className="bp-status bp-status-mov" style={{ fontSize: 9 }}>OK</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="bp-mono" style={{ padding: "12px 16px", fontSize: 10, color: "var(--bp-ink-faint)", borderTop: "1px solid var(--bp-line)" }}>
            .rrd is a live scene, not a video. Open it in Rerun to scrub every track independently.
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function RerunLoop({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || shouldReduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) el.play().catch(() => {});
          else el.pause();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shouldReduce]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6 }}
      className="relative w-full"
      style={{ aspectRatio: "16 / 9", background: "#050a12" }}
    >
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </motion.div>
  );
}
