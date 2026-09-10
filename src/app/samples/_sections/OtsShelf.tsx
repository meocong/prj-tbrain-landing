"use client";

import { useCallback, useRef } from "react";
import { clipSrc, posterSrc } from "@/lib/samples/categories";
import { OTS_CORPUS, OTS_SKILLS, OTS_UNSAMPLED } from "@/lib/samples/ots";
import { C, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * The off-the-shelf shelf, playing.
 *
 * The page sells two routes and showed one. Everything in the grid above is a
 * stereo rig delivery — the custom-collection side — while "Off the shelf" was
 * a paragraph about 12,900 episodes a reader could not see a frame of. The
 * capability sheet had a `Sample Link` per skill the whole time.
 *
 * The heading names the SETTING, not just the route, because the first version
 * did not and the section read as an intruder. The category promises "skilled
 * manual work ... while they do their job" and 98 of its 118 records are in an
 * operating business; this corpus is what the sheet calls "Household / factory
 * / daily environment", and the clips are a cup on a dining table and a
 * screwdriver on a bedroom desk. Same modality, different shelf — which is
 * exactly the residential / non-residential split R3 asks for, and it belongs
 * in the heading rather than in a footnote.
 *
 * Portrait tiles, because the footage is portrait: all sixty-one clips in those
 * folders are shot on a phone held upright. Letterboxing them into the
 * landscape grid above would hide the one thing that most distinguishes this
 * corpus from the stereo deliveries, which is that it is phone video.
 *
 * Hover plays, the same affordance the main grid uses, so the two shelves
 * behave alike even though they look nothing alike.
 */
export function OtsShelf() {
  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="bp-mono text-[10px]" style={{ color: C.textDim }}>
            Off the shelf · household and daily activity
          </h2>

          <p className="mt-5 max-w-2xl text-[13px] leading-relaxed" style={{ color: C.textMid }}>
            A separate corpus from the deliveries above: phone-mounted first-person capture of
            everyday manipulation, licensed as a pack rather than collected to a brief. Every clip in the five
            sampled skills plays here — sixty-one of them.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4 xl:grid-cols-7">
            {[
              { v: OTS_CORPUS.episodes, l: "Episodes" },
              { v: OTS_CORPUS.hours, l: "Total footage" },
              { v: OTS_CORPUS.domains, l: "Skill domains" },
              { v: OTS_CORPUS.clipLength, l: "Per clip" },
              { v: OTS_CORPUS.fps, l: "Frame rate" },
              { v: "Household · daily", l: "Setting" },
            { v: OTS_CORPUS.lead, l: "Lead time" },
            ].map((s) => (
              <div key={s.l} style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-3">
                <dd
                  className="font-mono text-xl tracking-tight md:text-2xl"
                  style={{ color: C.value, lineHeight: 1.1 }}
                >
                  {s.v}
                </dd>
                <dt
                  className="bp-mono mt-2 text-[10px]"
                  style={{ color: C.textDim }}
                >
                  {s.l}
                </dt>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-[12px]" style={{ color: C.textDim }}>
            {OTS_CORPUS.resolution}. {OTS_CORPUS.size}. Episode counts are the catalogue's own
            estimates, from each skill&apos;s share of the corpus.
          </p>

          {/* A row per skill, not one strip of sixty-one. Fifteen tiles and six
              tiles belong to different questions, and a single scroller would
              bury the boundary between them — which is the share each skill has
              of the corpus, the thing the labels are here to say. */}
          <div className="mt-12 space-y-10">
            {OTS_SKILLS.map((s) => (
              <div key={s.slug}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="text-[13px] font-medium">{s.name}</p>
                  <p className="font-mono text-[11px]" style={{ color: C.textDim }}>
                    {s.clips.length} playable · {s.share} of the corpus · {s.episodes} episodes
                  </p>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto pb-3">
                  {s.clips.map((slug) => (
                    <Tile key={slug} slug={slug} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-2xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
            Four more skills are in the pack with no sample folder published:{" "}
            {OTS_UNSAMPLED.join(", ").toLowerCase()}. Ask and we will send clips from any of them.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function Tile({ slug }: { slug: string }) {
  const video = useRef<HTMLVideoElement | null>(null);
  const play = useCallback(() => video.current?.play().catch(() => {}), []);
  const stop = useCallback(() => {
    const v = video.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  }, []);

  return (
    <span
      className="relative block w-[124px] shrink-0 overflow-hidden md:w-[142px]"
      style={{ aspectRatio: "9 / 16", background: C.band }}
      onMouseEnter={play}
      onMouseLeave={stop}
    >
      <video
        ref={video}
        src={clipSrc(slug)}
        poster={posterSrc(slug)}
        muted
        loop
        playsInline
        preload="none"
        className="h-full w-full object-cover"
      />
      <span
        className="pointer-events-none absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bp-mono text-[9px]"
        style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.textDim }}
      >
        .mp4
      </span>
    </span>
  );
}
