import type { ReactNode } from "react";
import { QUALIFIER } from "@/lib/samples/license";
import {
  HANDPOSE,
  HAND_COLOR,
  HAND_LABEL,
  HP_FPS,
  PACK_FILES,
  STATE_DEFINITION,
  fmtCount,
  fmtPct,
  fmtSec,
  frameToSec,
  mmss,
  type Hand,
  type HandPoseSample,
} from "@/lib/samples/handpose";
import { C, type Sample } from "../tokens";
import { mediaKind } from "./viewer-media";

/*
 * The right-hand pane of the record: the strip a buyer checks first, and the
 * sections under it. Built from the sample's metrics, not from `Sample.spec`:
 * the generic spec is a flat list of text pairs, and this record needs a hand's
 * colour on its figures, which a string cannot carry.
 *
 * What is NOT here is as deliberate as what is. No Industry, Operator,
 * Environment or Device section — nothing that says who recorded this or where —
 * and no figure the data team has not confirmed as a headline: "Missed" is a row
 * with its caveat attached, never a tile.
 */

const Sep = () => (
  <span aria-hidden className="px-1.5" style={{ color: C.textDim }}>
    ·
  </span>
);

/** "L" on screen, "Left" to a screen reader; the letter is the non-colour cue. */
function HandLetter({ hand }: { hand: Hand }) {
  return (
    <span style={{ color: HAND_COLOR[hand] }}>
      <span aria-hidden>{hand === "left" ? "L" : "R"}</span>
      <span className="sr-only">{HAND_LABEL[hand]}</span>
    </span>
  );
}

function HandWord({ hand }: { hand: Hand }) {
  return <span style={{ color: HAND_COLOR[hand] }}>{HAND_LABEL[hand]}</span>;
}

/** A pair of per-hand values: "L …  ·  R …". */
function Pair({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <>
      <HandLetter hand="left" /> {left}
      <Sep />
      <HandLetter hand="right" /> {right}
    </>
  );
}

/** Not known (the lane has not loaded, or could not be): a dash, said in words. */
const Dash = () => (
  <>
    <span aria-hidden>—</span>
    <span className="sr-only">not available</span>
  </>
);

/**
 * "105 frames (3.5 s)". The seconds come in once a run is long enough to be worth
 * converting: "1 frame (0.0 s)" is noise, and half a second is where it starts to
 * mean something to a reader.
 */
function runLength(frames: number | null): ReactNode {
  if (frames == null) return <Dash />;
  const seconds = frames >= HP_FPS / 2 ? ` (${fmtSec(frameToSec(frames))})` : "";
  return `${fmtCount(frames)} ${frames === 1 ? "frame" : "frames"}${seconds}`;
}

/* ── Strip ──────────────────────────────────────────────────────────────── */

/**
 * Rules between the strip's cells. Two columns on a phone, four from `sm`, so the
 * third cell is the first of a second row there and the fourth is its neighbour.
 */
const EDGE = ["", "border-l", "border-t sm:border-t-0 sm:border-l", "border-l border-t sm:border-t-0"];

/**
 * Duration, 3D pose, measured, no 3D pose: the four figures that say what this
 * sample is before anything else is read.
 *
 * The last is the worst hand's share of frames with no 3D pose, counted from the
 * state array like everything else here. It stands where the mockup had "Missed
 * (worst hand)", a figure with no confirmed formula.
 */
