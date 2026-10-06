"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, EyeOff, Play } from "lucide-react";
import { prefersReducedMotion, useReducedMotion } from "@/lib/motion-pref";
import { HAND_COLOR, handPoseSample, mmss, type HandPoseSample } from "@/lib/samples/handpose";
import { PILL_KINDS_DROPPED } from "@/lib/samples/redact.mjs";
import { track } from "@/lib/samples/track";
import { C, OVER_MEDIA, PILL, type Sample } from "../tokens";
import { HandBadge } from "./glyphs";
import { StripLane } from "./Lane";

/**
 * The catalogue card for a hand-pose sample.
 *
 * Same grid footprint and the same anatomy as the egocentric `Card` — caption,
 * 4:3 media tile, label, title, breadcrumb, pills — so the two families sit in
 * one rail and one pager without either looking bolted on. What differs is the
 * media, because what may be shown differs per sample:
 *
 *   video   a skeleton loop that plays on hover or focus. Only where consent for
 *           a public preview is on record (samples 13 and 14).
 *   poster  one skeleton still. No loop, no full-length render.
 *   lane    nothing rendered at all: the state lane itself, drawn on a panel in
 *           the same ground as the renders, so a tile with no media is still a
 *           picture of the data rather than an empty box.
 *
 * Which tier a sample is in, and which files exist for it, is read from the
 * metrics (`media` is null where a file is absent) — never from the slug. A
 * tier whose file is missing falls through to the next one down, so a card is
 * never a broken image.
 *
 * Every non-video tier says "Preview on request" and the video tier says
 * "Skeleton preview", on the tile itself: a reader who sees a still should not
 * have to open the record to learn that a loop exists for some samples and not
 * for this one.
 */

/**
 * The ground the skeleton renders are drawn on, sampled from the posters.
 * A lane tile stands in for a render, so it takes the same ground and, below,
 * the same dark-ground pair of hand hues in BOTH themes: the theme-aware pair
 * in globals.css is stepped darker for paper and would go muddy here.
 */
const GROUND = "#090617";

/** Re-points the two hand hues for everything inside a media tile. */
const MEDIA_HANDS = {
  ["--hp-left" as string]: "#56B4E9",
  ["--hp-right" as string]: "#E69F00",
} as CSSProperties;

/** `L 99.9% · R 85.9% with 3D pose` — the record's caption, split so each figure takes its hand's hue. */
const CAPTION = /^L (\S+) · R (\S+) (.+)$/;

function Caption({ text }: { text: string }) {
  const m = CAPTION.exec(text);
  // The text is identical either way; the split only paints the two figures.
  if (!m) return <>{text}</>;
  return (
    <>
      L <span style={{ color: HAND_COLOR.left }}>{m[1]}</span> · R{" "}
      <span style={{ color: HAND_COLOR.right }}>{m[2]}</span> {m[3]}
    </>
  );
}

/**
 * Interior ruler ticks as fractions of the clip. A tick every 10 s on a 65 s
 * clip, every 30 s on a 3:24 one: dense enough to read as a time axis, never
 * so dense that it turns into a comb on a 300 px tile.
 */
function rulerTicks(seconds: number): number[] {
  const step = [5, 10, 15, 30, 60].find((s) => seconds / s <= 8) ?? 60;
  const out: number[] = [];
  for (let t = step; t < seconds - step / 4; t += step) out.push(t / seconds);
  return out;
}

const SIDES = ["left", "right"] as const;

/**
 * A tile for a sample with nothing to render: both hands' state lanes on a
 * quiet panel, a time axis under them, and the "Preview on request" note.
 *
 * The lanes are the 200-bin strips from the metrics, so this is the same data
 * the record's full-length lane is drawn from, only coarser. The rows are one
 * labelled image (`role="img"`) and the note sits outside it so it still
 * reaches the tile's accessible name; the numbers the lane stands for are the
 * caption above the tile.
 */
