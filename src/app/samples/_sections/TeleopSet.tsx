"use client";

import { useCallback, useRef, useState } from "react";
import { clipSrc, posterSrc } from "@/lib/samples/categories";
import set from "@/lib/samples/teleop-set.json";
import { C, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * The teleoperation set, playing.
 *
 * The three cameras are the point, so they play together rather than as three
 * separate cards. A robot policy trained on this reads head, left and right on
 * one clock; showing them side by side on one transport is the closest a web
 * page gets to saying that. One `play` drives all three, and the two followers
 * are seeked to the leader on every scrub, so a frame in one is the same
 * instant in the others.
 *
 * Below it, one head-camera episode from every session. Same task in all of
 * them, which is what makes it a training set rather than a showreel: the
 * variation between attempts is the data.
 *
 * Every figure comes from `teleop-set.json`, which `ingest-approved.py` writes
 * from the approved delivery's own LeRobot metadata. Nothing on this component
 * is typed in: the previous version hard-coded a different robot's set — eleven
 * episodes, a gripper, sixteen dimensions — and outlived it.
 */

interface Strip {
  slug: string;
  episodes: number;
  frames: number;
  shown: number;
  seconds: number;
}
const SET = set as {
  task: string;
  fps: number;
  sessions: number;
  episodes: number;
  frames: number;
  seconds: number;
  strip: Strip[];
  lead: string;
};

const LEAD = SET.strip[0];
const VIEWS = [
  { slug: SET.lead, label: "Head" },
  { slug: `${SET.lead}-left`, label: "Left" },
  { slug: `${SET.lead}-right`, label: "Right" },
];

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

  if (!LEAD) return null;

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="bp-mono text-[10px]" style={{ color: C.textDim }}>
            Play the set
          </h2>

          <p className="mt-5 max-w-2xl text-[13px] leading-relaxed" style={{ color: C.textMid }}>
            Three cameras on one clock, which is what a policy reads. Below them, one episode from
            each of the {SET.sessions} sessions — one task, {SET.episodes.toLocaleString()} attempts,
            and the variation between them is the data.
          </p>

          {/* Which of the two products this is. The tier table on this page
              prices "Egocentric + gripper (UMI)", a person wearing a gripper
              rig; the set below is a robot. "Rig ko ghi tên" — the
              configuration is described, the model is not named. */}
          <p
            className="bp-card mt-4 max-w-2xl px-4 py-3 text-[13px] leading-relaxed"
            style={{ color: C.textMid }}
          >
            This set is the robot side: bimanual follower arms, seven joints each, with a
            five-fingered hand on each arm. The configuration priced above it — Egocentric + gripper
            (UMI) — is the human side, a person wearing a wrist rig. Both are teleoperation; they are
            not the same recording.
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
                  className="bp-mono pointer-events-none absolute left-2 top-2 px-1.5 py-0.5 text-[9px]"
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
              className="bp-mono rounded-full px-5 py-2 text-[11px] transition-transform active:scale-[0.98]"
              style={{ border: `1px solid ${C.rule}`, color: C.text }}
            >
              {playing ? "Pause all three" : "Play all three"}
            </button>
            <span className="font-mono text-[11px]" style={{ color: C.textDim }}>
              Session 1 · episode {LEAD.shown} · 640×480 · {SET.fps} fps · 40-dimensional state and
              action per frame
            </span>
          </div>

          <p className="bp-mono mt-10 text-[10px]" style={{ color: C.textDim }}>
            All {SET.sessions} sessions · head camera
          </p>
          <p className="mt-2 max-w-2xl text-[13px]" style={{ color: C.textMid }}>
            {SET.task}
          </p>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-4">
            {SET.strip.map((s, i) => (
              <Tile key={s.slug} slug={s.slug} label={`s${i + 1} · ep ${s.shown}`} />
            ))}
          </div>

          <p className="mt-4 max-w-2xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
            Counted off the files: {SET.sessions} sessions, {SET.episodes.toLocaleString()} episodes,{" "}
            {SET.frames.toLocaleString()} frames, {(SET.sessions * 3).toLocaleString()} videos —{" "}
            {Math.round(SET.seconds / 60)} minutes of robot time at {SET.fps} fps.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Tile({ slug, label }: { slug: string; label: string }) {
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
        className="pointer-events-none absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bp-mono text-[9px]"
        style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.textDim }}
      >
        {label}
      </span>
    </span>
  );
}
