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
 * - **Bars are proportional to the largest bar in their own axis,** not to the
 *   record count. Axes have different totals and a shared scale would flatten
 *   the three-value ones into nothing.
 */
export function CoverageChart({ modality }: { modality: string }) {
  const axes = coverageFor(modality);
  if (axes.length === 0) return null;

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
            What this category is made of
          </h2>

          <div className="mt-6 grid gap-x-12 gap-y-9 md:grid-cols-2 xl:grid-cols-4">
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
  const max = Math.max(...axis.top.map((b) => b.count), 1);

  return (
    <div style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-3">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: C.textDim }}
        >
          {axis.label}
        </span>
        <span className="font-mono text-[11px]" style={{ color: C.accent }}>
          {axis.total}
        </span>
      </div>

      <ul className="mt-3.5">
        {axis.top.map((b) => (
          <li key={b.name} className="mb-2.5 last:mb-0">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[12px]" style={{ color: C.textMid }} title={b.name}>
                {b.name}
              </span>
              <span className="shrink-0 font-mono text-[11px]" style={{ color: C.value }}>
                {b.count}
              </span>
            </div>
            {/* Track then fill. The track is what makes six bars read as one
                scale rather than six unrelated dashes. */}
            <div className="mt-1 h-[6px] w-full" style={{ background: C.wash }}>
              <div
                className="h-full"
                style={{
                  width: `${(b.count / max) * 100}%`,
                  background: C.accent,
                  borderRadius: "0 3px 3px 0",
                }}
              />
            </div>
          </li>
        ))}
      </ul>

      {axis.rest > 0 && (
        <p className="mt-3 font-mono text-[10.5px]" style={{ color: C.textDim }}>
          +{axis.rest} more
        </p>
      )}
    </div>
  );
}
