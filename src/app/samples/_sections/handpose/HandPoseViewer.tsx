"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";
import { fmtCount, handPoseSample, type HandPoseLane, type HandPoseSample } from "@/lib/samples/handpose";
import { C, EASE, type Sample } from "../tokens";
import { StateLane } from "./StateLane";
import { ViewerLegend } from "./ViewerLegend";
import { LaneOnlyPanel, ViewerMedia, mediaKind } from "./viewer-media";
import { LaneSkeleton } from "./viewer-skeleton";
import { ViewerSections, ViewerStrip } from "./viewer-spec";
import { LANE_ROW, LANE_ROW_HERO, clampFrame, frameMidTime } from "./viewer-frame";

/**
 * The body of the record modal for a hand-pose sample: what a buyer opens a
 * sample to do, which is to see how a hand's pose was obtained, frame by frame.
 *
 *   left   the skeleton render (or its still, or a note that there is none), the
 *          legend, and the state lane under which every frame can be read;
 *   right  the strip of four figures and the record's sections.
 *
 * `SampleModal` keeps the shell — header, footer, focus trap, Escape — and loads
 * this with `next/dynamic` only where hand pose is published, so a build without
 * the category carries none of it.
 *
 * Layout
 * ──────
 * From `lg` the two panes sit side by side and EACH scrolls on its own. The
 * generic record's media pane never scrolls, because the video and a one-line
 * readout fit; a legend, a lane, a readout and a table behind a disclosure do
 * not fit under a square video on a 720px laptop, and clipping them would hide
 * the very thing this record is for. Below `lg` it is one column, in the order a
 * reader needs it: the picture, what its drawing means, the lane, then the
 * numbers.
 *
 * Both panes are `shrink-0`: in the one-column layout the body is a scrolling flex
 * column, and a pane allowed to shrink (`min-h-0` lets it) squeezes to fit the
 * body instead of letting the body scroll, so its content spills over the next
 * pane's.
 *
 * The left pane is a CONTAINER, and its layout asks the pane's width rather than
 * the viewport's. The pane is 590px on a 1280px laptop and 340px inside a phone's
 * single column, but also 600px in a tablet's: a viewport breakpoint cannot tell
 * those apart, the pane can.
 */

type LaneState = { status: "loading" } | { status: "ready"; lane: HandPoseLane } | { status: "error" };

const isLane = (j: unknown): j is HandPoseLane => {
  const l = j as Partial<HandPoseLane> | null;
  return !!l && typeof l.frames === "number" && l.frames > 0 && Array.isArray(l.left) && Array.isArray(l.right);
};

/** The lane JSON is a few KB, fetched when the record opens rather than shipped in the bundle. */
function useLane(url: string) {
  const [state, setState] = useState<LaneState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const abort = new AbortController();
    fetch(url, { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json: unknown) => {
        if (!isLane(json)) throw new Error("not a lane");
        setState({ status: "ready", lane: json });
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ status: "error" });
      });
    return () => abort.abort();
  }, [url, attempt]);

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return [state, retry] as const;
}

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

/** The two hands' counts in a sentence: the lane's text alternative, visible to everyone. */
function Sentence({ hp }: { hp: HandPoseSample }) {
  const hand = (name: string, s: HandPoseSample["left"]) =>
    `${name} hand: measured for ${fmtCount(s.measured)} frames, guessed for ${fmtCount(s.guessed)}, bridged for ${fmtCount(s.bridged)}, no 3D pose for ${fmtCount(s.none)}.`;
  return (
    <p className="mt-4 border-l-2 pl-2.5 text-[11px] leading-[1.55]" style={{ borderColor: C.rule, color: C.textMid }}>
      {hand("Left", hp.left)} {hand("Right", hp.right)}
    </p>
  );
}

