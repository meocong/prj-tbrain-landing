"use client";

import { useMemo, useRef } from "react";
import { motion, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { RevealOnScroll } from "@/components/marketing/fx/RevealOnScroll";
import { C, OVER_MEDIA } from "./tokens";
import wd from "@/lib/samples/telemetry-watchdogs.json";
import coop from "@/lib/samples/telemetry-gta-coop.json";

/**
 * Both datasets are decimated from the telemetry that ships with the sample:
 *  - wd: 6,967 frames of Watch Dogs 2 input state, bucketed to 360 columns
 *  - coop: per-observation agent separation from a two-player GTA V session
 * Nothing here is illustrative. The lanes are the recorded key state.
 */

const W = 1000;
const LANE_H = 16;
const LANE_GAP = 5;
const ACCENT = C.accent;

/** session.json stores the title as a capture id, not as the shipping name. */
const GAME_TITLES: Record<string, string> = {
  WatchDogs2: "Watch Dogs 2",
};
const gameName = (raw: string) => GAME_TITLES[raw] ?? raw;

interface Run {
  x: number;
  w: number;
}

/** Merge consecutive active buckets so each lane renders a handful of rects, not 360. */
function runsFor(laneIndex: number): Run[] {
  const out: Run[] = [];
  const step = W / wd.buckets.length;
  let start: number | null = null;
  wd.buckets.forEach((b, i) => {
    const on = b.a[laneIndex] === 1;
    if (on && start === null) start = i;
    if (!on && start !== null) {
      out.push({ x: start * step, w: (i - start) * step });
      start = null;
    }
  });
  if (start !== null) out.push({ x: start * step, w: (wd.buckets.length - start) * step });
  return out;
}

function mousePath(height: number): string {
  const step = W / wd.buckets.length;
  return wd.buckets
    .map((b, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(height - b.m * height).toFixed(1)}`)
    .join(" ");
}

function coopPath(width: number, height: number): string {
  const ds = coop.series.map((p) => p.d);
  const max = Math.max(...ds);
  const span = coop.series[coop.series.length - 1].t || 1;
  return coop.series
    .map((p, i) => {
      const x = (p.t / span) * width;
      const y = height - (p.d / max) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function LaneChart() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const progress = useMotionValue(-1);

  const lanes = useMemo(() => wd.lanes.map((name, i) => ({ name, runs: runsFor(i) })), []);
  const mouseH = 34;
  const mouse = useMemo(() => mousePath(mouseH), []);

  const chartH = lanes.length * (LANE_H + LANE_GAP) - LANE_GAP;
  const playheadLeft = useTransform(progress, (p) => `${Math.max(p, 0) * 100}%`);
  const playheadOpacity = useTransform(progress, (p) => (p < 0 ? 0 : 1));
  const readout = useTransform(progress, (p) => {
    if (p < 0) return "scrub the lanes";
    const t = p * wd.durationSec;
    const frame = Math.round(p * wd.frames);
    return `${t.toFixed(1)}s / frame ${frame.toLocaleString("en-US")}`;
  });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    progress.set(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <p className="text-xs uppercase tracking-wider" style={{ color: C.textDim }}>
          Input state per frame
        </p>
        <motion.p className="font-mono text-xs" style={{ color: ACCENT }}>
          {readout}
        </motion.p>
      </div>

      <div
        ref={wrapRef}
        className="relative rounded-xl p-4 md:p-5"
        style={{ border: `1px solid ${C.hairline}` }}
        onPointerMove={reduce ? undefined : onMove}
        onPointerLeave={() => progress.set(-1)}
      >
        <div className="flex gap-3">
          <ul className="w-24 shrink-0 space-y-[5px] sm:w-28">
            {lanes.map((l) => (
              <li
                key={l.name}
                className="flex items-center justify-end truncate font-mono text-[10px] sm:text-[11px]"
                style={{ height: LANE_H, color: C.textMid }}
              >
                {l.name}
              </li>
            ))}
          </ul>

          <div className="relative min-w-0 flex-1">
            <svg
              viewBox={`0 0 ${W} ${chartH}`}
              preserveAspectRatio="none"
              className="w-full"
              style={{ height: chartH }}
              role="img"
              aria-label="Key and action lanes recorded across the session"
            >
              {lanes.map((l, i) => {
                const y = i * (LANE_H + LANE_GAP);
                return (
                  <g key={l.name}>
                    <rect x={0} y={y} width={W} height={LANE_H} rx={3} fill={C.wash} />
                    {l.runs.map((r, j) => (
                      <rect
                        key={j}
                        x={r.x}
                        y={y}
                        width={Math.max(r.w, 1.5)}
                        height={LANE_H}
                        rx={3}
                        fill={ACCENT}
                        opacity={0.28 + 0.62 * (1 - i / lanes.length)}
                      />
                    ))}
                  </g>
                );
              })}
            </svg>

            <motion.div
              className="pointer-events-none absolute inset-y-0 w-px"
              style={{
                left: playheadLeft,
                opacity: playheadOpacity,
                background: C.playhead,
              }}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <div
            className="flex w-24 shrink-0 items-center justify-end font-mono text-[10px] sm:w-28 sm:text-[11px]"
            style={{ color: C.textMid }}
          >
            MouseDelta
          </div>
          <svg
            viewBox={`0 0 ${W} ${mouseH}`}
            preserveAspectRatio="none"
            className="min-w-0 flex-1"
            style={{ height: mouseH }}
            role="img"
            aria-label="Mouse movement magnitude across the session"
          >
            <path d={mouse} fill="none" stroke={C.positive} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { k: "Session", v: wd.sessionId },
          { k: "Frames", v: wd.frames.toLocaleString("en-US") },
          { k: "Capture", v: `${wd.width} x ${wd.height}` },
          { k: "Telemetry columns", v: "27" },
        ].map((s) => (
          <div key={s.k}>
            <dt className="text-[10px] uppercase tracking-wider" style={{ color: C.textDim }}>
              {s.k}
            </dt>
            <dd className="mt-0.5 font-mono text-sm" style={{ color: C.value }}>
              {s.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * The two clips are cut from the same shared-clock window. Each machine reports its
 * own clock_offset_ms, so the host is seeked 926.5 ms earlier than the member to put
 * both viewports on the same instant of the session.
 */
const COOP_VIEWS = [
  { key: "host", label: "Agent 12", role: "host", src: "/samples/clips/gtav-coop-host.mp4", poster: "/samples/posters/gtav-coop-host.jpg" },
  { key: "member", label: "Agent 13", role: "member", src: "/samples/clips/gtav-coop-member.mp4", poster: "/samples/posters/gtav-coop-member.jpg" },
] as const;

function CoopViews() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);

  const play = () => {
    for (const v of refs.current) {
      if (v) v.play().catch(() => undefined);
    }
  };
  const stop = () => {
    for (const v of refs.current) {
      if (!v) continue;
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <div
      className="grid gap-3 sm:grid-cols-2"
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
      tabIndex={0}
    >
      {COOP_VIEWS.map((view, i) => (
        <figure key={view.key} className="relative overflow-hidden">
          <video
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="aspect-video w-full object-cover"
            src={view.src}
            poster={view.poster}
            muted
            loop
            playsInline
            preload="none"
            aria-label={`GTA V coop session, ${view.role} viewport`}
          />
          <figcaption
            className="absolute left-2 top-2 rounded-full px-2.5 py-0.5 font-mono text-[10px] backdrop-blur-sm"
            style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
          >
            {view.label} / {view.role}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function CoopPanel() {
  const w = 320;
  const h = 76;
  const path = useMemo(() => coopPath(w, h), []);
  const inFov = coop.series.filter((p) => p.f === 1).length;
  const fovPct = Math.round((inFov / coop.series.length) * 100);

  return (
    <div
      className="grid min-w-0 gap-8 pt-10 lg:grid-cols-12 lg:gap-10"
      style={{ borderTop: `1px solid ${C.hairline}` }}
    >
      <div className="min-w-0 lg:col-span-7">
        <CoopViews />
      </div>

      <div className="min-w-0 lg:col-span-5">
        <h3 className="text-lg font-medium" style={{ fontFamily: "var(--font-heading)" }}>
          Two players, one clock
        </h3>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: C.textMid }}>
          Both viewports are the same instant of one {coop.game} session, aligned on the shared
          clock. The member is watching the host drive ahead.
        </p>

        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="mt-5 w-full"
          style={{ height: h }}
          role="img"
          aria-label="Distance between the two agents over the session"
        >
          <path d={path} fill="none" stroke={ACCENT} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
        </svg>
        <p className="mt-1.5 text-[11px]" style={{ color: C.textDim }}>
          Distance between agents across {coop.durationSec}s
        </p>

        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            { k: "Agents", v: String(coop.agents) },
            { k: "Clock offset", v: `${coop.clockOffsetMs} ms` },
            { k: "In view", v: `${fovPct}%` },
          ].map((s) => (
            <div key={s.k}>
              <dt className="text-[10px] uppercase tracking-wider" style={{ color: C.textDim }}>
                {s.k}
              </dt>
              <dd className="mt-0.5 font-mono text-sm" style={{ color: C.value }}>
                {s.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function TelemetryStrip() {
  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 py-24 md:py-32 lg:px-10 xl:px-16">
        <RevealOnScroll>
          <div className="mb-14 max-w-2xl">
            <h2
              className="text-3xl font-medium tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
            >
              The video is{" "}
              <span style={{ color: C.textDim }}>the easy half</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed md:text-base" style={{ color: C.textMid }}>
              A world model needs the action that produced the next frame. Below is the real input
              record from one {gameName(wd.game)} session: {wd.frames.toLocaleString("en-US")} frames at{" "}
              {wd.fps} fps, every key and mouse delta held on each one.
            </p>
          </div>
        </RevealOnScroll>

        <div className="grid min-w-0 gap-6">
          <LaneChart />
          <CoopPanel />
        </div>
      </div>
    </section>
  );
}