function LaneTile({ hp, seconds }: { hp: HandPoseSample | null; seconds: number }) {
  const ticks = rulerTicks(seconds);
  return (
    <div className="relative h-full w-full" style={{ background: GROUND, ...MEDIA_HANDS }}>
      {/* The posters carry a faint graph-paper grid and a lifted centre; the
          panel takes both so the two kinds of tile read as one set. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(30,42,92,0.5), transparent 68%)" }}
      />

      <div className="relative flex h-full w-full flex-col justify-center px-[8%]">
        <div role="img" aria-label="State lane for both hands">
          {hp && (
            <div className="flex flex-col gap-[11px]">
              {SIDES.map((hand) => (
                <div key={hand} className="flex items-center gap-2.5">
                  <HandBadge hand={hand} size={20} />
                  <StripLane hand={hand} strip={hp.strip[hand]} height={17} className="min-w-0 flex-1" />
                </div>
              ))}
            </div>
          )}

          {/* The axis is aligned to the lanes: a badge and its gap are 30 px. */}
          <div aria-hidden className="mt-2.5 flex gap-2.5">
            <span className="w-5 flex-none" />
            <div className="relative h-[22px] min-w-0 flex-1">
              <span className="absolute left-0 top-0 h-[7px] w-px" style={{ background: OVER_MEDIA.textDim }} />
              <span className="absolute right-0 top-0 h-[7px] w-px" style={{ background: OVER_MEDIA.textDim }} />
              {ticks.map((p) => (
                <span
                  key={p}
                  className="absolute top-0 h-[4px] w-px"
                  style={{ left: `${p * 100}%`, background: "rgba(255,255,255,0.28)" }}
                />
              ))}
              <span className="absolute left-0 top-[10px] font-mono text-[9px] leading-none" style={{ color: OVER_MEDIA.textDim }}>
                0:00
              </span>
              <span className="absolute right-0 top-[10px] font-mono text-[9px] leading-none" style={{ color: OVER_MEDIA.textDim }}>
                {mmss(seconds)}
              </span>
            </div>
          </div>
        </div>

        <p
          className="bp-mono mt-5 flex items-center justify-center gap-2 text-[10px]"
          style={{ color: OVER_MEDIA.text }}
        >
          <EyeOff aria-hidden className="h-3 w-3 flex-none" />
          Preview on request
        </p>
      </div>
    </div>
  );
}

