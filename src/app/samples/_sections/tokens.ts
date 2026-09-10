/**
 * Visual tokens for the samples pages.
 *
 * Deliberately narrower than the rest of the marketing site: a single flat base
 * instead of the navy used elsewhere, hairlines instead of card fills, and the
 * brand violet used rarely at full strength rather than everywhere at 2%.
 *
 * Radius rule for these pages: media is square, buttons are pills, and the only
 * rounded container is the telemetry instrument. Nothing else gets a corner.
 *
 * Every value resolves to a CSS custom property declared under `.samples-scope`
 * in globals.css. These pages paint through inline `style`, which the `dark:`
 * variant cannot reach, so the light and dark palettes live in CSS and the
 * class on <html> switches between them. Consumers keep using `C.textMid`.
 */
export const C = {
  base: "var(--sm-base)",
  band: "var(--sm-band)",
  hairline: "var(--sm-hairline)",
  hairlineSoft: "var(--sm-hairline-soft)",
  text: "var(--sm-text)",
  textMid: "var(--sm-text-mid)",
  textDim: "var(--sm-text-dim)",
  accent: "var(--sm-accent)",
  /** Gradient partner. Emerald. Gradients only — never a status, see globals.css. */
  accentAlt: "var(--sm-accent-alt)",
  positive: "var(--sm-positive)",

  /** Tinted fill behind an active filter chip. */
  accentSoft: "var(--sm-accent-soft)",
  /** Failure copy. */
  danger: "var(--sm-danger)",
  /** Metadata values: a step stronger than body copy, weaker than a heading. */
  value: "var(--sm-value)",
  /** Underline under a text link, and the border on a ghost button. */
  rule: "var(--sm-rule)",
  /** Inert fill: a skeleton row, an unlit chart lane. */
  wash: "var(--sm-wash)",
  /** Scrub playhead drawn over a chart. */
  playhead: "var(--sm-playhead)",
  /** Page base as bare `r,g,b`, for gradients that fade video into the page. */
  baseRgb: "var(--sm-base-rgb)",
} as const;

/**
 * Badges printed on top of video keep a dark scrim in both themes. Their
 * backdrop is footage, not the page, so they must not follow the theme.
 */
export const OVER_MEDIA = {
  scrim: "rgba(7,9,15,0.78)",
  text: "rgba(255,255,255,0.86)",
  textDim: "rgba(255,255,255,0.7)",
  /** A heading printed on footage. The 0.86 above is right for a caption and
      too soft for display type, which has to hold against a bright frame. */
  title: "#FFFFFF",
  /** Bottom-weighted wash under type that floats on a clip. Transparent at the
      top so the frame is not dimmed for the sake of two lines at the foot of
      it. Same 6,8,14 base the hero scrims use. */
  wash:
    "linear-gradient(180deg, rgba(6,8,14,0) 0%, rgba(6,8,14,0.10) 42%, rgba(6,8,14,0.62) 72%, rgba(6,8,14,0.88) 100%)",
} as const;

export const EASE = [0.16, 1, 0.3, 1] as const;

export type PillKind = "skill" | "difficulty" | "device" | "file" | "quality" | "muted";

/**
 * Colour carries meaning on the published pack: what the task is, how hard, what
 * recorded it, what lands on disk, and whether it passed its quality gate. Five
 * greys would be five things to read; five hues are one glance.
 */
export const PILL: Record<PillKind, { bg: string; fg: string; bd: string }> = {
  skill: { bg: "var(--sm-pill-skill-bg)", fg: "var(--sm-pill-skill-fg)", bd: "var(--sm-pill-skill-bd)" },
  difficulty: { bg: "var(--sm-pill-hard-bg)", fg: "var(--sm-pill-hard-fg)", bd: "var(--sm-pill-hard-bd)" },
  device: { bg: "var(--sm-pill-device-bg)", fg: "var(--sm-pill-device-fg)", bd: "var(--sm-pill-device-bd)" },
  file: { bg: "var(--sm-wash)", fg: "var(--sm-text-mid)", bd: "var(--sm-hairline)" },
  quality: { bg: "var(--sm-pill-ok-bg)", fg: "var(--sm-pill-ok-fg)", bd: "var(--sm-pill-ok-bd)" },
  muted: { bg: "var(--sm-wash)", fg: "var(--sm-text-dim)", bd: "var(--sm-hairline-soft)" },
};

/**
 * One published record. Shared by the grid tile and the record layer so the two
 * cannot drift about what a sample carries.
 */
export interface Sample {
  slug: string;
  /**
   * The original field, kept because `/samples/s` groups downloads by it and
   * every analytics event carries it. It conflates two axes — see `modality`
   * and `provenance` below, which split it — and new code should read those.
   */
  domain: "robotics" | "game" | "ots";
  /** What the record is. Three of the five values hold nothing yet. */
  modality: "egocentric" | "exocentric" | "teleoperation" | "mocap" | "gaming";
  /**
   * How it was captured. Deliberately unqualified for stereo: the six-camera
   * rig demonstrated on tbrain-dashboard may be the same one 84 of these records
   * were shot on, so a camera count here would be a guess with a number on it.
   */
  tier: "stereo" | "gameplay";
  /** Where it came from. Null on game records, which do not say. */
  provenance: "ots" | "custom" | null;
  title: string;
  label: string;
  environment: string;
  locale: string;
  rig: string;
  viewpoint: "first-person" | "third-person";
  skillGroup: string | null;
  industry: string | null;
  job: string | null;
  telemetry: boolean;
  durationSec: number;
  resolution: string;
  fps: number;
  streams: string[];
  formats: string[];
  size: string;
  spec: [string, string][];
  breadcrumb: string[];
  preview: string;
  pills: { t: string; k: PillKind }[];
  downloads: { t: string; primary: boolean }[];
}
