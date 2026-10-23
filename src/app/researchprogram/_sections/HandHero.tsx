"use client";

/**
 * The hero's figure: one recorded demonstration as data, not footage.
 *
 *   (a) both hands in 3D from the real joint track — drag to orbit, three
 *       views, play / pause (it moves by itself, so WCAG 2.2.2 wants a stop)
 *   (b) the per-frame state of each hand across the whole clip, from the same
 *       recording's lanes — measured / guessed / bridged / none — with a
 *       playhead; click or arrow-key along it to seek
 *
 * Numbers only: no camera pixels anywhere. The shares printed in (b) are
 * computed from the lanes, not typed. Scale is never shown (see
 * research-hand.ts).
 *
 * The three.js scene is its own chunk and mounts after hydration; until it
 * draws, and with no WebGL, the panel shows a quiet status line. Under reduced
 * motion or the header's pause switch the clip starts paused on a frame where
 * both hands are measured.
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/lib/motion-pref";
import { HAND_COLORS, STILL_T, loadHandData, measuredShare, type JointTrack, type Lanes } from "@/lib/landing/research-hand";
import type { PresetRequest, ViewPreset } from "./HandHeroCanvas";

const HandHeroCanvas = dynamic(() => import("./HandHeroCanvas"), { ssr: false });

const PRESETS: { name: ViewPreset; label: string }[] = [
  { name: "orbit", label: "Orbit" },
  { name: "wearer", label: "Wearer" },
  { name: "top", label: "Top" },
];

function webgl() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const pct = (x: number) => `${Math.round(x * 100)}%`;

/** One hand's lane: runs drawn by state on a 0..frames axis. */
function LaneRow({ side, runs, frames }: { side: "left" | "right"; runs: Lanes["left"]; frames: number }) {
  const color = HAND_COLORS[side];
  return (
    <svg viewBox={`0 0 ${frames} 10`} preserveAspectRatio="none" className="block h-[10px] w-full" aria-hidden>
      <defs>
        <pattern id={`rs-hatch-${side}`} width="6" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="3" height="10" fill={color} opacity="0.7" />
        </pattern>
      </defs>
      <rect x="0" y="0" width={frames} height="10" fill="rgba(255,255,255,0.06)" />
      {runs.map(([st, start, len], i) =>
        st === 0 ? null : st === 1 ? (
          <rect key={i} x={start} y="0" width={len} height="10" fill={color} />
        ) : st === 2 ? (
          <rect key={i} x={start} y="0" width={Math.max(len, 2)} height="10" fill={`url(#rs-hatch-${side})`} />
        ) : (
          <rect key={i} x={start} y="3.5" width={Math.max(len, 2)} height="3" fill={color} opacity="0.55" />
        ),
      )}
    </svg>
  );
}