export function ViewerStrip({ hp }: { hp: HandPoseSample }) {
  const worstNone = (Math.max(hp.left.none, hp.right.none) / hp.frames) * 100;
  const cells: { label: string; value: ReactNode }[] = [
    { label: "Duration", value: mmss(hp.seconds) },
    {
      label: "3D pose (L / R)",
      value: (
        <>
          <span style={{ color: HAND_COLOR.left }}>{hp.left.posePct.toFixed(1)}</span>
          <span style={{ color: C.textDim }}> / </span>
          <span style={{ color: HAND_COLOR.right }}>{hp.right.posePct.toFixed(1)}</span>
          <small className="ml-1 text-[10.5px]" style={{ color: C.textMid }}>
            %
          </small>
        </>
      ),
    },
    { label: "Measured, of delivered", value: fmtPct(hp.measuredOfDeliveredPct) },
    { label: "No 3D pose (worst hand)", value: fmtPct(worstNone) },
  ];

  return (
    // Sticky only where the pane scrolls on its own: on a phone the record is
    // one long column, and a pinned two-row strip would spend a fifth of the
    // screen to repeat four numbers. The columns are not equal: a duration
    // needs half the room of a pair of percentages, and equal quarters of a
    // 590px pane wrapped "99.9 / 85.9 %" onto two lines.
    <dl
      className="z-10 grid grid-cols-2 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)] lg:sticky lg:top-0"
      style={{ background: C.base, borderBottom: `1px solid ${C.hairline}` }}
    >
      {cells.map((c, i) => (
        // A column, so a label that wraps ("No 3D pose (worst hand)" does, in a
        // 150px cell) leaves the figures on one line across the strip.
        <div
          key={c.label}
          className={`flex flex-col justify-between gap-0.5 px-5 py-3 lg:px-4 ${EDGE[i]}`}
          style={{ borderColor: C.hairlineSoft }}
        >
          <dt className="text-[10px] leading-snug" style={{ color: C.textDim }}>
            {c.label}
          </dt>
          <dd className="whitespace-nowrap font-mono text-[15px] tracking-tight" style={{ color: C.value }}>
            {c.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Sections ───────────────────────────────────────────────────────────── */

interface Row {
  label: string;
  value: ReactNode;
}
interface Section {
  title: string;
  rows: Row[];
}

function sections(hp: HandPoseSample, sample: Sample, longest: { left: number | null; right: number | null }): Section[] {
  const { left: L, right: R } = hp;
  const kind = mediaKind(hp);
  const no = String(hp.n).padStart(2, "0");

  const preview =
    kind === "video"
      ? `Camera video with the hand pose drawn over it, 540 x 540, ${HP_FPS} fps. Faces blurred.`
      : kind === "poster"
        ? "3D pose in the viewer and a skeleton still, 720 x 720. Camera video on request."
        : "3D pose in the viewer, metrics and lane. Camera video on request.";

  // From the same list the page's field table prints, so the two cannot name
  // different files. The recording's name carries the sample number.
  const pack = PACK_FILES.map((f) => f.name.replace("NN", no)).join(", ");

  return [
    {
      title: "Record",
      rows: [
        { label: "Sample", value: hp.slug },
        { label: "Skill group", value: hp.skillGroup },
        { label: "Viewpoint", value: sample.viewpoint === "first-person" ? "First person, from the head" : "Third person" },
      ],
    },
    {
      title: "Capture",
      rows: [
        { label: "Rig", value: "Six-camera head rig" },
        { label: "Cameras used", value: "Two, a stereo pair about 9 cm apart" },
        {
          label: "Source length",
          value: `${mmss(hp.seconds)} (${fmtSec(hp.seconds)}, ${fmtCount(hp.frames)} frames)`,
        },
      ],
    },
    {
      title: "Streams and sync",
      rows: [
        { label: "Public preview", value: preview },
        { label: "Sample pack", value: hp.pack ? `${pack}. Passcode.` : "On request" },
      ],
    },
    {
      title: "Hand pose",
      rows: [
        { label: "Joints per hand", value: String(HANDPOSE.jointsPerHand) },
        {
          label: "Joint layout",
          value: "wrist, then thumb, index, middle, ring and little, four joints each. See the joint table on the page.",
        },
        { label: "Units and frame", value: `metres, head-rig frame, ${HP_FPS} fps` },
        {
          label: "3D pose delivered (measured + guessed)",
          value: (
            <>
              <HandWord hand="left" /> {fmtPct(L.posePct)}
              <Sep />
              <HandWord hand="right" /> {fmtPct(R.posePct)}
            </>
          ),
        },
        {
          label: "Measured / guessed / bridged",
          value: (
            <Pair
              left={`${fmtCount(L.measured)} / ${fmtCount(L.guessed)} / ${fmtCount(L.bridged)}`}
              right={`${fmtCount(R.measured)} / ${fmtCount(R.guessed)} / ${fmtCount(R.bridged)}`}
            />
          ),
        },
        { label: "No 3D pose", value: <Pair left={fmtCount(L.none)} right={fmtCount(R.none)} /> },
        {
          label: "Longest run with no 3D pose",
          value: <Pair left={runLength(longest.left)} right={runLength(longest.right)} />,
        },
        {
          label: "Missed (as reported by the pipeline)",
          value: (
            <>
              <Pair left={fmtPct(L.missedPct)} right={fmtPct(R.missedPct)} />
              <span className="mt-1 block font-sans text-[11px] leading-relaxed" style={{ color: C.textDim }}>
                The pipeline&apos;s own figure: frames where a hand is clearly visible in a camera but no 3D hand is
                delivered, as a share of visible frames. Its exact definition is being confirmed.
              </span>
            </>
          ),
        },
        // What each flag means in the file. The legend beside the lane says how
        // a state is drawn; these say what it is.
        { label: "Measured", value: "Both cameras saw the hand, and its joints were triangulated." },
        {
          label: "Guessed",
          value:
            "Only one camera saw the hand. The pose is scaled to the wearer's measured hand size, and kept only where a 2D detection confirms it.",
        },
        { label: "Bridged", value: "A short gap between two measured frames, filled in." },
        { label: "No 3D pose", value: STATE_DEFINITION.none },
      ],
    },
    {
      title: "Licence",
      rows: [
        { label: "Preview", value: "Free to view, no login" },
        { label: "Commercial use", value: "Yes, under a licence" },
      ],
    },
  ];
}

export function ViewerSections({
  hp,
  sample,
  longest,
}: {
  hp: HandPoseSample;
  sample: Sample;
  /** Longest run with no 3D pose, per hand. Null while it is not known. */
  longest: { left: number | null; right: number | null };
}) {
  return (
    <>
      {sections(hp, sample, longest).map((section) => (
        <section key={section.title} className="mt-6">
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="h-[11px] w-[2px] rounded-full" style={{ background: C.accent }} />
            <h3 className="bp-mono text-[10px]" style={{ color: C.value }}>
              {section.title}
            </h3>
            <span aria-hidden className="h-px flex-1" style={{ background: C.hairline }} />
          </div>
          {/* One column of label and value, no rule between rows: the same
              reasoning as the generic record. On a phone the label stacks over
              its value, so a row like "L 2,194 / 43 / 1 · R 1,756 / 167 / 14"
              keeps the full width instead of wrapping in a 160px column. */}
          <dl className="mt-2">
            {section.rows.map((row, i) => (
              <div
                // The label alone is not unique: "No 3D pose" is both a count and,
                // further down, the glossary line for the state.
                key={`${row.label}-${i}`}
                className="grid grid-cols-1 items-baseline gap-y-0.5 py-[5px] sm:grid-cols-[minmax(0,10.5rem)_1fr] sm:gap-x-5"
              >
                <dt className="text-[11px] leading-relaxed" style={{ color: C.textDim }}>
                  {row.label}
                </dt>
                <dd className="min-w-0 break-words font-mono text-[11px] leading-relaxed" style={{ color: C.value }}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          {section.title === "Licence" && (
            <p className="mt-3 text-[11px]" style={{ color: C.textDim }}>
              {QUALIFIER}
            </p>
          )}
        </section>
      ))}
    </>
  );
}
