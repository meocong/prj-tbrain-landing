"use client";

/**
 * Smooth scroll provider — DISABLED.
 *
 * Lenis was causing main-thread thrash when combined with the Canvas
 * hero shader on some browsers (scroll jitter / stuck scroll). Native
 * scroll is smooth enough for this page. Kept as a no-op component
 * so imports still work; re-enable when we validate perf on low-end
 * devices.
 */
export function SmoothScrollProvider() {
  return null;
}
