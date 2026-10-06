import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { MethodDiagram } from "./MethodDiagram";
import { PageSection, SectionHead } from "./page-kit";
import { JOINTS_PER_HAND } from "./page-data";

/**
 * #method: how a pose gets onto a frame, in five steps and one picture.
 *
 * The steps are the whole pipeline in the order a frame meets it, each named
 * for what it does to the label: find, triangulate (measured), estimate from
 * one camera (guessed), bridge (bridged), gate. A reader who understands these
 * five can read every lane on the page.
 *
 * Claims worth knowing the source of: "about 9 cm" is the mid pair's baseline
 * in all sixteen calibrations, never the wider primary pair;
 * the single-camera, smoothing and quality-gate descriptions come from the data
 * team's own overview of the pipeline, not from anything measurable here.
 */

const STEPS: { title: string; body: string }[] = [
  {
    title: "Find the hand in two cameras",
    body: "The mid_left and mid_right cameras of a six-camera head rig are calibrated against each other, about 9 cm apart. A hand detector runs on each view.",
  },
  {
    title: `Triangulate to ${JOINTS_PER_HAND} joints`,
    body: `Where both cameras see the hand, the rays are intersected into ${JOINTS_PER_HAND} joints per hand, in the rig frame, in metres. These frames are labelled measured.`,
  },
  {
    title: "Single-camera estimate, flagged",
    body: "Where only one camera can see the hand (occluded, or at the image edge), the pose is a single-camera estimate scaled to the wearer's measured hand size. These frames are labelled guessed in every file.",
  },
  {
    title: "Bridge short gaps, flagged",
    body: "Short gaps between measured frames are filled and labelled bridged. Bridged frames are counted separately. Each hand's track is smoothed over time.",
  },
  {
    title: "Quality gate",
    body: "Each frame passes quality checks before it is delivered. Where another person's hands were in view, the frame is flagged in the delivery metadata instead of being silently dropped.",
  },
];

export function MethodSection() {
  return (
    <PageSection id="method" tone="band" labelledBy="hp-method-title">
      <Reveal variant="rise">
        <SectionHead
          id="hp-method-title"
          eyebrow="How it is measured"
          lead="Stereo triangulation,"
          dim="explained once"
        />

        <div className="mt-8 grid gap-9 md:mt-10 lg:grid-cols-12 lg:items-start lg:gap-14">
          <ol className="lg:col-span-6">
            {STEPS.map((s, i) => (
              <li
                key={s.title}
                className="grid grid-cols-[30px_minmax(0,1fr)] gap-x-3 py-3.5 md:grid-cols-[44px_minmax(0,1fr)] md:gap-x-4 md:py-[18px]"
                style={{ borderTop: `1px solid ${C.hairline}` }}
              >
                <span aria-hidden className="pt-[3px] font-mono text-[11px] tracking-[0.1em]" style={{ color: C.accent }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-base" style={{ color: C.text }}>
                    {s.title}
                  </h3>
                  <p className="mt-1.5 max-w-[34rem] text-[13px] leading-[1.65]" style={{ color: C.textMid }}>
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mx-auto w-full max-w-[640px] lg:sticky lg:top-24 lg:col-span-6 lg:max-w-none">
            <MethodDiagram />
          </div>
        </div>
      </Reveal>
    </PageSection>
  );
}
