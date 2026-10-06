import { HP_AGG, fmtPct } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { PageSection, SectionHead } from "./page-kit";

/**
 * #limits: what this set is not, said before a buyer has to find out.
 *
 * Six items, each with its figure read from the aggregates. They are the
 * objections a careful evaluator raises in the first call — size, estimates,
 * spread, accuracy, footage, empty frames — answered on the page instead.
 */

function items(): { key: string; text: string }[] {
  const a = HP_AGG;
  return [
    {
      key: "Pilot-sized.",
      text: `${a.samples} samples and ${a.minutes.toFixed(1)} minutes in total. Enough to evaluate the format, not to train on.`,
    },
    {
      key: "Guessed frames are estimates.",
      text: `They come from a single camera, scaled to the wearer's hand size, and are flagged. They are ${fmtPct(a.guessedOfDeliveredPct)} of delivered hand-frames.`,
    },
    {
      key: "The share of frames with a 3D pose varies widely.",
      text: `${fmtPct(a.pose.min)} to ${fmtPct(a.pose.max)} per hand. A frame with no 3D pose means the hand was out of view, or was detected in 2D but not triangulated.`,
    },
    {
      key: "No joint-error figure.",
      text: "Accuracy is reported as coverage and misses, not as joint error against marker mocap. No marker ground truth was captured.",
    },
    {
      key: "No camera footage in public previews.",
      text: "Public previews are skeleton renders with no camera footage.",
    },
    {
      key: "Frames with no 3D pose are drawn empty.",
      text: "A value stored on a frame with no state is treated as absent, so a stray value never appears as a hand.",
    },
  ];
}

export function KnownLimits() {
  return (
    <PageSection id="limits" tone="paper" labelledBy="hp-limits-title">
      <Reveal variant="rise">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead id="hp-limits-title" eyebrow="Known limits" lead="What this set is" dim="and is not" />
          </div>
          <ol className="lg:col-span-7">
            {items().map((it, i) => (
              <li
                key={it.key}
                className="grid grid-cols-[30px_minmax(0,1fr)] gap-x-2.5 py-4 text-[14px] leading-[1.6] last:border-b"
                style={{ borderTop: `1px solid ${C.hairline}`, borderBottomColor: C.hairline, color: C.textMid }}
              >
                <span aria-hidden className="pt-[3px] font-mono text-[11px]" style={{ color: C.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p>
                  <span className="font-mono text-[13px]" style={{ color: C.text }}>
                    {it.key}
                  </span>{" "}
                  {it.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </PageSection>
  );
}
