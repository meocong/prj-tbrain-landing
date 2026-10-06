import type { CSSProperties } from "react";
import { HAND_COLOR, stripRuns, type Hand, type Run } from "@/lib/samples/handpose";

/**
 * One hand's state lane: the clip as a strip, painted per frame.
 *
 * Measured is solid, guessed hatched, bridged stippled, and a frame with no 3D
 * pose is the bare track. Runs are positioned in percent, so the lane fills
 * whatever width it is given without measuring anything and renders on the
 * server; `max(…%, Npx)` keeps a one-frame guessed run visible on a 75-second
 * clip, where its true width would be a fraction of a pixel.
 *
 * Decorative by construction (`aria-hidden`): every surface that shows a lane
 * states the same facts in text — the counts beside it, the readout, or the
 * "View as table" runs.
 */
export function Lane({
  hand,
  runs,
  frames,
  height = 12,
  className,
}: {
  hand: Hand;
  runs: Run[];
  /** Length of the clip, in the same unit as the runs (frames, or bins for a strip). */
  frames: number;
  height?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`hp-lane-row ${className ?? ""}`}
      style={{ height, ["--hp-c" as string]: HAND_COLOR[hand] } as CSSProperties}
    >
      <span className="hp-lane-track" />
      {runs.map(([st, start, len]) =>
        st === 0 ? null : (
          <span
            key={start}
            className="hp-run"
            data-state={st}
            style={{
              left: `${(start / frames) * 100}%`,
              width: `max(${(len / frames) * 100}%, ${st === 1 ? 1 : 2}px)`,
            }}
          />
        ),
      )}
    </div>
  );
}

/** The 200-bin strip from the metrics file, as a lane — for cards and table rows. */
export function StripLane({
  hand,
  strip,
  height = 10,
  className,
}: {
  hand: Hand;
  strip: string;
  height?: number;
  className?: string;
}) {
  return <Lane hand={hand} runs={stripRuns(strip)} frames={strip.length} height={height} className={className} />;
}
