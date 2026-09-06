/**
 * Visual tokens for the samples pages.
 *
 * Deliberately narrower than the rest of the marketing site: a near-black base
 * instead of the navy used elsewhere, hairlines instead of card fills, and the
 * brand violet used rarely at full strength rather than everywhere at 2%.
 *
 * Radius rule for these pages: media is square, buttons are pills, and the only
 * rounded container is the telemetry instrument. Nothing else gets a corner.
 */
export const C = {
  base: "#07090F",
  band: "#0B0E17",
  hairline: "rgba(255,255,255,0.09)",
  hairlineSoft: "rgba(255,255,255,0.06)",
  text: "rgba(245,246,248,0.96)",
  textMid: "rgba(226,232,240,0.62)",
  textDim: "rgba(226,232,240,0.40)",
  accent: "#A78BFA",
  positive: "#10B981",
} as const;

export const EASE = [0.16, 1, 0.3, 1] as const;
