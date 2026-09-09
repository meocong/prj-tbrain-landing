"use client";

import { useCallback, useRef, useState } from "react";
import { clipSrc, posterSrc } from "@/lib/samples/categories";
import { C, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * The teleoperation set, playing.
 *
 * This category showed a line drawing and a count while the dataset sat in
 * Drive: 11 episodes, three synchronised 640x480 cameras each, 33 files. The
 * count was true and it was not the product.
 *
 * The three cameras are the point, so they play together rather than as three
 * separate cards. A robot policy trained on this reads head, left and right on
 * one clock; showing them side by side on one transport is the closest a web
 * page gets to saying that. One `play` drives all three, and the two followers
 * are seeked to the leader on every scrub, so a frame in one is the same
 * instant in the others.
 *
 * Below it, all 11 head-camera episodes. Same task in every one — "Pick up all
 * the items on the table and put them into the bin on the right" — which is
 * what makes it a training set rather than a showreel, and the reason the strip
 * is worth showing at all: the variation between episodes IS the data.
 *
 * Every figure here is counted off the files, not read from `meta/info.json`,
 * which disagrees with its own disk — it declares 10 episodes, 13,465 frames
 * and 30 videos where the directory holds 11, 14,076 and 33.
 */

const EPISODES = Array.from({ length: 11 }, (_, i) => `teleop-ep${String(i).padStart(2, "0")}`);

const VIEWS = [
  { slug: "teleop-ep00", label: "Head" },
  { slug: "teleop-ep00-left", label: "Left" },
  { slug: "teleop-ep00-right", label: "Right" },
];

const TASK = "Pick up all the items on the table and put them into the bin on the right.";

export function TeleopSet() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  const [playing, setPlaying] = useState(false);

  const all = useCallback((fn: (v: HTMLVideoElement) => void) => {
    refs.current.forEach((v) => v && fn(v));
  }, []);

  const toggle = useCallback(() => {
    if (playing) {
      all((v) => v.pause());
      setPlaying(false);
      return;
    }
    // Re-align before starting: three elements that have each drifted by a
    // frame during buffering are no longer one instant.
    const lead = refs.current[0];
    if (lead) all((v) => (v.currentTime = lead.currentTime));
    all((v) => v.play().catch(() => {}));
    setPlaying(true);
  }, [playing, all]);

  /** Followers chase the leader, so the three never separate. */
  const resync = useCallback(() => {
    const lead = refs.current[0];
    if (!lead) return;
    refs.current.slice(1).forEach((v) => {
      if (v && Math.abs(v.currentTime - lead.currentTime) > 0.12) v.currentTime = lead.currentTime;
    });
  }, []);

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
            Play the set
          </h2>

          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed" style={{ color: C.textMid }}>
            Three cameras on one clock, which is what a policy reads. Below them, every episode in
            the set — one task, eleven attempts, and the variation between them is the data.
          </p>

          {/* Which of the two products this is. The tier table on this page
              prices "Egocentric + gripper (UMI)", a person wearing a gripper
              rig; the set below is a robot. Both are teleoperation and the page
              named only one of them for weeks. */}
          <p
            className="mt-4 max-w-2xl px-4 py-3 text-[13px] leading-relaxed"
            style={{ border: `1px solid ${C.hairline}`, background: C.band, color: C.textMid }}
          >
            This set is the robot side: an <span className="font-mono">openarm_gripper_follower</span>,
            two arms, seven joints each plus a gripper. The configuration priced above it — Egocentric
            + gripper (UMI) — is the human side, a person wearing a wrist rig, and it delivers{" "}
            <span className="font-mono">head.mp4 + wrist.mp4 + imu.csv + gripper_state.json</span>{" "}
            instead. Both are teleoperation; they are not the same recording.
          </p>

          <div className="mt-8 grid gap-2 sm:grid-cols-3">
            {VIEWS.map((v, i) => (
              <div key={v.slug} className="relative" style={{ background: C.band }}>
                <video
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  src={clipSrc(v.slug)}
                  poster={posterSrc(v.slug)}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  onTimeUpdate={i === 0 ? resync : undefined}
                  className="block w-full"
                  style={{ aspectRatio: "4 / 3", objectFit: "cover" }}
                />
                <span
                  className="pointer-events-none absolute left-2 top-2 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em]"
                  style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
                >
                  {v.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              type="button"
              onClick={toggle}
              className="rounded-full px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-transform active:scale-[0.98]"
              style={{ border: `1px solid ${C.rule}`, color: C.text }}
            >
              {playing ? "Pause all three" : "Play all three"}
            </button>
            <span className="font-mono text-[11.5px]" style={{ color: C.textDim }}>
              Episode 0 · 640×480 · 30 fps · 16-dimensional state and action per frame
            </span>
          </div>

          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
            All 11 episodes · head camera
          </p>
          <p className="mt-2 max-w-2xl text-[13px]" style={{ color: C.textMid }}>
            {TASK}
          </p>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-4">
            {EPISODES.map((slug, i) => (
              <Tile key={slug} slug={slug} index={i} />
            ))}
          </div>

          <p className="mt-4 max-w-2xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
            Counted off the files: 11 episodes, 14,076 frames, 33 videos. The set&apos;s own
            <code className="mx-1 font-mono">meta/info.json</code> declares 10, 13,465 and 30, and a
            LeRobot loader reading its <code className="mx-1 font-mono">splits</code> would drop the
            last episode without saying so.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Tile({ slug, index }: { slug: string; index: number }) {
  const video = useRef<HTMLVideoElement | null>(null);
  return (
    <span
      className="relative block w-[168px] shrink-0"
      style={{ background: C.band }}
      onMouseEnter={() => video.current?.play().catch(() => {})}
      onMouseLeave={() => {
        const v = video.current;
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      }}
    >
      <video
        ref={video}
        src={clipSrc(slug)}
        poster={posterSrc(slug)}
        muted
        loop
        playsInline
        preload="none"
        className="block w-full"
        style={{ aspectRatio: "4 / 3", objectFit: "cover" }}
      />
      <span
        className="pointer-events-none absolute bottom-1.5 left-1.5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
        style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.textDim }}
      >
        ep {index}
      </span>
    </span>
  );
}
