"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion-pref";
import { HAND_COLOR, fmtPct, handPoseSample, mmss, type HandPoseSample } from "@/lib/samples/handpose";
import { OPEN_RECORD_EVENT, type OpenRecordDetail } from "@/lib/samples/open-record";
import { track } from "@/lib/samples/track";
import { C, PILL } from "../tokens";
import { HandPlayer } from "./HandPlayer";
import { PageSection } from "./page-kit";
import { FEATURED, SAMPLES, pad2 } from "./page-data";

/**
 * The workspace: the first thing under the hero, and the reason for the page.
 *
 * One sample at a time, played: camera video and the same pose in 3D side by
 * side, the lane and the live numbers under them (`HandPlayer`). A header bar
 * names the sample and carries the figures a buyer asks about first, and a
 * select switches sample.
 *
 * Which sample is on show follows the address. `?record=hand-pose-NN&f=N` loads
 * that sample at that frame; the bar's select, a row's "Visualize" button and any
 * link that opens a record (`openRecord`) change it, and `history.replaceState`
 * keeps the URL pointing at what is on screen, so a copied address reopens the
 * same moment. A visit with no query starts on the featured sample and leaves
 * the URL alone until the reader does something.
 *
 * The player itself, and with it three.js and the 3D joints, mounts only once
 * the section is near the viewport.
 */

interface Shown {
  slug: string;
  frame: number | null;
  /** Bumped by every request, so asking for the sample already on show still resets it. */
  nonce: number;
}

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

function syncUrl(slug: string, frame: number | null) {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set("record", slug);
    if (frame == null) u.searchParams.delete("f");
    else u.searchParams.set("f", String(frame));
    window.history.replaceState(window.history.state, "", `${u.pathname}${u.search}${u.hash}`);
  } catch {
    // An embed that forbids it: the page still works, the address just stays put.
  }
}

function fromUrl(): { slug: string; frame: number | null } | null {
  const q = new URLSearchParams(window.location.search);
  const slug = q.get("record");
  if (!slug || !handPoseSample(slug)) return null;
  const f = q.get("f");
  return { slug, frame: f && /^\d+$/.test(f) ? Number(f) : null };
}

export function Workspace() {
  const [shown, setShown] = useState<Shown>({ slug: FEATURED.slug, frame: null, nonce: 0 });
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const section = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const selectId = useId();
  const headingId = useId();
  /* `shown` read from handlers that outlive a render. */
  const nonce = useRef(0);

  useEffect(() => {
    const u = fromUrl();
    if (u) {
      nonce.current += 1;
      setShown({ slug: u.slug, frame: u.frame, nonce: nonce.current });
    }
    setReady(true);
  }, []);

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

  const show = useCallback((slug: string, frame: number | null, scroll: boolean) => {
    if (!handPoseSample(slug)) return;
    nonce.current += 1;
    setShown({ slug, frame, nonce: nonce.current });
    setNear(true);
    syncUrl(slug, frame);
    if (scroll) {
      const el = section.current;
      el?.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth", block: "start" });
      // Focus follows, as a fragment jump would, so the next Tab starts here.
      heading.current?.focus({ preventScroll: true });
    }
  }, []);

  /* Every way to "open a record" on this page (a link, a row's button) is the
     same event, `openRecord`, which used to open a dialog. Here it loads the
     sample into the workspace. */
  useEffect(() => {
    const onOpen = (e: Event) => {
      const d = (e as CustomEvent<OpenRecordDetail>).detail;
      if (d?.slug) show(d.slug, d.frame ?? null, true);
    };
    window.addEventListener(OPEN_RECORD_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_RECORD_EVENT, onOpen);
  }, [show]);

  const hp: HandPoseSample = handPoseSample(shown.slug) ?? FEATURED;

  return (
    <div id="samples" ref={section} className="scroll-mt-20">
      <PageSection tone="paper" labelledBy={headingId} padding="pb-10 pt-7 md:pb-14 md:pt-9">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div className="min-w-0">
            <p className="bp-mono text-[10px]" style={{ color: C.textDim }}>
              Viewer · sample {pad2(hp.n)}
            </p>
            {/* tabIndex -1: the target of focus after "Visualize", not a stop. */}
            <h2
              id={headingId}
              ref={heading}
              tabIndex={-1}
              className="mt-2 text-balance text-[26px] font-medium outline-none md:text-4xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", lineHeight: 1.06 }}
            >
              {hp.title}
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

          <div className="flex flex-col gap-1.5">
            <label htmlFor={selectId} className="bp-mono text-[10px]" style={{ color: C.textDim }}>
              Sample
            </label>
            <select
              id={selectId}
              value={hp.slug}
              onChange={(e) => {
                track("handpose_sample_open", { slug: e.target.value, from: "workspace_select" });
                show(e.target.value, null, false);
              }}
              className="min-w-[15rem] rounded-full px-4 py-2.5 text-[13px]"
              style={{ background: C.wash, color: C.text, border: `1px solid ${C.rule}` }}
            >
              {SAMPLES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  #{pad2(s.n)} {s.title}
                  {s.preview === "video" ? " · video" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 md:mt-7">
          {ready && near ? (
            <HandPlayer
              key={`${shown.slug}:${shown.nonce}`}
              hp={hp}
              title={hp.title}
              initialFrame={shown.frame}
              onSettle={(f) => syncUrl(hp.slug, f)}
            />
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
