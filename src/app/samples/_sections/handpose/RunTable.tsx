import { useMemo } from "react";
import {
  HAND_COLOR,
  HAND_LABEL,
  STATES,
  STATE_LABEL,
  fmtCount,
  type Hand,
  type HandPoseLane,
} from "@/lib/samples/handpose";
import { C } from "../tokens";
import { LaneSwatch } from "./glyphs";

const HANDS: Hand[] = ["left", "right"];

/**
 * The lane as text: one row per run of frames that share a state, left hand then
 * right. This is the lane's text alternative (WCAG 1.1.1) and the exact record
 * behind it, so it lists every run, including the ones with no 3D pose.
 *
 * The region is focusable and named because it scrolls, in both directions at the
 * narrowest widths: a scroller keyboard users cannot reach is a keyboard trap in
 * reverse. Frames are 0-based, as in the lane's slider and in the pack's arrays.
 */
export function RunTable({ title, lane }: { title: string; lane: HandPoseLane }) {
  const rows = useMemo(
    () =>
      HANDS.flatMap((hand) =>
        lane[hand].map(([state, start, length]) => ({
          hand,
          state: STATES[state],
          first: start,
          last: start + length - 1,
          frames: length,
        })),
      ),
    [lane],
  );

  // Not `bp-mono`: its 0.16em tracking widens "FIRST FRAME" past what a 326px
  // phone can hold, and the table is easiest to read when all five columns fit.
  const th = "sticky top-0 px-2 py-2 font-mono text-[10px] font-normal uppercase tracking-[0.08em] lg:px-3";
  const thStyle = { background: C.base, color: C.textDim, boxShadow: `inset 0 -1px 0 ${C.hairline}` };

  return (
    <div
      role="region"
      tabIndex={0}
      aria-label={`State runs for ${title}`}
      className="mt-3 max-h-[min(42dvh,340px)] overflow-auto"
      style={{ border: `1px solid ${C.hairline}` }}
    >
      <table className="w-full border-collapse text-left font-mono text-[11px] tabular-nums">
        <caption className="px-2 py-2 text-left font-sans text-[11px] lg:px-3" style={{ color: C.textMid }}>
          State runs for {title}. One row per run of frames with the same state.
        </caption>
        <thead>
          <tr>
            <th scope="col" className={th} style={thStyle}>
              Hand
            </th>
            <th scope="col" className={th} style={thStyle}>
              State
            </th>
            <th scope="col" className={`${th} text-right`} style={thStyle}>
              First frame
            </th>
            <th scope="col" className={`${th} text-right`} style={thStyle}>
              Last frame
            </th>
            <th scope="col" className={`${th} text-right`} style={thStyle}>
              Frames
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.hand}-${r.first}`} style={{ borderTop: `1px solid ${C.hairlineSoft}` }}>
              <td className="px-2 py-1.5 lg:px-3" style={{ color: HAND_COLOR[r.hand] }}>
                {HAND_LABEL[r.hand]}
              </td>
              <td className="px-2 py-1.5 lg:px-3" style={{ color: C.value }}>
                <span className="inline-flex items-center gap-2">
                  <LaneSwatch state={r.state} hand={r.hand} width={18} height={8} />
                  {STATE_LABEL[r.state]}
                </span>
              </td>
              <td className="px-2 py-1.5 text-right lg:px-3" style={{ color: C.value }}>
                {fmtCount(r.first)}
              </td>
              <td className="px-2 py-1.5 text-right lg:px-3" style={{ color: C.value }}>
                {fmtCount(r.last)}
              </td>
              <td className="px-2 py-1.5 text-right lg:px-3" style={{ color: C.value }}>
                {fmtCount(r.frames)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
