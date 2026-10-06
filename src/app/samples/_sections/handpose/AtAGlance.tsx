import { HP_AGG, HP_FPS, fmtCount, fmtPct } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { PageSection, HAIRLINE_TOP } from "./page-kit";
import { BRIDGED_OF_SLOTS_PCT, JOINTS_PER_HAND, NONE_OF_SLOTS_PCT, STEREO_CAMERAS } from "./page-data";

/**
 * Six figures that say what the set is before anything is opened.
 *
 * Every value is read from the aggregates, so a re-run of the data build moves
 * them and nothing else has to be edited. The stat block is MocapDemo's:
 * a hairline, a mono figure, a mono label, a caption.
 *
 * Two of the figures are shares of different things and the labels say which.
 * "Delivered" is a share of every hand-frame; "Measured" is a share of the
 * delivered ones. The first draft headed the second plain "Measured" and read
 * as 90.7% of all data, when 72.7% of it is: the caption now carries both.
 */

interface Tile {
  value: string;
  unit?: string;
  label: string;
  caption: string;
  /** A long caption takes the full width on a phone, where half a width would run it to eight lines. */
  wide?: boolean;
}

function tiles(): Tile[] {
  const a = HP_AGG;
  return [
    {
      value: String(a.samples),
      label: "Samples",
      caption: `Median ${a.durationMedianSec.toFixed(1)} s, range ${a.durationMinSec.toFixed(1)} to ${a.durationMaxSec.toFixed(1)} s per sample.`,
    },
    {
      value: a.minutes.toFixed(1),
      unit: "min",
      label: "Total duration",
      caption: `${fmtCount(a.frames)} frames at ${HP_FPS} fps.`,
    },
    {
      value: String(JOINTS_PER_HAND),
      label: "Joints per hand",
      caption: "In metres, in the head-rig frame, for each hand on each frame.",
    },
    {
      value: a.deliveredOfSlotsPct.toFixed(1),
      unit: "%",
      label: "Hand-frames delivered",
      wide: true,
      caption: `Measured or guessed: ${fmtCount(a.delivered)} of ${fmtCount(a.handSlots)} hand-frames. A hand-frame is one hand on one frame, so two hands on each of ${fmtCount(a.frames)} frames.`,
    },
    {
      value: a.measuredOfDeliveredPct.toFixed(1),
      unit: "%",
      label: "Measured, of delivered hand-frames",
      wide: true,
      caption: `${fmtCount(a.measured)} measured and ${fmtCount(a.guessed)} guessed of ${fmtCount(a.delivered)} delivered hand-frames. Guessed is ${fmtPct(a.guessedOfDeliveredPct)}. Of all ${fmtCount(a.handSlots)} hand-frames, ${fmtPct(a.measuredOfSlotsPct)} are measured.`,
    },
    {
      value: String(STEREO_CAMERAS),
      label: "Cameras",
      caption: "The stereo pair of a six-camera head rig, about 9 cm apart.",
    },
  ];
}

export function AtAGlance() {
  return (
    <PageSection id="glance" tone="plain" labelledBy="hp-glance-title">
      <Reveal variant="rise">
        {/* The label is the heading here: there is no headline above six
            figures, and a second line of display type would only delay them.
            Inline weight and tracking, because the global `h2` rule is
            unlayered and outranks any utility class. */}
        <h2
          id="hp-glance-title"
          className="bp-mono text-[10px]"
          style={{ color: C.textDim, fontWeight: 400, letterSpacing: "0.16em" }}
        >
          At a glance
        </h2>

        <dl className="mt-6 grid grid-flow-dense grid-cols-2 gap-x-5 gap-y-6 md:mt-9 md:grid-flow-row md:grid-cols-3 md:gap-x-11 md:gap-y-10">
          {tiles().map((t) => (
            // Term, then its figure and caption in the DOM, so a screen reader
            // says "Samples, 16, Median 78.6 s…"; the figure is drawn above its
            // label with `order`, which is how the eye wants it.
            <div
              key={t.label}
              className={`flex flex-col pt-3.5 ${t.wide ? "max-md:col-span-2" : ""}`}
              style={HAIRLINE_TOP}
            >
              <dt className="bp-mono order-2 mt-2.5 text-[10px]" style={{ color: C.textDim }}>
                {t.label}
              </dt>
              <dd
                className="order-1 font-mono text-[32px] leading-none tracking-tight md:text-[40px]"
                style={{ color: C.value }}
              >
                {t.value}
                {t.unit ? (
                  <small className="ml-1 text-[0.5em] tracking-normal" style={{ color: C.textMid }}>
                    {t.unit}
                  </small>
                ) : null}
              </dd>
              <dd className="order-3 mt-2 max-w-[24rem] text-[12px] leading-[1.55]" style={{ color: C.textMid }}>
                {t.caption}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-3xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
          Another {fmtPct(BRIDGED_OF_SLOTS_PCT)} of hand-frames are bridged and {fmtPct(NONE_OF_SLOTS_PCT)} have no
          3D pose: out of view, or detected in 2D but not triangulated.
        </p>
      </Reveal>
    </PageSection>
  );
}
