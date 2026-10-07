"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/motion-pref";
import { HAND_COLOR, fmtPct, handPoseSample, mmss, type HandPoseSample } from "@/lib/samples/handpose";
import { track } from "@/lib/samples/track";
import { C, PILL } from "../tokens";
import { HandPlayer } from "./HandPlayer";
import { Reveal } from "../Reveal";
import { PageSection } from "./page-kit";
import { SampleSelect } from "./SampleSelect";
import { FEATURED, SAMPLES, pad2 } from "./page-data";

/**
 * The workspace: the first thing under the hero, a demo of what the player does.
 *
 * One sample at a time, played: camera video and the same pose in 3D side by
 * side, the lane and the live numbers under them (`HandPlayer`). A header bar
 * names the sample and carries the figures a buyer asks about first, and a
 * picker (`SampleSelect`) switches sample. It starts on the featured sample.
 *
 * It is not where a recording is opened: "Visualize", a link to a sample and
 * `?record=` open the record dialog (`RecordModalHost`), which has the same
 * player beside the record's numbers. So this neither reads nor writes the
 * address.
 *
 * The player itself, and with it three.js and the 3D joints, mounts only once
 * the section is near the viewport.
 */


function Chip({ kind, children }: { kind: keyof typeof PILL; children: React.ReactNode }) {
  const p = PILL[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-[5px] text-[11.5px] leading-none"
      style={{ background: p.bg, color: p.fg, border: `1px solid ${p.bd}` }}
    >
      {children}
    </span>
  );
}

export function Workspace() {
  const [slug, setSlug] = useState(FEATURED.slug);
  const [near, setNear] = useState(false);
  const section = useRef<HTMLDivElement>(null);
  const headingId = useId();

  useEffect(() => {
    const el = section.current;
    if (!el) return;
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
      { rootMargin: "700px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hp: HandPoseSample = handPoseSample(slug) ?? FEATURED;
  const reduce = useReducedMotion();

  return (
    <div id="samples" ref={section} className="scroll-mt-20">
      <PageSection tone="paper" labelledBy={headingId} padding="pb-10 pt-7 md:pb-14 md:pt-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className="bp-mono text-[10px]" style={{ color: C.textDim }}>
              Viewer · sample {pad2(hp.n)}
            </p>
            <h2
              id={headingId}
              className="mt-2 text-balance text-[26px] font-medium md:text-4xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
            >
              <motion.span
                key={hp.slug}
                className="block"
                // Same `initial` either way, so the server's HTML matches; reduced
                // motion only makes the transition instant.
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {hp.title}
              </motion.span>
            </h2>
            <ul className="mt-3.5 flex flex-wrap items-center gap-2" aria-label="This sample in figures">
              <li>
                <Chip kind="skill">{hp.skillGroup}</Chip>
              </li>
              <li>
                <Chip kind="file">
                  {mmss(hp.seconds)} · {hp.frames.toLocaleString("en-US")} frames
                </Chip>
              </li>
              <li>
                <Chip kind="file">
                  3D pose{" "}
                  <span style={{ color: HAND_COLOR.left }}>L {fmtPct(hp.left.posePct)}</span>
                  <span aria-hidden> / </span>
                  <span style={{ color: HAND_COLOR.right }}>R {fmtPct(hp.right.posePct)}</span>
                </Chip>
              </li>
              <li>
                <Chip kind="quality">Measured {fmtPct(hp.measuredOfDeliveredPct)} of delivered</Chip>
              </li>
            </ul>
          </div>

          <div className="w-full sm:w-auto">
            <SampleSelect
              samples={SAMPLES}
              value={hp.slug}
              onChange={(slug) => {
                track("handpose_sample_open", { slug, from: "workspace_select" });
                setSlug(slug);
              }}
            />
          </div>
        </div>

        <div className="mt-6 md:mt-7">
          {near ? (
            // A new sample crossfades in rather than snapping: the old one fades
            // out first (`wait`), so two players never run at once.
            <Reveal variant="zoom">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={hp.slug}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 1 } : { opacity: 0, y: -6, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <HandPlayer hp={hp} title={hp.title} initialFrame={hp.posterFrame} />
                </motion.div>
              </AnimatePresence>
            </Reveal>
          ) : (
            <div
              aria-busy="true"
              className="flex min-h-[420px] items-center justify-center"
              style={{ border: `1px solid ${C.hairlineSoft}` }}
            >
              <p className="bp-mono text-[10px]" style={{ color: C.textDim }}>
                Loading the viewer
              </p>
            </div>
          )}
        </div>
      </PageSection>
    </div>
  );
}
