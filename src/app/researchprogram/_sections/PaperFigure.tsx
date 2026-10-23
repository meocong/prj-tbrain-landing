"use client";

/**
 * Figure 1 of the page, set the way a paper sets its teaser figure: one
 * recorded demonstration as data (hand-pose sample 13 — joints and per-frame
 * states only, no camera pixels).
 *
 *   (a) both hands in 3D from the joint track; drag to look around
 *   (b) the per-frame state of each hand across the clip, with a playhead
 *
 * One clock drives both panels; the figure plays by itself, so it carries a
 * pause control (WCAG 2.2.2), and under reduced motion or the header's pause
 * switch it starts paused on a frame where both hands are measured. Colours
 * follow the page theme (light by default, dark when html has .dark).
 */
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { useReducedMotion } from "@/lib/motion-pref";
import { HAND_COLORS, STILL_T, loadHandData, type JointTrack, type Lanes } from "@/lib/landing/research-hand";
import type { PresetRequest, SceneTheme } from "./HandHeroCanvas";

const HandHeroCanvas = dynamic(() => import("./HandHeroCanvas"), { ssr: false });

/* A paper figure: the hands and a floor grid, nothing else — no rig glyph, no trail. */
const LIGHT: SceneTheme = { ground: "#F8FAFC", gridMajor: 0xcbd5e1, gridMinor: 0xe2e8f0, rig: 0x64748b, rigLens: 0x94a3b8, left: HAND_COLORS.left, right: HAND_COLORS.right, showRig: false, trail: false };
const DARK: SceneTheme = { ground: "#0B1222", gridMajor: 0x334155, gridMinor: 0x1e293b, rig: 0x94a3b8, rigLens: 0x64748b, left: "#A78BFA", right: "#38BDF8", showRig: false, trail: false };

const fmtT = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function webgl() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function LaneRow({ runs, frames, color }: { runs: Lanes["left"]; frames: number; color: string }) {
  return (
    <svg viewBox={`0 0 ${frames} 10`} preserveAspectRatio="none" className="block h-[8px] w-full" aria-hidden>
      {runs.map(([st, start, len], i) =>
        st === 0 ? null : st === 1 ? (
          <rect key={i} x={start} y="0" width={len} height="10" fill={color} />
        ) : (
          <rect key={i} x={start} y="0" width={Math.max(len, 3)} height="10" fill={color} opacity="0.35" />
        ),
      )}
    </svg>
  );
}

export function PaperFigure() {
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();
  const reduce = mounted && prefersReduced;
  const [dark, setDark] = useState(false);
  const [data, setData] = useState<{ track: JointTrack; lanes: Lanes } | null>(null);
  const [failed, setFailed] = useState(false);
  const [gl, setGl] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [inView, setInView] = useState(false);
  const [seek, setSeek] = useState(0);
  const preset = useRef<PresetRequest>({ name: "orbit", n: 0 }).current;
  const clock = useRef({ t: STILL_T, v: 0 });
  const wrap = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const lane = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setGl(webgl());
    loadHandData().then(setData, () => setFailed(true));
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

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

  const duration = data ? data.lanes.frames / data.lanes.fps : 74.63;

  const paint = useCallback(() => {
    const t = clock.current.t;
    if (head.current) head.current.style.left = `${(t / duration) * 100}%`;
    if (time.current) time.current.textContent = `${fmtT(t)} / ${fmtT(duration)}`;
  }, [duration]);

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

  const theme = dark ? DARK : LIGHT;
  const ready = !!data && !!gl && mounted;
  const active = ready && playing && inView;

  return (
    <div ref={wrap} className="rp-figure">
      <div className="rp-figure-panel">
        <div className="rp-stage relative">
          <div aria-hidden className="absolute inset-0">
            {ready && <HandHeroCanvas theme={theme} track={data.track} clock={clock} active={active} preset={preset} autoRotate={false} reduce={reduce} seek={seek} />}
          </div>
          {!ready && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center">
              <p className="rp-label" role="status">
                {failed ? "3D joints could not load" : gl === false ? "This browser has no WebGL for the 3D view" : "Loading 3D pose"}
              </p>
            </div>
          )}
          <span className="rp-label pointer-events-none absolute left-4 top-3.5">(a)</span>
        </div>

        <div className="rp-figure-strip">
          <span className="rp-label shrink-0">(b)</span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            disabled={!ready}
            aria-label={playing ? "Pause Figure 1" : "Play Figure 1"}
            className="rp-play"
          >
            {playing ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5 translate-x-[1px]" aria-hidden />}
          </button>
          <div
            ref={lane}
            className="relative min-w-0 flex-1 cursor-pointer"
            role="slider"
            tabIndex={ready ? 0 : -1}
            aria-label="Position in the recording"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(clock.current.t)}
            onPointerDown={(e) => {
              const r = lane.current?.getBoundingClientRect();
              if (!r || !data) return;
              const x = (e.clientX - r.left - 44) / (r.width - 44);
              if (x >= 0 && x <= 1) seekTo(x * duration);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") seekTo(clock.current.t + 2);
              else if (e.key === "ArrowLeft") seekTo(clock.current.t - 2);
            }}
          >
            {(["left", "right"] as const).map((side) => (
              <div key={side} className="flex items-center gap-2 py-[3px]">
                <span className="rp-label w-9 shrink-0">{side === "left" ? "Left" : "Right"}</span>
                <span className="relative flex-1 overflow-hidden rounded-[2px]" style={{ background: "var(--rp-line)" }}>
                  {data ? <LaneRow runs={data.lanes[side]} frames={data.lanes.frames} color={theme[side]} /> : <span className="block h-[8px]" />}
                </span>
              </div>
            ))}
            <span aria-hidden className="pointer-events-none absolute inset-y-0 left-11 right-0">
              <span ref={head} className="absolute inset-y-0 w-[2px] -translate-x-1/2 rounded-full" style={{ left: `${(STILL_T / duration) * 100}%`, background: "var(--rp-ink)" }} />
            </span>
          </div>
          <span ref={time} className="rp-label shrink-0" style={{ fontVariantNumeric: "tabular-nums" }}>
            0:35 / 1:14
          </span>
        </div>
      </div>
    </div>
  );
}
