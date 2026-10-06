import type { CSSProperties } from "react";
import { HAND_COLOR, type Hand, type StateKey } from "@/lib/samples/handpose";

/**
 * The drawing vocabulary of the hand-pose set, as small inline SVG.
 *
 * The same four marks appear in the skeleton renders, on the page legend, in
 * the record's legend and on the lane, so a reader learns them once. Each is a
 * short bone with a joint at each end, drawn the way the renderer draws that
 * state: solid with filled joints, dashed with hollow ones, dotted with small
 * rings, or nothing. Shape carries the state and hue carries the hand, so the
 * mark still reads in greyscale (WCAG 1.4.1).
 *
 * Server-safe: no hooks.
 */
export function StateGlyph({
  state,
  hand,
  width = 34,
  className,
}: {
  state: StateKey;
  /** Hue of a specific hand; omitted, the mark takes the surrounding text colour. */
  hand?: Hand;
  width?: number;
  className?: string;
}) {
  const h = 12;
  const y = h / 2;
  const x0 = 4;
  const x1 = width - 4;
  const color = hand ? HAND_COLOR[hand] : "currentColor";
  return (
    <svg
      aria-hidden
      focusable="false"
      width={width}
      height={h}
      viewBox={`0 0 ${width} ${h}`}
      className={className}
      style={{ color, flex: "none" }}
    >
      {state === "measured" && (
        <>
          <line x1={x0} y1={y} x2={x1} y2={y} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
          <circle cx={x0} cy={y} r={3.2} fill="currentColor" />
          <circle cx={x1} cy={y} r={3.2} fill="currentColor" />
        </>
      )}
      {state === "guessed" && (
        <>
          <line x1={x0 + 4} y1={y} x2={x1 - 4} y2={y} stroke="currentColor" strokeWidth={2} strokeDasharray="4 3" />
          <circle cx={x0} cy={y} r={2.8} fill="none" stroke="currentColor" strokeWidth={1.4} />
          <circle cx={x1} cy={y} r={2.8} fill="none" stroke="currentColor" strokeWidth={1.4} />
        </>
      )}
      {state === "bridged" && (
        <>
          <line
            x1={x0 + 4}
            y1={y}
            x2={x1 - 4}
            y2={y}
            stroke="currentColor"
            strokeWidth={1.8}
            strokeDasharray="0.1 3.4"
            strokeLinecap="round"
          />
          <circle cx={x0} cy={y} r={2} fill="none" stroke="currentColor" strokeWidth={1.2} />
          <circle cx={x1} cy={y} r={2} fill="none" stroke="currentColor" strokeWidth={1.2} />
        </>
      )}
      {state === "none" && (
        <line
          x1={x0}
          y1={y}
          x2={x1}
          y2={y}
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeWidth={1}
          strokeDasharray="2 3"
        />
      )}
    </svg>
  );
}

/**
 * The ringed "L" / "R" the renders stamp at each wrist, for legends and lane
 * rows. The letter is the non-colour cue for which hand.
 */
export function HandBadge({ hand, size = 18 }: { hand: Hand; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex flex-none items-center justify-center rounded-full font-mono font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.55),
        lineHeight: 1,
        color: HAND_COLOR[hand],
        border: `1.5px solid ${HAND_COLOR[hand]}`,
      }}
    >
      {hand === "left" ? "L" : "R"}
    </span>
  );
}

/**
 * A lane swatch: how a state is PAINTED on the lane, as opposed to how it is
 * drawn on the skeleton. Solid, hatched, stippled, or an empty track. The
 * patterns are the `.hp-run` classes in globals.css — CSS rather than SVG
 * `<pattern>`, which needs a document-unique id per instance and breaks across
 * the modal's portal.
 */
export function LaneSwatch({
  state,
  hand,
  width = 26,
  height = 10,
}: {
  state: StateKey;
  /** Hue of a specific hand; omitted, the swatch takes the surrounding text colour. */
  hand?: Hand;
  width?: number;
  height?: number;
}) {
  const code = { none: 0, measured: 1, guessed: 2, bridged: 3 }[state];
  return (
    <span
      aria-hidden
      className="hp-lane-row inline-block flex-none"
      style={{ width, height, ["--hp-c" as string]: hand ? HAND_COLOR[hand] : "currentColor" } as CSSProperties}
    >
      <span className="hp-lane-track" />
      {code !== 0 && <span className="hp-run" data-state={code} style={{ left: 0, width: "100%" }} />}
    </span>
  );
}
