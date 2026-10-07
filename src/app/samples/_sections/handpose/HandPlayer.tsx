"use client";

import { useEffect, useRef, useState } from "react";
import { HP_FPS, STATE_DRAWING, STATE_LABEL, type HandPoseSample, type StateKey } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { StateGlyph } from "./glyphs";
import { HandReadout } from "./HandReadout";
import { HandStage3D } from "./HandStage3D";
import { StateLane } from "./StateLane";
import { useJoints } from "./use-joints";
import { useLane } from "./use-lane";
import { useVideoClock } from "./use-video-clock";
import { LaneOnlyPanel, ViewerMedia, mediaKind } from "./viewer-media";
import { LANE_ROW, clampFrame, frameMidTime } from "./viewer-frame";
import { Sentence } from "./viewer-sentence";
import { LaneSkeleton } from "./viewer-skeleton";

/**
 * One sample, played: the camera video, the same pose in 3D, the numbers for the
 * frame on show and the state lane, all on ONE clock.
 *
 * The clock is the video. The lane's slider seeks it, the player's own bar seeks
 * it, a key on the lane plays and pauses it; the lane, the 3D view and the readout
 * each follow it from `requestVideoFrameCallback` (`useVideoClock`), writing to
 * refs and nodes. Nothing here sets React state per frame.
 *
 * What a sample lacks, it lacks gracefully. No camera video (`poster`): its
 * skeleton still, no 3D. No media at all (`lane`): the lane and the numbers. A
 * video whose 3D joints are not published yet: the video and the lane, and a
 * line in the 3D panel's place saying so.
 *
 * Mount it with a `key` per sample: a new sample is a new clock.
 */

const KEY_STATES: StateKey[] = ["measured", "guessed", "bridged", "none"];

/** The four marks, in short: what each state looks like on the skeleton, by hand colour. */
function KeyList() {
  return (
    <ul aria-label="How each state is drawn" className="grid gap-x-4 gap-y-1.5 text-[11px] @min-[24rem]:grid-cols-2 @min-[64rem]:grid-cols-1" style={{ color: C.textMid }}>
      {KEY_STATES.map((k) => (
        <li key={k} className="flex items-center gap-2">
          <StateGlyph state={k} width={34} />
          <span>
            <span style={{ color: C.value }}>{STATE_LABEL[k]}</span>
            <span className="sr-only">: </span>
            <span className="hidden @min-[64rem]:inline" style={{ color: C.textDim }}>
              {" "}
              · {STATE_DRAWING[k].toLowerCase()}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function NoVideoPanel({ message }: { message: string }) {
  return (
    <div
      className="bp-frame flex aspect-square w-full max-w-[400px] items-center justify-center p-6 text-center @min-[34rem]:max-w-none"
      style={{
        border: `1px solid ${C.hairline}`,
        backgroundImage: `repeating-linear-gradient(-45deg, ${C.hairline} 0 1px, transparent 1px 10px)`,
      }}
    >
      <p className="max-w-[26ch] px-2.5 py-1.5 text-[12px] leading-[1.55]" style={{ background: C.base, color: C.textMid }}>
        {message}
      </p>
    </div>
  );
}

export function HandPlayer({
  hp,
  title,
  initialFrame,
  onSettle,
}: {
  hp: HandPoseSample;
  title: string;
  /** Frame to start on: `?f=` in the link. */
  initialFrame: number | null;
  /** The frame the reader stopped on, a moment after a seek or a pause. For the address bar. */
  onSettle?: (frame: number) => void;
}) {
  const kind = mediaKind(hp);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [lane, retryLane] = useLane(hp.lane);
  const [joints, retryJoints] = useJoints(kind === "video" ? hp.slug : null);
  const track = joints.status === "ready" ? joints.track : null;

  /* A start frame goes to the video, not the lane: the video exists from the
     first render and the lane only once its JSON lands. Not before
     `loadedmetadata`: Safari ignores a `currentTime` set earlier. */
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

  /* Tell the host where the clip came to rest, for the address bar. */
  const settle = useRef(0);
  const rested = useRef(initialFrame == null ? 0 : clampFrame(initialFrame, hp.frames));
  const onSettleRef = useRef(onSettle);
  useEffect(() => {
    onSettleRef.current = onSettle;
  });
  useVideoClock(video, (t, playing) => {
    window.clearTimeout(settle.current);
    if (playing || !onSettleRef.current) return;
    settle.current = window.setTimeout(() => {
      const f = clampFrame(Math.floor(t * HP_FPS + 1e-3), hp.frames);
      // Only a move: opening on a frame is not news.
      if (f === rested.current) return;
      rested.current = f;
      onSettleRef.current?.(f);
    }, 500);
  });
  useEffect(() => () => window.clearTimeout(settle.current), []);

  const laneBlock =
    lane.status === "ready" ? (
      <StateLane slug={hp.slug} title={title} lane={lane.lane} video={video} initialFrame={initialFrame} hero={kind === "lane"} />
    ) : lane.status === "loading" ? (
      <LaneSkeleton rowHeight={LANE_ROW} />
    ) : (
      <div role="alert">
        <p className="text-[12px]" style={{ color: C.danger }}>
          The state lane for this sample could not be loaded.
        </p>
        <button
          type="button"
          onClick={retryLane}
          className="bp-mono mt-2 rounded-full px-3 py-1.5 text-[10px]"
          style={{ border: `1px solid ${C.rule}`, color: C.text }}
        >
          Try again
        </button>
      </div>
    );

  if (kind === "lane") {
    return (
      <div className="@container">
        <LaneOnlyPanel />
        <div className="mt-6">{laneBlock}</div>
        <Sentence hp={hp} />
      </div>
    );
  }

  return (
    <div className="@container [--hp-sq:clamp(280px,calc(100svh_-_430px),520px)]">
      <div className="grid gap-5 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-[var(--hp-sq)_var(--hp-sq)_minmax(15rem,1fr)] @min-[64rem]:gap-x-6">
        <div className="min-w-0">
          <ViewerMedia hp={hp} title={title} kind={kind} videoRef={setVideo} />
        </div>
        <div className="min-w-0">
          {kind === "video" ? (
            <HandStage3D joints={joints} onRetry={retryJoints} video={video} />
          ) : (
            <NoVideoPanel message="The camera video and the 3D view are not published for this sample. The lane and the numbers below are." />
          )}
        </div>
        <aside aria-label="Readout and key" className="flex min-w-0 flex-col gap-5 @min-[40rem]:col-span-2 @min-[64rem]:col-span-1">
          {kind === "video" && (
            <div>
              <h3 className="bp-mono mb-1.5 text-[10px]" style={{ color: C.textDim }}>
                Readout, this frame
              </h3>
              <HandReadout track={track} video={video} />
            </div>
          )}
          <div>
            <h3 className="bp-mono mb-2 text-[10px]" style={{ color: C.textDim }}>
              Key
            </h3>
            <KeyList />
          </div>
        </aside>
      </div>

      <div className="mt-6">{laneBlock}</div>
      <Sentence hp={hp} />
    </div>
  );
}
