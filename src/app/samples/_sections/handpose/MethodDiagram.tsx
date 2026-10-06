import fs from "node:fs";
import path from "node:path";
import { HAND_COLOR, fmtCount, stateAt, type Hand, type HandPoseLane, type Run } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { Lane } from "./Lane";
import { SAMPLES, pad2 } from "./page-data";

/**
 * The stereo diagram, and under it a real slice of a real lane.
 *
 * The drawing is a schematic and says so: the head rig and both hands are
 * drawn generically, not from calibration or from joints. There are no public
 * joints in this release and nothing in the picture is a measurement. What IS
 * real is the strip below it — sample 13's right hand, frames 1,085 to 1,325,
 * read from the lane file the page already publishes — so the three marks on
 * it (a bridged run, a guessed run, a run with no 3D pose) can be checked
 * against the data rather than taken from an illustration.
 *
 * Server component: it reads the lane from `public/` at build time, so the
 * client never fetches it and the page does not depend on a request.
 */

/** The window shown, in frames of sample 13. */
const A0 = 1085;
const A1 = 1325;
const SAMPLE_NO = 13;
const HAND_SHOWN: Hand = "right";

/**
 * A generic open hand in the 21-point layout, wrist at the origin, fingers up,
 * about 98 units from wrist to middle fingertip. Not anyone's hand: a plausible
 * fan of five chains so the diagram reads as a hand. Index = joint number.
 */
const HAND: [number, number][] = [
  [0, 0],
  [-12, -8], [-24, -24], [-33, -38], [-40, -51],
  [-15, -46], [-17, -65], [-18, -79], [-18.5, -91],
  [-4, -49], [-4, -70], [-4, -85], [-4, -98],
  [7, -47], [9, -66], [10, -80], [11, -91],
  [17, -42], [21, -58], [23, -69], [25, -79],
];

/** The five chains, each starting at the wrist. */
const CHAINS = [
  [0, 1, 2, 3, 4],
  [0, 5, 6, 7, 8],
  [0, 9, 10, 11, 12],
  [0, 13, 14, 15, 16],
  [0, 17, 18, 19, 20],
];
const BONES = CHAINS.flatMap((c) => c.slice(1).map((j, i) => [c[i], j] as const));
const PALM = [0, 5, 9, 13, 17];

/**
 * Where the thumb goes. The wearer looks at the backs of their own hands, so
 * the left thumb points in toward the middle of the picture and so does the
 * right one.
 */
function place(side: Hand, cx: number, wristY: number, k: number) {
  const sign = side === "left" ? -1 : 1;
  return HAND.map(([x, y]) => ({ x: cx + sign * x * k, y: wristY + y * k }));
}

const CAM_L = { x: 297, y: 338 };
const CAM_R = { x: 343, y: 338 };