function LaneError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert">
      <p className="text-[12px]" style={{ color: C.danger }}>
        The state lane for this sample could not be loaded.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="bp-mono mt-2 rounded-full px-3 py-1.5 text-[10px]"
        style={{ border: `1px solid ${C.rule}`, color: C.text }}
      >
        Try again
      </button>
    </div>
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
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [lane, retryLane] = useLane(hp.lane);
  const kind = mediaKind(hp);

  /* A start frame, from `?f=` or `openRecord(slug, frame)`. The video is sought
     here rather than in the lane, because the video exists from the first render
     and the lane only once its JSON lands — and a record whose lane fails to load
     should still open where the link said. Not before `loadedmetadata`: Safari
     ignores a `currentTime` set earlier. */
  useEffect(() => {
    if (!video || initialFrame == null) return;
    const seek = () => {
      video.currentTime = frameMidTime(clampFrame(initialFrame, hp.frames));
    };
    if (video.readyState >= 1) {
      seek();
      return;
    }
    video.addEventListener("loadedmetadata", seek, { once: true });
    return () => video.removeEventListener("loadedmetadata", seek);
  }, [video, initialFrame, hp.frames]);

  /* The longest run with no 3D pose is counted from the exclusive state array,
     in the data build: `longestNoPoseFrames`. Never the pipeline's own
     `longestGapFrames`, which disagrees with the lane on 25 of the 32 hands and
     would print a figure a reader cannot find on it. A build of the metrics
     without the field shows a dash, not a guess. */
  const longest = {
    left: (hp.left.longestNoPoseFrames as number | undefined) ?? null,
    right: (hp.right.longestNoPoseFrames as number | undefined) ?? null,
  };

  const laneOnly = kind === "lane";
  const laneBlock =
    lane.status === "ready" ? (
      <StateLane
        slug={hp.slug}
        title={sample.title}
        lane={lane.lane}
        video={video}
        initialFrame={initialFrame}
        hero={laneOnly}
      />
    ) : lane.status === "loading" ? (
      <LaneSkeleton rowHeight={laneOnly ? LANE_ROW_HERO : LANE_ROW} />
    ) : (
      <LaneError onRetry={retryLane} />
    );

  return (
    <motion.div
      className={[
        "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
        "lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:overflow-hidden",
        // The square the render gets beside the legend. A ceiling on a phone;
        // from `lg` it is what the pane's height leaves after the lane block, so
        // the render, the lane and its readout can share a 900px laptop without
        // scrolling. The 94dvh and 940px are the panel's own cap, `HP_PANEL_MAX`
        // in SampleModal, which this cannot import without pulling the whole
        // viewer into the modal's bundle.
        "[--hp-vs:420px] lg:[--hp-vs:clamp(240px,calc(min(94dvh,940px)_-_480px),380px)]",
      ].join(" ")}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.12 }}
    >
      {/* ── Left: the picture, how to read it, and the lane ── */}
      <div
        className="@container min-h-0 shrink-0 border-b px-5 pb-4 pt-3.5 lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:border-b-0 lg:border-r lg:px-6"
        style={{ borderColor: C.hairlineSoft }}
      >
        {laneOnly ? (
          /* No media: the lane is the preview. One column, the lane first and the
             legend after it where there is room; on a phone the legend stays
             ahead of the lane, as it is for every other sample. */
          <div className="flex flex-col gap-5">
            <div>
              <LaneOnlyPanel />
              <Sentence hp={hp} />
            </div>
            <ViewerLegend wide className="@min-[34rem]:order-3" />
            <div className="@min-[34rem]:order-2">{laneBlock}</div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 @min-[34rem]:grid-cols-[minmax(0,var(--hp-vs))_minmax(13rem,1fr)] @min-[34rem]:gap-x-5">
              <div className="min-w-0">
                <ViewerMedia hp={hp} title={sample.title} kind={kind} videoRef={setVideo} />
              </div>
              <ViewerLegend />
            </div>
            {/* Under both columns rather than under the picture: full width it
                is two lines, in the picture's column it was three, and the
                height is what decides whether the lane fits on a laptop. */}
            <Sentence hp={hp} />
            <div className="mt-4">{laneBlock}</div>
          </>
        )}
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