export function HandPoseCard({ sample, onOpen }: { sample: Sample; onOpen: () => void }) {
  // The catalogue record is what the grid filters and sorts; the metrics are
  // what the tile draws. Both are generated from one build, so a record always
  // has its metrics, but a card that can not find them still renders.
  const hp = handPoseSample(sample.slug);
  const media = hp?.media;

  const tier: "video" | "poster" | "lane" =
    hp?.preview === "video" && media?.loop ? "video" : hp?.preview !== "lane" && media?.poster ? "poster" : "lane";
  const [posterBroken, setPosterBroken] = useState(false);
  const shown = tier === "poster" && posterBroken ? "lane" : tier;

  const video = useRef<HTMLVideoElement | null>(null);
  const img = useRef<HTMLImageElement | null>(null);
  const reduce = useReducedMotion();

  // A poster that failed before this component hydrated fires its error event
  // into nothing; look once for a finished-but-empty image.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setPosterBroken(true);
  }, []);

  /* Hover-to-play is a browsing affordance and the only motion on this card.
     It does not run under reduced motion — the OS setting or the header's
     "Pause animations" switch, which `prefersReducedMotion()` folds together —
     and it is read at the moment of the hover, not captured at render, so
     turning the switch on mid-visit takes effect on the next pointer move. */
  const play = useCallback(() => {
    const v = video.current;
    if (!v || !v.paused || prefersReducedMotion()) return;
    track("play_preview", { slug: sample.slug, domain: sample.domain });
    v.currentTime = 0;
    v.play().catch(() => undefined);
  }, [sample.slug, sample.domain]);

  const stop = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  // The switch already pauses every muted video it can see; this covers the OS
  // preference changing while a loop is playing, which it does not hear about.
  useEffect(() => {
    if (reduce) stop();
  }, [reduce, stop]);

  const open = () => {
    track("handpose_sample_open", { slug: sample.slug, from: "card" });
    onOpen();
  };

  const hasVideo = hp?.preview === "video";
  const previewLabel = hasVideo ? "Skeleton preview" : "Preview on request";

  return (
    <article className="flex flex-col" style={{ borderTop: `1px solid ${C.hairline}` }}>
      {/* One line here, but the slot keeps the egocentric Card's two-line
          reserve so a row of the two families opens its media on one baseline. */}
      <p
        className="bp-mono line-clamp-2 min-h-[30px] pb-2.5 pt-3 text-[10px] leading-[1.5]"
        style={{ color: C.textDim }}
      >
        <Caption text={sample.preview} />
      </p>

      {/* The whole tile opens the record, as on the egocentric card. */}
      <button
        type="button"
        onClick={open}
        onMouseEnter={play}
        onMouseLeave={stop}
        onFocus={() => {
          // Not when the record's dialog hands focus back on close: the loop
          // would start with no pointer over the card and no reader asking.
          if (document.body.dataset.restoringFocus) return;
          play();
        }}
        onBlur={stop}
        aria-haspopup="dialog"
        className="group relative block w-full overflow-hidden text-left"
      >
        {/* The tile's name. Left to its content it read as its badges ("1st
            person 1:15 Skeleton preview") or a lane's tick labels, so the media
            and the badges are hidden from assistive tech and this says it
            instead — as text, not aria-label, which would have to repeat the
            badges word for word (WCAG 2.5.3). */}
        <span className="sr-only">{`Open ${sample.title}, ${previewLabel}`}</span>
        <div
          aria-hidden
          className="relative aspect-[4/3] w-full overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ background: GROUND }}
        >
          {shown === "video" && media?.loop && (
            // No `autoPlay`, no `controls`: the loop starts only on a hover or a
            // focus, and a muted video without controls is what the header's
            // pause switch recognises as ambient and can still.
            // `preload="none"` — the poster is all a card shows until the
            // pointer arrives, and sixteen cards must not open sixteen streams.
            <video
              ref={video}
              className="h-full w-full object-cover"
              src={media.loop}
              poster={media.poster ?? undefined}
              muted
              loop
              playsInline
              preload="none"
              aria-label={`${sample.title}, skeleton render of both hands`}
            />
          )}

          {shown === "poster" && media?.poster && (
            // eslint-disable-next-line @next/next/no-img-element -- a 800x600 poster the pipeline already sized; next/image would resize it again and add a loader dependency
            <img
              ref={img}
              src={media.poster}
              alt={`Skeleton render of both hands, ${sample.title}`}
              width={800}
              height={600}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              onError={() => setPosterBroken(true)}
            />
          )}

          {shown === "lane" && <LaneTile hp={hp} seconds={hp?.seconds ?? sample.durationSec} />}
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
          style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.textDim }}
        >
          {sample.viewpoint === "first-person" ? "1st person" : "3rd person"}
        </span>
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-3 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
          style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
        >
          {mmss(sample.durationSec)}
        </span>

        {/* The lane tile says it inside the panel. */}
        {shown !== "lane" && (
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] backdrop-blur-sm"
            style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
          >
            {hasVideo ? (
              <Play aria-hidden className="h-2.5 w-2.5 flex-none" fill="currentColor" />
            ) : (
              <EyeOff aria-hidden className="h-2.5 w-2.5 flex-none" />
            )}
            {previewLabel}
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col px-1 pb-6 pt-5">
        <p className="bp-mono text-[10px]" style={{ color: C.accent }}>
          {sample.label}
        </p>
        {/* A heading as well as a button: sixteen of them are the page's outline
            for a reader who navigates by heading. */}
        <h3 className="mt-2 text-base font-medium leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="min-h-6 text-left underline-offset-4 hover:underline"
          >
            {sample.title}
          </button>
        </h3>
        {/* Not on a phone: on this page every card's trail is "Samples › Hand
            pose › its own title", and three lines of it per card were most of
            what made the catalogue the longest thing on a 390 px page. */}
        <p className="mt-2 hidden text-[12px] sm:block" style={{ color: C.textMid }}>
          {sample.breadcrumb.map((b, i) => (
            <span key={`${b}-${i}`}>
              {i > 0 && <span style={{ color: C.textDim }}> › </span>}
              <span style={{ color: i === 0 ? C.value : C.textMid }}>{b}</span>
            </span>
          ))}
        </p>

        <ul className="mt-3 flex flex-wrap gap-1.5">
          {sample.pills
            .filter((p) => !(PILL_KINDS_DROPPED as string[]).includes(p.k))
            .map((pill) => {
              const st = PILL[pill.k];
              return (
                <li
                  key={pill.t}
                  className="rounded-full px-2.5 py-1 text-[11px]"
                  style={{ background: st.bg, color: st.fg, border: `1px solid ${st.bd}` }}
                >
                  {pill.t}
                </li>
              );
            })}
        </ul>

        {/* Pinned to the foot of the card, so a row of cards whose pills wrap
            differently still lines its links up. */}
        {/* The tile and the title already open the record; on a phone this
            third control is length without a new destination. */}
        <div className="mt-auto hidden flex-wrap items-center gap-3 pt-3 sm:flex">
          {/* `min-h-6` is the 24 px target floor; the ten-pixel label alone is 15. */}
          <button
            type="button"
            onClick={open}
            aria-haspopup="dialog"
            className="bp-mono inline-flex min-h-6 items-center gap-1.5 text-[10px] transition-colors"
            style={{ color: C.textDim }}
            aria-label={`${hasVideo ? "Full metadata, lane and video" : "Full metadata and lane"}: ${sample.title}`}
          >
            {hasVideo ? "Full metadata, lane and video" : "Full metadata and lane"}
            <ChevronDown aria-hidden className="h-3 w-3 -rotate-90" />
          </button>
        </div>
      </div>
    </article>
  );
}
