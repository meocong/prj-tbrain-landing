import type { CSSProperties } from "react";

/**
 * The brand accents, as TEXT that passes WCAG AA (4.5:1) on both themes.
 *
 * The accents themselves (#10B981, #F59E0B, #0EA5E9, ...) are fill colours:
 * as small text on white they read 1.9-2.7:1, and #6C3CF4 reads ~3.2:1 on the
 * dark surfaces. Each maps to a deeper shade of the same hue for the light
 * theme and a lighter one for the dark theme (Tailwind's 700 / 300-400 steps),
 * swapped by the `.ink` rule in globals.css.
 *
 * Use it wherever an accent colours words; fills, borders and gradients keep
 * the accent as it is.
 */
const INK: Record<string, [light: string, dark: string]> = {
  "#6C3CF4": ["#6C3CF4", "#A78BFA"],
  "#8B5CF6": ["#7C3AED", "#C4B5FD"],
  "#10B981": ["#047857", "#6EE7B7"],
  "#34D399": ["#047857", "#6EE7B7"],
  "#F59E0B": ["#B45309", "#FCD34D"],
  "#0EA5E9": ["#0369A1", "#7DD3FC"],
};

export function ink(accent: string): CSSProperties {
  const [light, dark] = INK[accent.toUpperCase()] ?? [accent, accent];
  return { "--ink": light, "--ink-dark": dark } as CSSProperties;
}