function Schematic({ ts }: { ts: number }) {
  const sc = (v: number) => v * ts;
  const mono = { fontFamily: "var(--font-mono)" } as const;
  const L = place("left", 215, 232, 1.3);
  const R = place("right", 432, 232, 1.3);
  const ray = { stroke: C.accent, strokeWidth: 1 } as const;

  const marker = (x: number, y: number, n: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r={sc(9)} style={{ fill: C.base, stroke: C.accent }} />
      <text x={x} y={y + sc(3.5)} textAnchor="middle" fill="currentColor" style={{ ...mono, fontSize: sc(10), color: C.accent }}>
        {n}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="98 78 444 392"
      role="img"
      aria-label="Schematic, top view. Two head-rig cameras each see the hand. Where both see it, rays meet at each joint and the frame is measured. Where one camera sees it, the pose is guessed."
      className="block h-auto w-full"
    >
      {/* Rays. Both cameras to the measured hand, one to the guessed. */}
      {[0, 4, 8, 12, 20].flatMap((j) =>
        [CAM_L, CAM_R].map((cam, i) => (
          <line key={`m${j}-${i}`} x1={cam.x} y1={cam.y - 8} x2={L[j].x} y2={L[j].y} strokeOpacity={0.4} style={ray} />
        )),
      )}
      {[0, 8, 20].map((j) => (
        <line
          key={`g${j}`}
          x1={CAM_L.x}
          y1={CAM_L.y - 8}
          x2={R[j].x}
          y2={R[j].y}
          strokeOpacity={0.55}
          strokeDasharray="3 4"
          style={ray}
        />
      ))}

      {/* Measured hand: solid bones, filled joints. */}
      <polygon points={PALM.map((j) => `${L[j].x},${L[j].y}`).join(" ")} fillOpacity={0.14} style={{ fill: HAND_COLOR.left }} />
      {BONES.map(([a, b]) => (
        <line key={`lb${a}-${b}`} x1={L[a].x} y1={L[a].y} x2={L[b].x} y2={L[b].y} strokeWidth={2.8} strokeLinecap="round" style={{ stroke: HAND_COLOR.left }} />
      ))}
      {L.map((p, i) => (
        <circle key={`lj${i}`} cx={p.x} cy={p.y} r={3.2} style={{ fill: HAND_COLOR.left }} />
      ))}

      {/* Guessed hand: dashed bones, hollow joints. */}
      {BONES.map(([a, b]) => (
        <line key={`rb${a}-${b}`} x1={R[a].x} y1={R[a].y} x2={R[b].x} y2={R[b].y} strokeWidth={2.4} strokeDasharray="5 4" style={{ stroke: HAND_COLOR.right }} />
      ))}
      {R.map((p, i) => (
        <circle key={`rj${i}`} cx={p.x} cy={p.y} r={3} strokeWidth={1.5} style={{ fill: C.base, stroke: HAND_COLOR.right }} />
      ))}

      <text x={215} y={262} textAnchor="middle" letterSpacing={1.4} fill="currentColor" style={{ ...mono, fontSize: sc(11), color: C.text }}>
        MEASURED
      </text>
      <text x={432} y={262} textAnchor="middle" letterSpacing={1.4} fill="currentColor" style={{ ...mono, fontSize: sc(11), color: C.text }}>
        GUESSED
      </text>

      {/* The rig, from above: the head, and the bar the cameras sit on. */}
      <ellipse cx={320} cy={392} rx={62} ry={40} style={{ fill: C.band, stroke: C.rule }} />
      <rect x={262} y={326} width={116} height={20} rx={10} style={{ fill: C.band, stroke: C.textDim }} />
      {[CAM_L, CAM_R].map((cam, i) => (
        <g key={i}>
          <rect x={cam.x - 8} y={cam.y - 8} width={16} height={16} rx={3.5} style={{ fill: C.accent }} />
          <circle cx={cam.x} cy={cam.y} r={3} style={{ fill: "var(--sm-on-accent)" }} />
        </g>
      ))}
      <text x={254} y={CAM_L.y + 4} textAnchor="end" fill="currentColor" style={{ ...mono, fontSize: sc(11), color: C.textMid }}>
        mid_left
      </text>
      <text x={386} y={CAM_R.y + 4} fill="currentColor" style={{ ...mono, fontSize: sc(11), color: C.textMid }}>
        mid_right
      </text>
      <path d={`M${CAM_L.x} 360 v6 H${CAM_R.x} v-6`} fill="none" style={{ stroke: C.textDim }} />
      <text x={320} y={382} textAnchor="middle" fill="currentColor" style={{ ...mono, fontSize: sc(9.5), color: C.textMid }}>
        about 9 cm
      </text>
      <text x={320} y={448} textAnchor="middle" fill="currentColor" style={{ fontFamily: "var(--font-body)", fontSize: sc(11), color: C.textDim }}>
        six-camera head rig, two cameras used
      </text>

      {/* Step markers: the cameras, the measured hand, the guessed hand. */}
      {marker(254 - 61 * ts - 16, 336, 1)}
      {marker(150, 96, 2)}
      {marker(506, 96, 3)}
    </svg>
  );
}

/* ── The real lane slice ──────────────────────────────────────────────────── */

function readLane(publicPath: string): HandPoseLane | null {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "public", publicPath), "utf8")) as HandPoseLane;
  } catch {
    // The file is built by the data pipeline; a checkout without it still has
    // to render the page, so the lane is left out rather than the build failing.
    return null;
  }
}

/** Runs clipped to a window and re-based to its start. */
function clip(runs: Run[], a0: number, a1: number): Run[] {
  const out: Run[] = [];
  for (const [st, start, len] of runs) {
    const s = Math.max(start, a0);
    const e = Math.min(start + len, a1);
    if (e > s) out.push([st, s - a0, e - s]);
  }
  return out;
}

/**
 * The three marks, in the numbering of the five steps above: 4 bridged, 3
 * guessed, 5 no 3D pose. Each is pinned to a frame verified against the lane;
 * if the data is ever rebuilt and a frame no longer holds that state, the mark
 * moves to the nearest run that does instead of pointing at the wrong thing.
 */
const MARKS: { n: number; label: string; state: 0 | 2 | 3; frame: number; pick: "first" | "last"; flip?: boolean }[] = [
  { n: 4, label: "bridged", state: 3, frame: 1118, pick: "first" },
  { n: 3, label: "guessed", state: 2, frame: 1259, pick: "first" },
  { n: 5, label: "no 3D pose", state: 0, frame: 1323, pick: "last", flip: true },
];

