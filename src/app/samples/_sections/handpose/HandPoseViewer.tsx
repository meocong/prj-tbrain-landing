"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";
import { handPoseSample, type HandPoseSample } from "@/lib/samples/handpose";
import { C, EASE, type Sample } from "../tokens";
import { HandPlayer } from "./HandPlayer";
import { ViewerSections, ViewerStrip } from "./viewer-spec";

/**
 * The body of the record modal for a hand-pose sample: what a buyer opens a
 * sample to do, which is to see how a hand's pose was obtained, frame by frame.
 *
 *   left   the player (`HandPlayer`): camera video and the same pose in 3D on one
 *          clock, the readout, the key and the state lane; for a sample with no
 *          video, its still or the lane alone;
 *   right  the strip of four figures and the record's sections.
 *
 * `SampleModal` keeps the shell — header, footer, focus trap, Escape — and loads
 * this with `next/dynamic` only where hand pose is published, so a build without
 * the category carries none of it.
 *
 * From `lg` the two panes sit side by side and EACH scrolls on its own: the
 * player is taller than the panel on a laptop, and clipping it would hide the
 * lane this record is for. Below `lg` it is one column, the player first. Both
 * panes are `shrink-0`: in the one-column layout the body is a scrolling flex
 * column, and a pane allowed to shrink squeezes to fit the body instead of
 * letting the body scroll.
 */

/**
 * Whether the panes scroll on their own, which is when the right one needs to be
 * reachable by keyboard. Below `lg` the record is one column inside the dialog's
 * body, and a focus stop on a region that does not scroll would be a stop for
 * nothing.
 */
function useWideLayout() {
  return useSyncExternalStore(
    (notify) => {
      const query = window.matchMedia("(min-width: 1024px)");
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false,
  );
}

export function HandPoseViewer({ sample, initialFrame }: { sample: Sample; initialFrame: number | null }) {
  const hp = handPoseSample(sample.slug);
  if (!hp) {
    return (
      <p role="alert" className="flex-1 px-5 py-10 text-[13px]" style={{ color: C.danger }}>
        No metrics are published for this sample.
      </p>
    );
  }
  return <Viewer sample={sample} hp={hp} initialFrame={initialFrame} />;
}

function Viewer({ sample, hp, initialFrame }: { sample: Sample; hp: HandPoseSample; initialFrame: number | null }) {
  const reduce = useReducedMotion();
  const wide = useWideLayout();

  /* The longest run with no 3D pose is counted from the exclusive state array,
     in the data build: `longestNoPoseFrames`. Never the pipeline's own
     `longestGapFrames`, which disagrees with the lane on 25 of the 32 hands and
     would print a figure a reader cannot find on it. A build of the metrics
     without the field shows a dash, not a guess. */
  const longest = {
    left: (hp.left.longestNoPoseFrames as number | undefined) ?? null,
    right: (hp.right.longestNoPoseFrames as number | undefined) ?? null,
  };

  return (
    <motion.div
      className={[
        "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
        "lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)] lg:overflow-hidden",
      ].join(" ")}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.12 }}
    >
      {/* ── Left: the player ── */}
      <div
        className="min-h-0 shrink-0 border-b px-5 pb-5 pt-4 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:px-6"
        style={{ borderColor: C.hairlineSoft }}
      >
        {/* With no frame in the link, the poster frame: both hands measured, so
            the video, the 3D view and the readout open on something to see. */}
        <HandPlayer hp={hp} title={sample.title} initialFrame={initialFrame ?? hp.posterFrame} />
      </div>

      {/* ── Right: the four figures and the record ── */}
      <div
        className="min-h-0 shrink-0 lg:h-full lg:overflow-y-auto lg:overscroll-contain"
        /* A pane that scrolls and holds nothing focusable is out of a keyboard
           reader's reach (WCAG 2.1.1), so it becomes a named region they can
           stop on and scroll. The ring goes INSIDE the pane: outside it would be
           clipped by the body, which hides overflow. */
        {...(wide ? { tabIndex: 0, role: "region", "aria-label": "Record details" } : {})}
        style={{ outlineColor: C.accent, outlineOffset: -3 }}
      >
        <ViewerStrip hp={hp} />
        <div className="px-5 pb-6 lg:px-7">
          <ViewerSections hp={hp} sample={sample} longest={longest} />
        </div>
      </div>
    </motion.div>
  );
}
