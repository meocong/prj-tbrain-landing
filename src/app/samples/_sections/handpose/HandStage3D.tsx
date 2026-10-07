"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/motion-pref";
import { HP_FPS } from "@/lib/samples/handpose";
import { C, OVER_MEDIA } from "../tokens";
import type { JointsState } from "./use-joints";
import { useVideoClock } from "./use-video-clock";
import type { PresetRequest, ViewPreset } from "./HandCanvas";

/**
 * The 3D view's frame: the labelled region, the view presets, the fallbacks.
 *
 * The three.js scene (`HandCanvas`) is a separate chunk, fetched only when this
 * mounts, and this mounts only where a player does: when a record opens, or when
 * the workspace is near the viewport.
 *
 * Accessibility. The canvas is decoration: `aria-hidden`, not focusable. The
 * region is named "3D view of both hands, frame N" and holds real buttons for
 * the views; what the scene shows is also on the state lane and in the readout
 * as text. The name is rewritten from the clock without React state, and at most
 * once a second while the video plays, so a screen reader that lands here hears
 * a current frame and is not spoken to thirty times a second.
 */

const HandCanvas = dynamic(() => import("./HandCanvas"), { ssr: false });

const PRESETS: { name: ViewPreset; label: string; hint: string }[] = [
  { name: "wearer", label: "Wearer view", hint: "From the head rig, looking forward" },
  { name: "front", label: "Front", hint: "From in front of the wearer" },
  { name: "top", label: "Top", hint: "From above" },
];

/** The panel is media: dark in both themes, and so is the pair of hand hues it paints with. */
const PANEL = "hp-media bp-frame relative w-full overflow-hidden";
const PANEL_STYLE = { background: "#06080E", border: `1px solid ${C.hairline}` } as const;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const pill = (on: boolean) =>
  ({
    background: on ? "rgba(234,240,255,0.92)" : OVER_MEDIA.scrim,
    color: on ? "#0E0C24" : OVER_MEDIA.text,
    border: `1px solid ${on ? "rgba(234,240,255,0.92)" : "rgba(255,255,255,0.22)"}`,
  }) as const;

export function HandStage3D({
  joints,
  onRetry,
  video,
  className = "",
  wide = false,
}: {
  joints: JointsState;
  onRetry: () => void;
  video: HTMLVideoElement | null;
  className?: string;
  /** 16:10 instead of square: the view stands in for the video and spans its row. */
  wide?: boolean;
}) {
  const shape = wide ? "aspect-[16/10]" : "aspect-square";
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [gl, setGl] = useState<"checking" | "yes" | "no">("checking");
  const [colors, setColors] = useState<{ left: string; right: string } | null>(null);
  const [preset, setPreset] = useState<PresetRequest>({ name: "wearer", n: 0 });
  const [trail, setTrail] = useState(false);

  useEffect(() => {
    setGl(webglAvailable() ? "yes" : "no");
    const el = panel.current;
    if (el) {
      const cs = getComputedStyle(el);
      setColors({
        left: cs.getPropertyValue("--hp-left").trim() || "#56B4E9",
        right: cs.getPropertyValue("--hp-right").trim() || "#E69F00",
      });
    }
  }, []);

  const lastFrame = useRef(-1);
  const lastAt = useRef(0);
  useVideoClock(video, (t, playing) => {
    const el = panel.current;
    if (!el) return;
    const frame = Math.max(0, Math.round(t * HP_FPS - 0.5));
    const now = performance.now();
    if (frame === lastFrame.current || (playing && now - lastAt.current < 1000)) return;
    lastFrame.current = frame;
    lastAt.current = now;
    el.setAttribute("aria-label", `3D view of both hands, frame ${frame}`);
  });

  const choose = useCallback((name: ViewPreset) => setPreset((p) => ({ name, n: p.n + 1 })), []);

  const ready = joints.status === "ready" && gl === "yes" && colors !== null;

  return (
    <figure className={`m-0 ${className}`}>
      <div ref={panel} className={`${PANEL} ${shape}`} style={PANEL_STYLE} role="region" aria-label="3D view of both hands, frame 0">
        {/* Decoration: what it shows is in the lane and the readout as text. */}
        <div aria-hidden className="absolute inset-0">
          {ready && (
            <HandCanvas
              track={joints.track}
              video={video}
              left={colors.left}
              right={colors.right}
              preset={preset}
              trail={trail}
              reduce={reduce}
            />
          )}
        </div>

        {ready && (
          <div className="absolute inset-x-2 top-2 flex flex-wrap items-center gap-1.5">
            <div role="group" aria-label="View" className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  aria-pressed={preset.name === p.name}
                  title={p.hint}
                  onClick={() => choose(p.name)}
                  className="bp-mono rounded-full px-2.5 py-1.5 text-[10px] leading-none"
                  style={pill(preset.name === p.name)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-pressed={trail}
              title="Wrist paths over the last second"
              onClick={() => setTrail((v) => !v)}
              className="bp-mono ml-auto rounded-full px-2.5 py-1.5 text-[10px] leading-none"
              style={pill(trail)}
            >
              Trail
            </button>
          </div>
        )}

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center p-5 text-center">
            {gl === "no" ? (
              <p className="max-w-[26ch] text-[12px] leading-[1.55]" style={{ color: OVER_MEDIA.text }}>
                This browser has no WebGL, so the 3D view cannot draw. The video, the lane and the readout show the
                same frames.
              </p>
            ) : joints.status === "error" ? (
              <div role="alert" className="max-w-[26ch]">
                <p className="text-[12px] leading-[1.55]" style={{ color: OVER_MEDIA.text }}>
                  The 3D joints for this sample could not be loaded.
                </p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="bp-mono mt-2.5 rounded-full px-3 py-1.5 text-[10px]"
                  style={pill(false)}
                >
                  Try again
                </button>
              </div>
            ) : (
              <p className="bp-mono text-[10px]" style={{ color: OVER_MEDIA.textDim }} role="status">
                Loading 3D pose
              </p>
            )}
          </div>
        )}
      </div>
      <figcaption className="bp-mono mt-2 text-[10px]" style={{ color: C.textDim }}>
        3D pose, metres in the head-rig frame · drag to look around
      </figcaption>
    </figure>
  );
}
