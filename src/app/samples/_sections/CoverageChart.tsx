import { coverageFor, type CoverageAxis } from "@/lib/samples/coverage";
import { C } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * What the category is made of, as a shape rather than a list.
 *
 * This replaces `FacetIndex`, which printed every distinct value of every
 * facet — 78 workplaces in one alphabetical paragraph on `/samples/egocentric`.
 * The question a buyer has is the mix, not the inventory: mostly kitchens or
 * evenly spread, one rig or three. Mix is a magnitude question, so bars.
 *
 * Form notes, because they are decisions rather than defaults:
 *
 * - **One series per axis, one hue.** Bar length already encodes the count;
 *   shading the bars by that same count would encode it twice and read as a
 *   second variable. A single series needs no legend — the axis label names it.
 * - **Every bar is directly labelled with its own count.** A hover tooltip is
 *   the default for an HTML chart, but with six labelled bars it would repeat
 *   text already on screen. Labelling all six also keeps identity off colour
 *   entirely, which is the accessibility requirement a tooltip does not meet.
 * - **`+n more` on every axis.** Six bars out of 31 site types must not read as
 *   the whole catalogue.
 * - **Bars are proportional to the largest bar in their own axis,** not across
 *   the chart. Axes have different totals and a shared scale would flatten the
 *   three-value ones into nothing.
 * - **The bar is hours, not records.** The two rank differently: "Pick and
 *   Place / Object Handling" is first by count with 14 clips and third by
 *   duration, behind "Tool Use & Technical Manipulation" at 1.97 h from 13. A
 *   buyer licenses hours, so a chart ranked by clip count would put the wrong
 *   thing at the top. It also surfaces something the count hid — `medium` runs
 *   longer than `easy`, 5.43 h from 37 clips against 5.00 h from 49, because
 *   harder work takes longer per episode.
 * - **Difficulty keeps its scale order.** It is the one axis that is a scale
 *   rather than a set, so ranking it by size would scramble it and sorting it
 *   alphabetically would be worse: easy, hard, medium.
 */
export function CoverageChart({ modality }: { modality: string }) {
  const axes = coverageFor(modality);
  if (axes.length === 0) return null;

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="bp-mono text-[10px]" style={{ color: C.textDim }}>
            What this category is made of
          </h2>

          {/* Say whose hours these are.

              Every bar sums `durationSec` over the records in `samples.json` —
              the set staged in this repo and playable on the page, 16.6 h across
              135 egocentric records. Further down, `TwoRoutes` quotes the deck's
              shelf at 1,200 h. Both are true and they measure different things,
              but under a heading reading "what this category is made of" the
              smaller figure reads as a correction of the larger one rather than
              as an answer to a different question.

              Thạch, 2026-09-11: "số giờ nó phải nhiều hơn chứ, hơn 1200h cơ mà."
              The figures are not wrong; the chart never said which corpus it was
              counting. That is a label, not a recount. */}
          <p className="mt-2 max-w-2xl text-[12px] leading-relaxed" style={{ color: C.textMid }}>
            Measured across the samples published on this page, not the shelf behind them — these
            are the hours you can press play on.
          </p>

          {/* Three across, not four. Five axes in a four-column grid leave one
            alone on a second row, and at four columns of a 1400px page the
            labels are 280px wide — "Tool Use & Technical Manipulation" truncates
            to nothing. Three gives 3 + 2, which reads as two rows rather than
            as a row and a stray. */}
        <div className="mt-6 grid gap-x-12 gap-y-9 md:grid-cols-2 xl:grid-cols-3">
            {axes.map((a) => (
              <Axis key={a.label} axis={a} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Axis({ axis }: { axis: CoverageAxis }) {
  const max = Math.max(...axis.top.map((b) => b.hours), 1);

  return (
    <div style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="bp-mono text-[10px]"
          style={{ color: C.textDim }}
        >
          {axis.label}
        </span>
        {/* An ordinal axis has no "how many kinds" question — three grades is
            the scale, not a count of something. It says its unit instead. */}
        <span className="font-mono text-[11px]" style={{ color: C.accent }}>
          {axis.ordinal ? "scale" : axis.total}
        </span>
      </div>

      <ul className="mt-3.5">
        {axis.top.map((b) => (
          <li key={b.name} className="mb-2.5 last:mb-0">
            <div className="flex items-baseline justify-between gap-3">
              {/* Capitalised only on an ordinal axis. The source stores that
                  scale lowercase — `hard` — but every other axis holds proper
                  names that are already cased, and CSS `capitalize` upper-cases
                  every word in them: "Pick And Place", "Automotive And
                  Transport", "Food And Beverage". */}
              <span
                className={`truncate text-[12px]${axis.ordinal ? " capitalize" : ""}`}
                style={{ color: C.textMid }}
                title={b.name}
              >
                {b.name}
              </span>
              {/* Hours first, because hours are what is licensed, then the
                  clip count — 1.97 h from 13 clips and 1.97 h from 90 are
                  different products and the bar cannot say which. */}
              <span className="shrink-0 font-mono text-[11px]" style={{ color: C.value }}>
                {b.hours < 1 ? `${Math.round(b.hours * 60)} m` : `${b.hours.toFixed(1)} h`}
                <span style={{ color: C.textDim }}> · {b.count}</span>
              </span>
            </div>
            {/* Track then fill. The track is what makes six bars read as one
                scale rather than six unrelated dashes. */}
            <div className="mt-1 h-[6px] w-full" style={{ background: C.wash }}>
              <div
                className="h-full"
                style={{
                  width: `${Math.max((b.hours / max) * 100, 1.5)}%`,
                  background: C.accent,
                  borderRadius: "0 3px 3px 0",
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      {axis.rest > 0 && (
        <p className="mt-3 font-mono text-[10px]" style={{ color: C.textDim }}>
          +{axis.rest} more
        </p>
      )}
    </div>
  );
}
