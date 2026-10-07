"use client";

import { useEffect, useRef } from "react";
import { HAND_LABEL, type Hand } from "@/lib/samples/handpose";
import { readHand, type JointTrack } from "@/lib/samples/handpose-joints";
import { C } from "../tokens";
import { HandBadge } from "./glyphs";
import { useVideoClock } from "./use-video-clock";

/**
 * The numbers under the pose, per hand, for the frame on show: wrist position
 * in centimetres, thumb tip to index tip in millimetres, wrist speed in cm/s.
 * A dash where the hand has no 3D pose.
 *
 * Written straight into the cells from the video's clock, like the lane's
 * readout, so playing the clip re-renders nothing. Not a live region: the figures
 * change thirty times a second, and the lane's slider is what a screen reader
 * follows. Speed is taken from the 15 fps samples either side of the frame, so it
 * carries about 3 cm/s of rounding.
 */

const HANDS: Hand[] = ["left", "right"];
const COLS = ["x", "y", "z", "pinch", "speed"] as const;
type Col = (typeof COLS)[number];

const HEAD: Record<Col, { name: string; unit: string }> = {
  x: { name: "Wrist x", unit: "cm" },
  y: { name: "Wrist y", unit: "cm" },
  z: { name: "Wrist z", unit: "cm" },
  pinch: { name: "Pinch", unit: "mm" },
  speed: { name: "Speed", unit: "cm/s" },
};

const MINUS = "−";
const num = (v: number | null) => (v == null ? "—" : v.toFixed(1).replace("-", MINUS));

export function HandReadout({ track, video }: { track: JointTrack | null; video: HTMLVideoElement | null }) {
  const cells = useRef<Record<string, HTMLTableCellElement | null>>({});

  const write = (t: number) => {
    HANDS.forEach((hand, h) => {
      const r = track ? readHand(track, t, h) : null;
      const vals: Record<Col, string> = {
        x: num(r?.wrist?.[0] ?? null),
        y: num(r?.wrist?.[1] ?? null),
        z: num(r?.wrist?.[2] ?? null),
        pinch: r?.pinchMm == null ? "—" : String(Math.round(r.pinchMm)),
        speed: num(r?.speedCms ?? null),
      };
      for (const c of COLS) {
        const el = cells.current[`${hand}-${c}`];
        if (el && el.textContent !== vals[c]) el.textContent = vals[c];
      }
    });
  };

  const writeRef = useRef(write);
  useEffect(() => {
    writeRef.current = write;
  });
  useVideoClock(video, (t) => writeRef.current(t));
  // The track can arrive after the video has stopped moving.
  useEffect(() => {
    writeRef.current(video?.currentTime ?? 0);
  }, [track, video]);

  return (
    <table className="w-full table-fixed border-collapse text-right font-mono text-[11px] tabular-nums">
      <caption className="sr-only">
        Hand readout for the frame on show: wrist position in centimetres, pinch aperture between thumb tip and index
        tip in millimetres, and wrist speed in centimetres per second. A dash means no 3D pose on this frame.
      </caption>
      <thead>
        <tr>
          <th scope="col" rowSpan={2} className="w-9 pb-1 text-left align-bottom font-normal">
            <span className="sr-only">Hand</span>
          </th>
          <th
            scope="colgroup"
            colSpan={3}
            className="bp-mono pb-0.5 pl-1 text-center text-[9px] font-normal uppercase tracking-[0.08em]"
            style={{ color: C.textDim, borderBottom: `1px solid ${C.hairline}` }}
          >
            Wrist, cm
          </th>
          {(["pinch", "speed"] as const).map((c) => (
            <th key={c} scope="col" rowSpan={2} className="pb-1 pl-1 text-right align-bottom font-normal leading-[1.25]" style={{ color: C.textDim }}>
              <span className="block text-[9px] uppercase tracking-[0.08em]">{HEAD[c].name}</span>
              <span className="block text-[9px]">{HEAD[c].unit}</span>
            </th>
          ))}
        </tr>
        <tr>
          {(["x", "y", "z"] as const).map((c) => (
            <th key={c} scope="col" className="pb-1 pl-1 text-right text-[9px] font-normal uppercase" style={{ color: C.textDim }}>
              <span aria-hidden>{c}</span>
              <span className="sr-only">Wrist {c}, centimetres</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {HANDS.map((hand) => (
          <tr key={hand} style={{ borderTop: `1px solid ${C.hairline}` }}>
            <th scope="row" className="py-1.5 text-left font-normal">
              <span className="inline-flex items-center">
                <HandBadge hand={hand} size={20} />
                <span className="sr-only">{HAND_LABEL[hand]}</span>
              </span>
            </th>
            {COLS.map((c) => (
              <td
                key={c}
                ref={(el) => {
                  cells.current[`${hand}-${c}`] = el;
                }}
                className="py-1.5 pl-1"
                style={{ color: C.value }}
              >
                {"—"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
