"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { HP_FPS, STATE_DRAWING, STATE_LABEL, mmss, type HandPoseSample, type StateKey } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { StateGlyph } from "./glyphs";
import { HandReadout } from "./HandReadout";
import { HandStage3D } from "./HandStage3D";
import { StateLane } from "./StateLane";
import { useJoints } from "./use-joints";
import { useLane } from "./use-lane";
import { useVideoClock } from "./use-video-clock";
import { ViewerMedia, mediaKind } from "./viewer-media";
import { VirtualClock } from "./virtual-clock";
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
 * What a sample lacks, it lacks gracefully. No camera video in public (`poster`
 * and `lane` tiers): the 3D view takes the video's place, on a `VirtualClock`
 * with its own play button, so the readout and the lane still follow one clock.
 * Joints that fail to load: the 3D panel says so and offers a retry.
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

/** Play and pause for a sample with no video: the clock's only transport besides the lane's keys. */
function ClockTransport({ clock, seconds }: { clock: VirtualClock; seconds: number }) {
  const [playing, setPlaying] = useState(false);
  const time = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const on = () => setPlaying(!clock.paused);
    clock.addEventListener("play", on);
    clock.addEventListener("pause", on);
    return () => {
      clock.removeEventListener("play", on);
      clock.removeEventListener("pause", on);
      clock.pause();
    };
  }, [clock]);
  useVideoClock(clock.asVideo(), (t) => {
    if (time.current) time.current.textContent = mmss(t);
  });
  return (
    <div className="mt-2.5 flex items-center gap-3">
      <button
        type="button"
        onClick={() => (clock.paused ? clock.play() : clock.pause())}
        aria-label={playing ? "Pause the 3D pose" : "Play the 3D pose"}
        className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full"
        style={{ background: C.accent, color: "var(--sm-on-accent)" }}
      >
        {playing ? <Pause aria-hidden className="h-4 w-4" /> : <Play aria-hidden className="ml-0.5 h-4 w-4" />}
      </button>
      <p className="bp-mono text-[11px]" style={{ color: C.textMid }}>
        <span ref={time}>0:00</span> / {mmss(seconds)}
      </p>
      <p className="bp-mono ml-auto text-right text-[10px]" style={{ color: C.textDim }}>
        3D pose only · no camera video in public
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
  const [videoEl, setVideo] = useState<HTMLVideoElement | null>(null);
  // No camera video in public: the 3D pose plays on a clock of its own.
  const clock = useMemo(() => (kind === "video" ? null : new VirtualClock(hp.frames / HP_FPS)), [kind, hp.frames]);
  const video = clock ? clock.asVideo() : videoEl;
  const [lane, retryLane] = useLane(hp.lane);
  const [joints, retryJoints] = useJoints(hp.slug);
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
      <StateLane slug={hp.slug} title={title} lane={lane.lane} video={video} initialFrame={initialFrame} />
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

  return (
    <div className="@container [--hp-sq:clamp(280px,calc(100svh_-_430px),520px)]">
      <div className="grid gap-5 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-[var(--hp-sq)_var(--hp-sq)_minmax(15rem,1fr)] @min-[64rem]:gap-x-6">
        {clock ? (
          // No video: the 3D view in its place, with a transport under it.
          <div className="min-w-0 @min-[40rem]:col-span-2 @min-[64rem]:col-span-2">
            <HandStage3D joints={joints} onRetry={retryJoints} video={video} wide />
            <ClockTransport clock={clock} seconds={hp.frames / HP_FPS} />
          </div>
        ) : (
          <>
            <div className="min-w-0">
              <ViewerMedia hp={hp} title={title} kind="video" videoRef={setVideo} />
            </div>
            <div className="min-w-0">
              <HandStage3D joints={joints} onRetry={retryJoints} video={video} />
            </div>
          </>
        )}
        <aside aria-label="Readout and key" className="flex min-w-0 flex-col gap-5 @min-[40rem]:col-span-2 @min-[64rem]:col-span-1">
          <div>
            <h3 className="bp-mono mb-1.5 text-[10px]" style={{ color: C.textDim }}>
              Readout, this frame
            </h3>
            <HandReadout track={track} video={video} />
          </div>
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
