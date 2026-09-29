"use client";

import { useSyncExternalStore } from "react";
import { MotionGlobalConfig, useReducedMotion as useOsReducedMotion } from "framer-motion";

/**
 * "Pause animations": the site's own switch, on top of the OS setting.
 *
 * WCAG 2.2.2 (Pause, Stop, Hide) asks that anything moving by itself for more
 * than five seconds beside other content can be paused. The site already
 * stills everything under `prefers-reduced-motion`, but that is an OS setting
 * most readers never find. This switch reaches the same stillness from a
 * button in the header:
 *
 *  - `html.motion-paused` carries the CSS side (globals.css mirrors each
 *    reduced-motion block for it);
 *  - `useReducedMotion()` here replaces framer-motion's, so every component
 *    that already has a still version for reduced motion shows it;
 *  - `MotionGlobalConfig.skipAnimations` finishes any framer animation that
 *    has no such branch;
 *  - muted autoplay videos are paused, and resumed when the switch is off.
 *
 * The choice is kept in localStorage (not a cookie) and applied before first
 * paint by the inline script in the root layout.
 */

export const MOTION_KEY = "tbrain-motion";
const CLASS = "motion-paused";
const EVENT = "tbrain-motion-change";

export function isMotionPaused(): boolean {
  return typeof document !== "undefined" && document.documentElement.classList.contains(CLASS);
}

/** For code that reads the preference once, outside React. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return isMotionPaused() || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribe, isMotionPaused, () => false);
}

/** framer-motion's hook, also true while the site's pause switch is on. */
export function useReducedMotion(): boolean {
  const os = useOsReducedMotion();
  const paused = useMotionPaused();
  return Boolean(os) || paused;
}

/* Videos paused by the switch, so turning it off resumes only those. */
const pausedByUs = new WeakSet<HTMLVideoElement>();

function stillVideo(v: HTMLVideoElement) {
  // Only ambient video: muted autoplay loops. A video the reader started,
  // with controls, is theirs.
  if (!v.muted || v.controls) return;
  if (!v.paused) {
    v.pause();
    pausedByUs.add(v);
  } else if (v.autoplay) {
    pausedByUs.add(v);
  }
}

function onPlay(e: Event) {
  if (isMotionPaused() && e.target instanceof HTMLVideoElement) stillVideo(e.target);
}

let wired = false;
/** Called once on the client: keeps newly-mounted autoplay videos still. */
export function wireMotionPause() {
  if (wired || typeof document === "undefined") return;
  wired = true;
  document.addEventListener("play", onPlay, true);
  if (isMotionPaused()) {
    MotionGlobalConfig.skipAnimations = true;
    document.querySelectorAll("video").forEach(stillVideo);
  }
}

export function setMotionPaused(paused: boolean) {
  const root = document.documentElement;
  root.classList.toggle(CLASS, paused);
  MotionGlobalConfig.skipAnimations = paused;
  try {
    if (paused) localStorage.setItem(MOTION_KEY, "paused");
    else localStorage.removeItem(MOTION_KEY);
  } catch {}
  document.querySelectorAll("video").forEach((v) => {
    if (paused) stillVideo(v);
    else if (pausedByUs.has(v)) {
      pausedByUs.delete(v);
      v.play().catch(() => {});
    }
  });
  window.dispatchEvent(new Event(EVENT));
}
