"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { C } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * What rides with the frames, beyond the frames.
 *
 * Tam, 2026-09-10: "xong đoạn advanced annotation thì em bê cái trang
 * https://tbrain-dashboard.vercel.app/ vào… Advanced annotation có cái trang đó
 * + Hand pose."
 *
 * The dashboard is the argument. Every competitor page can claim head tracking;
 * this one plays a real recording with the track on it, and a reader can scrub
 * it. So it is embedded live rather than screenshotted — a still of an
 * instrument is a picture of a claim, not the claim.
 *
 * ## Why an iframe and why it waits
 *
 * The dashboard is a separate deployment (`tbrain-dashboard.vercel.app`, source
 * at `github.com/tbrobotics/tbrain_dashboard`). Pulling it into this bundle
 * would mean owning its dependencies here; an iframe keeps the two apps apart
 * and means the annotation team can ship it without touching this repo.
 *
 * It mounts on scroll, not on load. It is a whole second application — the
 * heaviest single thing on the page — and it sits well below the fold, so
 * mounting it with the route would have every visitor download an app most of
 * them never scroll to. `IntersectionObserver` with a screen of margin starts it
 * early enough that it is ready when it is reached. Same pattern as `RigViews`,
 * and for the same measured reason.
 */

const DASHBOARD = "https://tbrain-dashboard.vercel.app/";

/**
 * The tracks a delivery can carry. Deliberately short: this section's job is to
 * hand the reader an instrument, not to describe one.
 */
const TRACKS: { name: string; detail: string }[] = [
  {
    name: "Head movement",
    detail: "6-DoF head pose per frame, from the rig's own IMU and VIO rather than estimated after the fact.",
  },
  {
    name: "Hand pose",
    detail: "Per-finger joint positions on the operator's hands, tracked through the grasp.",
  },
  {
    name: "Episode structure",
    detail: "The session cut into episodes and steps, so a policy trains on a task rather than on a video.",
  },
  {
    name: "Task and environment",
    detail: "What was being done, where, and how hard it was graded — carried on every frame.",
  },
];

export function AdvancedAnnotation() {
  const host = useRef<HTMLElement | null>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  return (
    <section
      ref={host}
      className="bp-grid bp-frame relative"
      style={{ backgroundColor: C.band, color: C.text }}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:py-20 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2 className="bp-mono text-[10px]" style={{ color: C.textDim }}>
            Advanced annotation
          </h2>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <p
              className="max-w-2xl text-3xl font-medium tracking-tight md:text-4xl"
              style={{
                fontFamily: "var(--font-heading)",
                letterSpacing: "-0.02em",
                lineHeight: 1.06,
              }}
            >
              The video is the smallest part of the delivery.
            </p>
            <a
              href={DASHBOARD}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-mono inline-flex items-center gap-1.5 text-[10px] underline decoration-1 underline-offset-4"
              style={{ color: C.accent }}
            >
              Open the explorer
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </Reveal>

        <dl className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRACKS.map((t) => (
            <div key={t.name} style={{ borderTop: `1px solid ${C.rule}`, paddingTop: "0.9rem" }}>
              <dt className="text-[14px] font-medium" style={{ color: C.text }}>
                {t.name}
              </dt>
              <dd className="mt-1.5 text-[12px] leading-relaxed" style={{ color: C.textMid }}>
                {t.detail}
              </dd>
            </div>
          ))}
        </dl>

        {/* The instrument itself. `aspect-16/9` rather than a fixed height so it
            keeps its shape on a phone, and a minimum so the controls inside are
            not crushed at narrow widths. */}
        <div
          className="mt-10 aspect-16/9 w-full min-h-[420px] overflow-hidden"
          style={{ border: `1px solid ${C.hairline}`, background: C.wash }}
        >
          {near ? (
            <iframe
              src={DASHBOARD}
              title="Tbrain annotation explorer — head pose, hand pose and episode structure on a real recording"
              loading="lazy"
              className="h-full w-full"
              style={{ border: 0 }}
              // The embed only has to render and be scrubbed. Nothing here needs
              // to reach this page, and nothing on this page should reach it.
              sandbox="allow-scripts allow-same-origin allow-popups"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="bp-mono text-[10px]" style={{ color: C.textDim }}>
                Explorer loads as you reach it
              </span>
            </div>
          )}
        </div>

        <p className="mt-4 text-[12px] leading-relaxed" style={{ color: C.textDim }}>
          A real recording with its tracks on it — scrub the timeline to see the pose follow the
          footage. Every delivery in this category can ship the same tracks.
        </p>
      </div>
    </section>
  );
}