export function HandHero() {
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();
  const reduce = mounted && prefersReduced;
  const [data, setData] = useState<{ track: JointTrack; lanes: Lanes } | null>(null);
  const [failed, setFailed] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [preset, setPreset] = useState<PresetRequest>({ name: "orbit", n: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [seek, setSeek] = useState(0);
  const clock = useRef({ t: STILL_T, v: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setGl(webgl());
    loadHandData().then(setData, () => setFailed(true));
  }, []);

  // Start playing once data is in, unless the reader asked for stillness.
  useEffect(() => {
    if (data && mounted) setPlaying(!prefersReduced);
  }, [data, mounted, prefersReduced]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // A drag on the canvas hands the camera to the reader: stop auto-orbit.
  useEffect(() => {
    const stop = () => setAutoRotate(false);
    window.addEventListener("rs-hand-orbit", stop);
    return () => window.removeEventListener("rs-hand-orbit", stop);
  }, []);

  const duration = data ? data.lanes.frames / data.lanes.fps : 1;
  const share = useMemo(() => (data ? measuredShare(data.lanes) : null), [data]);

  const paint = useCallback(() => {
    const p = clock.current.t / duration;
    if (headRef.current) headRef.current.style.left = `${p * 100}%`;
    if (timeRef.current && data) {
      const f = Math.min(data.lanes.frames - 1, Math.round(clock.current.t * data.lanes.fps));
      timeRef.current.textContent = `frame ${String(f).padStart(4, "0")} / ${data.lanes.frames}`;
    }
  }, [duration, data]);

  // The clip's clock: advances only while playing and on screen; loops.
  useEffect(() => {
    paint();
    if (!playing || !inView || !data) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      clock.current.t = (clock.current.t + dt) % duration;
      paint();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView, data, duration, paint]);

  const seekTo = (t: number) => {
    clock.current.t = Math.max(0, Math.min(duration - 0.001, t));
    clock.current.v++;
    setSeek((n) => n + 1);
    paint();
  };

  const choose = (name: ViewPreset) => {
    setPreset((p) => ({ name, n: p.n + 1 }));
    setAutoRotate(name === "orbit");
  };

  const ready = data && gl && mounted;
  const active = !!ready && playing && inView;

  return (
    <div ref={wrap} className="relative min-w-0">
      <figure className="bp-card relative" style={{ padding: 10, borderRadius: 20 }}>
        <div className="flex items-center justify-between gap-3 px-1.5 pb-2.5 pt-1">
          <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-cyan)" }}>FIG.01</span>
          <span className="bp-mono min-w-0 truncate" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>one egocentric demonstration · 3D hand pose</span>
        </div>

        {/* (a) 3D */}
        <div
          className="relative overflow-hidden"
          style={{ aspectRatio: "4 / 3.15", borderRadius: 12, background: "#06080E", border: "1px solid rgba(94,234,212,0.12)" }}
          role="region"
          aria-label="Both hands of one recorded demonstration in 3D, from real joint data. Drag to look around."
        >
          <div aria-hidden className="absolute inset-0">
            {ready && <HandHeroCanvas track={data.track} clock={clock} active={active} preset={preset} autoRotate={autoRotate} reduce={reduce} seek={seek} />}
          </div>

          {!ready && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <p className="bp-mono" style={{ fontSize: 10, color: "rgba(234,240,255,0.6)" }} role="status">
                {failed ? "3D joints could not load" : gl === false ? "This browser has no WebGL for the 3D view" : "Loading 3D pose"}
              </p>
            </div>
          )}

          {/* chrome */}
          <span className="bp-mono pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md" style={{ fontSize: 9.5, padding: "3px 7px", color: "#fff", background: "rgba(6,6,14,0.62)", letterSpacing: "0.1em" }}>
            <span style={{ color: "#5EEAD4" }}>(a)</span><span className="hidden sm:inline">21 joints × 2 hands</span>
          </span>
          {ready && (
            <div className="absolute right-3 top-3 flex gap-1" role="group" aria-label="View">
              {PRESETS.map((p) => {
                const on = preset.name === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => choose(p.name)}
                    className="bp-mono rounded-full px-2.5 py-1.5 leading-none"
                    style={{ fontSize: 9.5, letterSpacing: "0.08em", background: on ? "rgba(234,240,255,0.92)" : "rgba(6,6,14,0.62)", color: on ? "#0E0C24" : "rgba(234,240,255,0.85)", border: `1px solid ${on ? "rgba(234,240,255,0.92)" : "rgba(255,255,255,0.2)"}` }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          )}
          <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-3 bp-mono" style={{ fontSize: 9.5, color: "rgba(234,240,255,0.8)", letterSpacing: "0.1em" }}>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: HAND_COLORS.left }} />Left</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: HAND_COLORS.right }} />Right</span>
          </div>
          {ready && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause the 3D clip" : "Play the 3D clip"}
              className="absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-full"
              style={{ background: "rgba(234,240,255,0.92)", color: "#0E0C24" }}
            >
              {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4 translate-x-[1px]" aria-hidden />}
            </button>
          )}
        </div>

        {/* (b) per-frame state */}
        <div className="mt-2" style={{ borderRadius: 12, border: "1px solid var(--bp-line)", background: "var(--bp-surface-2)", padding: "10px 12px 11px" }}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink)" }}>
              <span style={{ color: "var(--bp-cyan)" }}>(b)</span> per-frame state
            </span>
            <span ref={timeRef} className="bp-mono" style={{ fontSize: 9, color: "var(--bp-ink-faint)", fontVariantNumeric: "tabular-nums" }} aria-hidden>
              frame 0000
            </span>
          </div>
          <div
            ref={laneRef}
            className="relative cursor-pointer"
            role="slider"
            tabIndex={ready ? 0 : -1}
            aria-label="Position in the clip"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(clock.current.t)}
            aria-valuetext={`${Math.round(clock.current.t)} of ${Math.round(duration)} seconds`}
            onPointerDown={(e) => {
              const r = laneRef.current?.getBoundingClientRect();
              if (!r || !data) return;
              const lanesLeft = 46;
              const x = (e.clientX - r.left - lanesLeft) / (r.width - lanesLeft);
              if (x >= 0 && x <= 1) seekTo(x * duration);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seekTo(clock.current.t + 2);
              else if (e.key === "ArrowLeft") seekTo(clock.current.t - 2);
              else if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setPlaying((p) => !p);
              }
            }}
          >
            {(["left", "right"] as const).map((side) => (
              <div key={side} className="flex items-center gap-2" style={{ height: 16 }}>
                <span className="bp-mono w-[38px] shrink-0" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>{side === "left" ? "Left" : "Right"}</span>
                <span className="relative flex-1 overflow-hidden rounded-[3px]" style={{ background: "#0B0D16" }}>
                  {data ? <LaneRow side={side} runs={data.lanes[side]} frames={data.lanes.frames} /> : <span className="block h-[10px]" />}
                </span>
              </div>
            ))}
            <span className="pointer-events-none absolute inset-y-[-2px] right-0" style={{ left: 46 }} aria-hidden>
              <span ref={headRef} className="absolute inset-y-0 w-[2px] -translate-x-1/2 rounded-full" style={{ left: `${(STILL_T / duration) * 100}%`, background: "var(--bp-ink)" }} />
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bp-mono" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }} aria-hidden>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-[2px]" style={{ background: "var(--bp-ink-dim)" }} />measured</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-[2px]" style={{ background: "repeating-linear-gradient(125deg, var(--bp-ink-dim) 0 2px, transparent 2px 4px)" }} />guessed</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-[3px] w-3 rounded-[2px]" style={{ background: "var(--bp-ink-dim)", opacity: 0.6 }} />bridged</span>
            </div>
            {share && (
              <span className="bp-mono" style={{ fontSize: 8.5, color: "var(--bp-ink-faint)" }}>
                measured · L {pct(share.left)} · R {pct(share.right)}
              </span>
            )}
          </div>
        </div>

        <figcaption className="bp-mono mt-2.5 px-1.5 pb-0.5" style={{ fontSize: 9.5, lineHeight: 1.6, color: "var(--bp-ink-faint)" }}>
          Real joint data from one recording · no camera pixels
        </figcaption>
      </figure>
    </div>
  );
}
