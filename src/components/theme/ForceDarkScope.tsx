"use client";

import { useEffect } from "react";

/**
 * Force `<html>` into dark theme while this component is mounted.
 * On unmount, restore whatever the user had before — so other pages still
 * follow the toggle / system preference.
 *
 * Used on /data/terminal-bench and /data/physical-ai where the hero +
 * cinematic backdrop are designed dark and look broken in light theme.
 */
export function ForceDarkScope() {
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    const previousColorScheme = html.style.colorScheme;

    html.classList.add("dark");
    html.style.colorScheme = "dark";

    return () => {
      html.classList.toggle("dark", wasDark);
      html.style.colorScheme = previousColorScheme;
    };
  }, []);
  return null;
}
