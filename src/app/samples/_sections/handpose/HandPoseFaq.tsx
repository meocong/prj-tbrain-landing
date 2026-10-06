"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { fmtPct } from "@/lib/samples/handpose";
import { requestUrl } from "@/lib/samples/request-link";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { PageSection, SectionHead } from "./page-kit";
import { NO_GROUND_TRUTH, SAMPLES, joinAnd, numberWord, videoSampleNumbers } from "./page-data";
import { OpenRecordLink, TrackedLink } from "./page-links";

/**
 * #faq: the questions a buyer asks, answered where they ask them.
 *
 * A disclosure per question, written as a `<button aria-expanded>` inside the
 * heading it answers rather than `<details>`: the record dialog's Tab trap does
 * not know `<summary>`, and one pattern is better than two. The first answer is
 * open. Figures in the answers come from the data, not from this file.
 */

interface Item {
  q: string;
  a: ReactNode;
}

function items(): Item[] {
  const s10 = SAMPLES.find((s) => s.n === 10);
  const link = "underline decoration-1 underline-offset-4";
  const videos = joinAnd(videoSampleNumbers());

  return [
    {
      q: "What are the coordinate frame and units?",
      a: "Joints are in metres in the head-rig frame, 21 per hand, at 30 fps. The frame belongs to the wearer's rig, so it moves with the head.",
    },
    {
      q: 'What does "guessed" mean?',
      a: "Only one camera saw the hand. The pose is a single-camera estimate scaled to the wearer's measured hand size, kept only where a 2D hand detection confirms it. It is flagged in every file, and drawn dashed with hollow joints in the previews.",
    },
    {
      q: "Why do some samples have a low share of 3D pose?",
      a: (
        <>
          A frame has no 3D pose when the hand was out of view, or was detected in 2D but not triangulated.
          {s10 ? (
            <>
              {" "}
              Sample {s10.n} has a 3D pose on {fmtPct(s10.left.posePct)} of left-hand frames and{" "}
              {fmtPct(s10.right.posePct)} of right-hand frames;{" "}
              <OpenRecordLink slug={s10.slug} from="faq" className={link} style={{ color: C.accent }}>
                open it
              </OpenRecordLink>{" "}
              to see where the gaps fall.
            </>
          ) : null}{" "}
          <em style={{ color: C.text }}>
            {NO_GROUND_TRUTH}
          </em>
        </>
      ),
    },
    {
      q: "Which formats do you deliver?",
      a: "Metrics as CSV and lanes as JSON in public. The passcode pack holds joints as .npz with a README and checksums. Full delivery adds renders, the full per-frame model output, calibration and the raw camera files, .mcap and IMU.",
    },
    {
      q: "Can I use this commercially?",
      a: "On request. Commercial terms, and any third-party model licences that apply to the files, are confirmed in the licence agreement before any full delivery.",
    },
    {
      q: "Can you capture my tasks?",
      a: (
        <>
          Yes. Tell us the task and the environment and we will scope a collection.{" "}
          <TrackedLink
            href={requestUrl({ from: "hand-pose-faq" })}
            event="handpose_request_click"
            params={{ from: "hand-pose-faq" }}
            className={link}
            style={{ color: C.accent }}
          >
            Contact us
          </TrackedLink>
          .
        </>
      ),
    },
    {
      q: `Why do only ${numberWord(videoSampleNumbers().length)} samples have a video?`,
      a: `Samples ${videos} have public video with the hand pose drawn over it, because their operators agreed to a public preview. Every sample has its metrics and lane open, and video for the others is on request.`,
    },
  ];
}

export function HandPoseFaq() {
  const base = useId();
  const list = items();
  // More than one can be open: a buyer comparing two answers should not have
  // the first close under them.
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <PageSection id="faq" tone="band" labelledBy="hp-faq-title">
      <Reveal variant="rise">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
          {/* Sticky, so the headline stays beside the answers however many are open. */}
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <SectionHead id="hp-faq-title" eyebrow="FAQ" lead="Questions" dim="buyers ask" />
          </div>

          <div className="lg:col-span-7">
            {list.map((it, i) => {
              const isOpen = open.has(i);
              return (
                <div
                  key={it.q}
                  style={{ borderTop: `1px solid ${C.hairline}`, ...(i === list.length - 1 ? { borderBottom: `1px solid ${C.hairline}` } : null) }}
                >
                  <h3 className="text-base">
                    <button
                      type="button"
                      id={`${base}-q${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`${base}-a${i}`}
                      onClick={() => toggle(i)}
                      className="flex w-full items-center justify-between gap-4 py-[18px] text-left text-base"
                      style={{ color: C.text, fontWeight: 500 }}
                    >
                      {it.q}
                      <ChevronDown
                        aria-hidden
                        className="h-[18px] w-[18px] flex-none transition-transform"
                        style={{ transform: isOpen ? "rotate(180deg)" : undefined, color: isOpen ? C.accent : C.textDim }}
                      />
                    </button>
                  </h3>
                  <div
                    id={`${base}-a${i}`}
                    role="group"
                    aria-labelledby={`${base}-q${i}`}
                    hidden={!isOpen}
                    className="max-w-[40rem] pb-5 text-[14px] leading-[1.7]"
                    style={{ color: C.textMid }}
                  >
                    {it.a}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </PageSection>
  );
}
