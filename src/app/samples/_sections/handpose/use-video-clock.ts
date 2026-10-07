"use client";

import { useEffect, useRef } from "react";

/**
 * The video's clock, for views that are not the state lane.
 *
 * Calls `onTime` with the playback position in seconds: once per frame shown
 * while the video plays (`requestVideoFrameCallback` where the browser has it,
 * with the frame's own timestamp, otherwise a rAF loop), and once on every seek,
 * pause and metadata event, which is how a seek by the lane's slider, the
 * player's own bar or a key reaches a view that is paused.
 *
 * `onTime` is read through a ref, so a caller can pass a fresh closure on every
 * render without the loop being torn down. Nothing here sets React state: the
 * callers write to refs and nodes, as the lane does.
 */
export function useVideoClock(
  video: HTMLVideoElement | null,
  onTime: (seconds: number, playing: boolean) => void,
) {
  const cb = useRef(onTime);
  useEffect(() => {
    cb.current = onTime;
  });

  useEffect(() => {
    if (!video) {
      cb.current(0, false);
      return;
    }
    const hasVfc = "requestVideoFrameCallback" in video;
    let vfc = 0;
    let raf = 0;
    const emit = () => cb.current(video.currentTime, !video.paused && !video.ended);
    const onFrame = (_now: number, meta: VideoFrameCallbackMetadata) => {
      cb.current(meta.mediaTime, true);
      vfc = video.requestVideoFrameCallback(onFrame);
    };
    const loop = () => {
      cb.current(video.currentTime, true);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (hasVfc) {
        if (!vfc) vfc = video.requestVideoFrameCallback(onFrame);
      } else if (!raf) {
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      if (vfc) video.cancelVideoFrameCallback(vfc);
      if (raf) cancelAnimationFrame(raf);
      vfc = 0;
      raf = 0;
      emit();
    };

    const synced = ["seeking", "seeked", "loadedmetadata", "timeupdate"] as const;
    video.addEventListener("play", start);
    video.addEventListener("pause", stop);
    video.addEventListener("ended", stop);
    for (const ev of synced) video.addEventListener(ev, emit);

    emit();
    if (!video.paused) start();

    return () => {
      if (vfc) video.cancelVideoFrameCallback(vfc);
      if (raf) cancelAnimationFrame(raf);
      video.removeEventListener("play", start);
      video.removeEventListener("pause", stop);
      video.removeEventListener("ended", stop);
      for (const ev of synced) video.removeEventListener(ev, emit);
    };
  }, [video]);
}
