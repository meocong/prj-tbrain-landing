"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import rrdIndex from "@/lib/samples/rrd.json";
import { C } from "./tokens";

/**
 * The preview window, explorable: the rig in 3D, its path through the room,
 * all four lenses and the IMU on one timeline, in the Rerun web viewer.
 *
 * Built after GSI's showcase (2026-09-25), which opens every segment this way.
 * The recordings come from `scripts/samples/build-rrd.py`; which slugs have one
 * is `rrd.json`, so a record without a recording simply gets no button.
 *
 * The viewer is ~50 MB of wasm, so nothing about it loads until the reader asks:
 * the package is imported on open, and torn down on close.
 *
 * Hands are ESTIMATED — the approved delivery does not include a hand track, so
 * they are MediaPipe landmarks triangulated through the delivered calibration.
 * The strip under the title says which layers are delivered and which are ours,
 * because a buyer who mistook the estimate for the product would be misled.
 */

type Entry = { bytes: number; poseMeasured: number; handFrames: number | null; rig: string };
const INDEX = rrdIndex as Record<string, Entry>;

export function hasRecording(slug: string) {
  return slug in INDEX;
}

const rrdSrc = (slug: string) => `/samples/rrd/${slug}.rrd`;

export function RigExplorer({ slug, title, onClose }: { slug: string; title: string; onClose: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const entry = INDEX[slug];

  useEffect(() => {
    let viewer: { stop(): void } | null = null;
    let dead = false;
    (async () => {
      try {
        const { WebViewer } = await import("@rerun-io/web-viewer");
        if (dead || !host.current) return;
        const v = new WebViewer();
        viewer = v;
        await v.start(new URL(rrdSrc(slug), window.location.origin).toString(), host.current, {
          hide_welcome_screen: true,
          allow_fullscreen: false,
          enable_history: false,
          theme: "dark",
          width: "100%",
          height: "100%",
        });
        if (dead) v.stop();
        else setState("ready");
      } catch {
        if (!dead) setState("error");
      }
    })();
    return () => {
      dead = true;
      viewer?.stop();
    };
  }, [slug]);

  /* Escape closes this layer only. The record modal listens on window in the
     bubble phase; this listens in the capture phase and stops the event, so one
     press does not close both. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopImmediatePropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return createPortal(
    <div
      className="samples-scope fixed inset-0 z-[120] flex flex-col"
      style={{ background: "#16161a" }}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — 3D view`}
      /* Rendered through a portal but still a React child of the modal, whose
         backdrop closes on click. Clicks here must not reach it. */
      onClick={(e) => e.stopPropagation()}
    >
      <header
        className="flex flex-none flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 md:px-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#e8e8ea" }}
      >
        <div className="min-w-0 flex-1">
          <p className="bp-mono text-[10px]" style={{ color: C.accent }}>
            Explore · preview window
          </p>
          <h2 className="mt-1 truncate text-base font-medium md:text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            {title}
          </h2>
          <p className="mt-1 text-[11px] leading-relaxed" style={{ color: "rgba(232,232,234,0.62)" }}>
            From the delivery: the stereo pair, all four lenses placed on the rig, head path
            {entry ? ` (${Math.round(entry.poseMeasured * 100)}% of frames measured` : ""}
            {entry && entry.poseMeasured < 0.5 ? ", held still between measurements" : ""}
            {entry ? ")" : ""}, accelerometer and gyro.{" "}
            {entry?.handFrames ? (
              <>
                <span style={{ color: "#e8e8ea" }}>Hands are estimated</span> — MediaPipe on the mid pair, triangulated
                through the delivered calibration; not part of the delivery.
              </>
            ) : null}
          </p>
        </div>
        <a
          href={rrdSrc(slug)}
          download={`${slug}.rrd`}
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px]"
          style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#e8e8ea" }}
        >
          <Download className="h-3.5 w-3.5" />
          .rrd{entry ? ` · ${(entry.bytes / 1e6).toFixed(1)} MB` : ""}
        </a>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close 3D view"
          className="rounded-full p-2"
          style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#e8e8ea" }}
        >
          <X className="h-4 w-4" />
        </button>
      </header>
      <div className="relative min-h-0 flex-1">
        <div ref={host} className="absolute inset-0" />
        {/* Rerun draws its own progress bar while the ~50 MB viewer loads,
            so only a failure needs saying here. */}
        {state === "error" && (
          <div
            className="bp-mono pointer-events-none absolute inset-0 flex items-center justify-center px-6 text-center text-[11px]"
            style={{ color: "rgba(232,232,234,0.7)" }}
          >
            The 3D viewer could not start in this browser. The .rrd opens in Rerun (rerun.io).
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
