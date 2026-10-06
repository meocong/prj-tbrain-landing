import { HAND_COLOR } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { pad2, type HandPoint } from "./page-data";

/**
 * A dot strip: all 32 hands on one axis, one mark each.
 *
 * It exists to show a spread the table cannot: 24% to 99.9% is a range, not a
 * number, and the page's whole argument is that one headline figure would
 * hide it. A circle is a left hand and a diamond a right one, in the hand's
 * own hue, so the shape still says which when the hues are read as grey.
 * Marks that would overlap stack upward from the axis, which keeps every one
 * visible and its horizontal position exact.
 *
 * Two renderings of the same strip, one for a phone and one for a wider box,
 * because an SVG scaled down to 320px takes its 10px labels with it. They are
 * switched by CSS and the hidden one is out of the accessibility tree.
 *
 * The drawing is `role="img"` with a label; the numbers behind it are in the
 * table the card offers ("Show the numbers"), which is the text alternative.
 * Direct labels on the figure (median, min, max) rather than a legend to
 * decode.
 */

interface StripSpec {
  ariaLabel: string;
  lo: number;
  hi: number;
  /** Axis ticks. */
  ticks: number[];
  /** Dashed reference lines through the plot, e.g. the 50 / 80 / 95 cut-offs. */
  guides: number[];
  median: number;
  medianLabel: string;
  /** Labels pinned to a value: the extremes. */
  notes: { value: number; text: string; place: "above-start" | "below-end" | "above-end" }[];
}

const BASE = 150;
const STEP = 10.5;
const R = 4.3;

function layout(points: HandPoint[], x: (v: number) => number, tw: number) {
  // Lowest first, so a stack builds up from the axis in value order.
  const sorted = [...points].sort((a, b) => a.value - b.value);
  const placed: { x: number; level: number }[] = [];
  return sorted.map((p) => {
    const cx = x(p.value);
    let level = 0;
    while (placed.some((q) => q.level === level && Math.abs(cx - q.x) < tw)) level += 1;
    placed.push({ x: cx, level });
    return { ...p, cx, cy: BASE - 8 - level * STEP };
  });
}

function Strip({ points, spec, width }: { points: HandPoint[]; spec: StripSpec; width: number }) {
  const narrow = width < 500;
  const x = (v: number) => 16 + ((v - spec.lo) / (spec.hi - spec.lo)) * (width - 32);
  const dots = layout(points, x, narrow ? 11.5 : 10.5);
  const mono = { fontFamily: "var(--font-mono)", fontSize: 10 } as const;
  // Room under the axis for the tick labels, and for a label hung below it.
  const height = spec.notes.some((n) => n.place === "below-end") ? 196 : 184;

  return (
    <svg
      role="img"
      aria-label={spec.ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="mt-3 block h-auto w-full overflow-visible"
      style={{ maxWidth: narrow ? undefined : 600 }}
    >
      {/* Axis and ticks. The 95 label is dropped on the narrow strip, where it
          would sit on top of the 100 beside it. */}
      <line x1={16} y1={BASE} x2={width - 16} y2={BASE} style={{ stroke: C.rule }} />
      {spec.ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} y1={BASE} x2={x(t)} y2={BASE + 5} style={{ stroke: C.textDim }} />
          {!(narrow && t === 95) && (
            <text x={x(t)} y={BASE + 19} textAnchor="middle" fill="currentColor" style={{ ...mono, color: C.textDim }}>
              {t}
            </text>
          )}
        </g>
      ))}

      {spec.guides.map((t) => (
        <line key={t} x1={x(t)} y1={30} x2={x(t)} y2={BASE} strokeDasharray="2 3" style={{ stroke: C.rule }} />
      ))}

      <line x1={x(spec.median)} y1={36} x2={x(spec.median)} y2={BASE} strokeWidth={1.2} style={{ stroke: C.text }} />

      {dots.map((d) => {
        const fill = HAND_COLOR[d.hand];
        const label = `Sample ${pad2(d.sample.n)}, ${d.hand}: ${d.value.toFixed(1)}%`;
        // A hairline in the page colour keeps two touching marks apart without
        // moving either.
        return d.hand === "left" ? (
          <circle key={`${d.sample.slug}-l`} cx={d.cx} cy={d.cy} r={R} strokeWidth={0.8} style={{ fill, stroke: C.base }}>
            <title>{label}</title>
          </circle>
        ) : (
          <path
            key={`${d.sample.slug}-r`}
            d={`M${d.cx} ${d.cy - 5.2}l5.2 5.2-5.2 5.2-5.2-5.2z`}
            strokeWidth={0.8}
            style={{ fill, stroke: C.base }}
          >
            <title>{label}</title>
          </path>
        );
      })}

      <text x={x(spec.median)} y={28} textAnchor="middle" fill="currentColor" style={{ ...mono, color: C.text }}>
        {spec.medianLabel}
      </text>
      {spec.notes.map((n) => {
        const place = {
          "above-start": { x: x(n.value) - 4, y: BASE - 30, anchor: "start" as const },
          "above-end": { x: x(n.value), y: BASE - 24, anchor: "end" as const },
          "below-end": { x: x(n.value) + 2, y: BASE + 37, anchor: "end" as const },
        }[n.place];
        return (
          <text key={n.text} x={place.x} y={place.y} textAnchor={place.anchor} fill="currentColor" style={{ ...mono, color: C.textMid }}>
            {n.text}
          </text>
        );
      })}
    </svg>
  );
}

/** Left is a circle and right a diamond, spelled out under the figure as well as in its subtitle. */
function Key() {
  return (
    <p className="mt-2 flex items-center gap-4 text-[11px]" style={{ color: C.textMid }}>
      <span className="inline-flex items-center gap-1.5">
        <svg aria-hidden width={11} height={11} viewBox="0 0 11 11">
          <circle cx={5.5} cy={5.5} r={4.3} style={{ fill: HAND_COLOR.left }} />
        </svg>
        Left hand
      </span>
      <span className="inline-flex items-center gap-1.5">
        <svg aria-hidden width={11} height={11} viewBox="0 0 11 11">
          <path d="M5.5 .3l5.2 5.2-5.2 5.2-5.2-5.2z" style={{ fill: HAND_COLOR.right }} />
        </svg>
        Right hand
      </span>
    </p>
  );
}

export function DotStrip({ points, spec }: { points: HandPoint[]; spec: StripSpec }) {
  return (
    <>
      <div className="hidden md:block">
        <Strip points={points} spec={spec} width={560} />
      </div>
      <div className="md:hidden">
        <Strip points={points} spec={spec} width={320} />
      </div>
      <Key />
    </>
  );
}

export type { StripSpec };
