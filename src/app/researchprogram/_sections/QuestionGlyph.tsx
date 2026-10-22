/**
 * Line-art marks for the six research questions — drawn in the blueprint's
 * hairline idiom (1.5px stroke, round caps, currentColor) so they read as
 * diagram annotations, not icon-library clip art. They redraw on card hover
 * (`.rs-glyph` in research.css).
 */
import type { ResearchQuestion } from "@/lib/landing/research";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const GLYPHS: Record<ResearchQuestion["key"], React.ReactNode> = {
  // More tasks, places, people — three different shapes over a long hours axis.
  diversity: (
    <>
      <circle cx="17" cy="24" r="6.5" />
      <rect x="27" y="12" width="12" height="12" rx="2" />
      <path d="M44 36 L51.5 23 L59 36 Z" />
      <circle cx="31" cy="37" r="2.5" />
      <path d="M6 51 H58" />
      <path d="M14 48.5 V53.5 M22 48.5 V53.5 M30 48.5 V53.5 M38 48.5 V53.5 M46 48.5 V53.5 M54 48.5 V53.5" />
    </>
  ),
  // A demonstration that slips and recovers — the mistake marked, the end reached.
  quality: (
    <>
      <polyline points="6,46 21,24 32,40 57,14" />
      <path d="M49 13 H57.5 V21.5" />
      <path d="M28.5 46 L34.5 52 M34.5 46 L28.5 52" />
      <circle cx="21" cy="24" r="2" />
    </>
  ),
  // A timeline cut into labelled segments: task, action, object, timing.
  structure: (
    <>
      <rect x="6" y="26" width="52" height="12" rx="2.5" />
      <path d="M19 26 V38 M33 26 V38 M45 26 V38" />
      <path d="M12.5 26 V17 H18 M26 26 V12 H32 M39 26 V17 H44.5 M51.5 26 V12 H57" />
      <path d="M6 49 H58" strokeDasharray="2 3.5" />
      <path d="M6 46 V52 M58 46 V52" />
    </>
  ),
  // A human hand carried over to a two-jaw gripper.
  transfer: (
    <>
      <path d="M9 50 V33.5 a2.2 2.2 0 0 1 4.4 0 V25 a2.2 2.2 0 0 1 4.4 0 V23 a2.2 2.2 0 0 1 4.4 0 V27 a2.2 2.2 0 0 1 4.4 0 V43 c0 4.4 -3.4 7 -7.6 7 Z" />
      <path d="M30 34 H39 M35 30 L39 34 L35 38" />
      <rect x="45" y="12" width="12" height="8" rx="2" />
      <path d="M51 20 V27" />
      <path d="M43 27 H59 M43 27 V41 L46.5 46 M59 27 V41 L55.5 46" />
    </>
  ),
  // A balance — judged fairly, independently.
  evaluation: (
    <>
      <path d="M32 12 V52 M22 52 H42" />
      <path d="M11 19 H53" />
      <circle cx="32" cy="12" r="2.2" />
      <path d="M11 19 L5.5 33 M11 19 L16.5 33 M53 19 L47.5 33 M53 19 L58.5 33" />
      <path d="M4.5 33 Q11 40 17.5 33 Z M46.5 33 Q53 40 59.5 33 Z" />
    </>
  ),
  // A real room turned into a simulated volume: wireframe cube on a grid floor.
  simulation: (
    <>
      <path d="M32 8 L50 18 V38 L32 48 L14 38 V18 Z" />
      <path d="M14 18 L32 28 L50 18 M32 28 V48" />
      <path d="M32 8 V28" strokeDasharray="2 3" opacity="0.5" />
      <path d="M8 52 L32 60 L56 52" opacity="0.55" />
      <path d="M20 56 L44 48 M44 56 L20 48" opacity="0.35" />
    </>
  ),
};

export function QuestionGlyph({ k, size = 44 }: { k: ResearchQuestion["key"]; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="rs-glyph" {...P}>
      {GLYPHS[k]}
    </svg>
  );
}

/** The seventh mark: an open question — a question mark in a dashed ring. */
export function OpenGlyph({ size = 44 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden {...P}>
      <circle cx="32" cy="32" r="24" strokeDasharray="3 4" />
      <path d="M25 26 a7 7 0 1 1 10 6.3 c-2 1 -3 2.4 -3 4.7 V39" />
      <circle cx="32" cy="45" r="0.9" fill="currentColor" />
    </svg>
  );
}