function markFrame(runs: Run[], m: (typeof MARKS)[number]) {
  if (stateAt(runs, m.frame) === m.state) return m.frame;
  const inWindow = runs.filter(([st, s, l]) => st === m.state && s + l > A0 && s < A1);
  const run = m.pick === "last" ? inWindow[inWindow.length - 1] : inWindow[0];
  if (!run) return null;
  return Math.min(A1, Math.max(A0, run[1] + Math.floor(run[2] / 2)));
}

function LaneSlice() {
  const sample = SAMPLES.find((s) => s.n === SAMPLE_NO);
  const lane = sample ? readLane(sample.lane) : null;
  if (!sample || !lane) return null;

  const runs = lane[HAND_SHOWN];
  const span = A1 - A0;
  const marks = MARKS.flatMap((m) => {
    const f = markFrame(runs, m);
    return f == null ? [] : [{ ...m, f, at: ((f - A0) / span) * 100 }];
  });

  const frameNote = (f: number) => <span className="sr-only">, frame {fmtCount(f)}</span>;

  return (
    // A container, so the labels can ask how wide the LANE is rather than the
    // window: beside a 440px lane the 4-3-5 labels would run into each other,
    // and the card is that narrow at 1024px as well as on a phone.
    <div className="@container mt-4">
      <p className="bp-mono text-[9.5px]" style={{ color: C.textDim, letterSpacing: "0.12em" }}>
        Right hand, frames {fmtCount(A0)} to {fmtCount(A1)} of sample {pad2(SAMPLE_NO)} (real states)
      </p>
      <div className="mt-2">
        <Lane hand={HAND_SHOWN} runs={clip(runs, A0, A1)} frames={span} height={16} />
      </div>
      {/* Pinned to the frames above. Wide: each mark carries its own label.
          Narrow: the marks are numbers, and the labels move to a key. Real
          text either way, so the lane is described for a reader who cannot
          see it. */}
      <div className="relative mt-1 h-[22px]">
        {marks.map((m) => (
          <span
            key={m.n}
            className="absolute top-0 flex items-start gap-1.5"
            style={{ left: `${m.at}%`, transform: m.flip ? "translateX(-100%)" : "translateX(-9px)", flexDirection: m.flip ? "row-reverse" : "row" }}
          >
            <span
              className="flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full font-mono text-[10px]"
              style={{ border: `1px solid ${C.accent}`, color: C.accent }}
            >
              {m.n}
            </span>
            <span className="hidden whitespace-nowrap pt-0.5 text-[11px] leading-none @lg:inline" style={{ color: C.textMid }}>
              {m.label}
              {frameNote(m.f)}
            </span>
          </span>
        ))}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] @lg:hidden" style={{ color: C.textMid }}>
        {marks.map((m) => (
          <li key={m.n} className="flex items-center gap-1.5">
            <span className="font-mono" style={{ color: C.accent }}>
              {m.n}
            </span>
            {m.label}
            {frameNote(m.f)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MethodDiagram() {
  return (
    <figure
      className="bp-grid bp-frame m-0 overflow-hidden rounded-xl p-4 md:p-[18px]"
      style={{ border: `1px solid ${C.hairline}` }}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="bp-mono text-[9.5px]" style={{ color: C.textDim, letterSpacing: "0.12em" }}>
          Top view, schematic
        </span>
        <span className="font-mono text-[11px]" style={{ color: C.accent }}>
          21 joints per hand · metres · rig frame
        </span>
      </figcaption>

      <div className="hidden md:block">
        <Schematic ts={0.88} />
      </div>
      <div className="md:hidden">
        <Schematic ts={1.32} />
      </div>

      <ul className="mt-1 grid gap-1 text-[12px] leading-snug" style={{ color: C.textMid }}>
        <li>
          <b className="mr-1.5 font-mono font-normal" style={{ color: C.accent }}>1</b>
          Two calibrated cameras look at the same hand.
        </li>
        <li>
          <b className="mr-1.5 font-mono font-normal" style={{ color: C.accent }}>2 MEASURED</b>
          two rays meet at each joint.
        </li>
        <li>
          <b className="mr-1.5 font-mono font-normal" style={{ color: C.accent }}>3 GUESSED</b>
          one camera, scaled to hand size.
        </li>
      </ul>

      <LaneSlice />

      <p className="mt-3 text-[11px] leading-snug" style={{ color: C.textDim }}>
        Schematic. The rig and the hands are drawn generically, not from calibration or joint data. The lane is the real
        states of sample {SAMPLE_NO}&apos;s right hand, frames {fmtCount(A0)} to {fmtCount(A1)}.
      </p>
    </figure>
  );
}
