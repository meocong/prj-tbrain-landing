"use client";

import { useState } from "react";
import type { HandPoseSample } from "@/lib/samples/handpose";
import { C } from "../tokens";

/**
 * What the record shows in place of footage. There is never a camera frame here:
 * a public preview is a skeleton drawn from the joints on a dark ground, and
 * which samples have one — a video, a single still, or nothing — is decided in
 * the curation file and arrives in the metrics as `preview`.
 *
 *   video   a sample whose operator consented to a public preview (13, 14)
 *   poster  one skeleton still
 *   lane    no media at all: metrics and the state lane only
 *
 * `preview` is the authority, not the mere presence of a path: a media path in
 * the metrics of a sample whose tier is `lane` must not put that sample on show
 * by being there.
 */
export type MediaKind = "video" | "poster" | "lane";

export function mediaKind(hp: HandPoseSample): MediaKind {
  if (hp.preview === "video" && hp.media.video) return "video";
  if (hp.preview !== "lane" && hp.media.still) return "poster";
  return "lane";
}

/** The renders paint on this ground; it shows only until the first frame does. */
const MEDIA_BG = "#06080E";

/**
 * The square the render sits in. Beside the legend its width is the grid
 * column's, which the viewer sizes from the pane's height (`--hp-vs`); stacked
 * above it, in a narrow pane, it takes the pane's width up to a ceiling, so a
 * phone gets the whole column and a tablet does not get a 560px square.
 */
const FIGURE = "m-0 max-w-[400px] @min-[34rem]:max-w-none";
const FRAME = "bp-frame relative aspect-square w-full overflow-hidden";
const FRAME_STYLE = { background: MEDIA_BG, border: `1px solid ${C.hairline}` } as const;

export function ViewerMedia({
  hp,
  title,
  kind,
  videoRef,
}: {
  hp: HandPoseSample;
  title: string;
  kind: Exclude<MediaKind, "lane">;
  /** State setter, not a ref object: the lane re-binds when the element arrives. */
  videoRef: (el: HTMLVideoElement | null) => void;
}) {
  const [failed, setFailed] = useState(false);

  if (kind === "video") {
    return (
      <figure className={FIGURE}>
        <div className={FRAME} style={FRAME_STYLE}>
          {/* The reader's own transport: controls, no autoplay, no loop. With
              controls it is not "ambient" video to the header's "Pause
              animations" switch, which stills only muted video WITHOUT them,
              so the reader's Play is never overridden. Muted because the
              render has no audio track, which also keeps it out of the
              captions rule (WCAG 1.2.2 is about audio). */}
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            src={hp.media.video ?? undefined}
            poster={hp.media.still ?? hp.media.poster ?? undefined}
            muted
            playsInline
            controls
            preload="metadata"
            aria-label={`${title}, camera video with the hand pose drawn over it`}
            onError={() => setFailed(true)}
          />
        </div>
        <figcaption className="bp-mono mt-2 text-[10px]" style={{ color: C.textDim }}>
          Camera video, hand pose overlay · faces blurred
        </figcaption>
        {failed && (
          <p role="alert" className="mt-1 text-[11px]" style={{ color: C.danger }}>
            The video could not be loaded. The state lane below still works.
          </p>
        )}
      </figure>
    );
  }

  return (
    <figure className={FIGURE}>
      <div className={FRAME} style={FRAME_STYLE}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hp.media.still ?? undefined}
          alt={`Skeleton render of both hands, ${title}`}
          width={720}
          height={720}
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <figcaption className="bp-mono mt-2 flex justify-between gap-3 text-[10px]" style={{ color: C.textDim }}>
        <span>Skeleton render, wearer view</span>
        <span>Preview on request</span>
      </figcaption>
    </figure>
  );
}

/**
 * A sample with no media. Hatched, because on this site hatching means "nothing
 * here", never footage, and the line sits on a solid chip so the hatch does not
 * run through the type.
 */
export function LaneOnlyPanel() {
  return (
    <div
      className="flex items-center px-3 py-4"
      style={{
        border: `1px solid ${C.hairline}`,
        backgroundImage: `repeating-linear-gradient(-45deg, ${C.hairline} 0 1px, transparent 1px 10px)`,
      }}
    >
      <p className="px-2.5 py-1.5 text-[12px]" style={{ background: C.base, color: C.textMid }}>
        Metrics and lane only. Preview on request.
      </p>
    </div>
  );
}
