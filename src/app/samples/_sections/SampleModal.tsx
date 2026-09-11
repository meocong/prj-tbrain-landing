"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { groupSpec } from "@/lib/samples/spec-sections";
import { PILL_KINDS_DROPPED } from "@/lib/samples/redact.mjs";
import { LICENSE, QUALIFIER } from "@/lib/samples/license";
import { C, EASE, OVER_MEDIA, PILL, type Sample } from "./tokens";
import { LiveTelemetry } from "./LiveTelemetry";
import { AccessActions } from "./AccessActions";
import { clipSrc, posterSrc, rigLayout } from "./rig-views";

/**
 * The full record, opened over the catalogue instead of pushed into the grid.
 *
 * Three rules shape this layer, in order of how badly breaking them hurts:
 *
 *  1. The panel never exceeds the viewport. It is a flex column capped at
 *     `88dvh`; the header and the action bar are `flex-none` and only the middle
 *     band scrolls. The earlier version let the panel grow to its content and
 *     scrolled the *overlay*, so on a 700px laptop the record stood 948px tall
 *     and its own top edge — close button included — started 25px above the
 *     fold. Capping against the viewport is also what WCAG 1.4.10 Reflow asks
 *     for, and it is what the native `<dialog>` UA stylesheet does by default.
 *  2. The video stays put while the record is read. `LiveTelemetry` prints the
 *     recorded row for `video.currentTime`, so a readout whose scrubber has
 *     scrolled off screen is useless. The media pane is its own scroll region
 *     and the video is sticky inside it.
 *  3. The request action never scrolls away. It lives in the action bar, which
 *     is pinned, because it is the one thing this page exists to collect.
 *
 * `min-height: 0` on the scrolling band is load-bearing: flex items default to
 * `min-height: auto` and will not shrink below their content, which silently
 * restores the overflow this layout exists to prevent.
 */

const PANEL_MAX = "min(88dvh, 880px)";

function mmss(total: number) {
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * `environment` and `breadcrumb` overlap, and by how much depends on the line.
 * On off-the-shelf records they say the same thing twice — breadcrumb
 * "… › Motorcycle Repair › Service Bay" against environment "Motorcycle Repair,
 * Service Bay". On robotics records environment is the only place the machine
 * and session id appear. So drop the terms the breadcrumb already carries and
 * print whatever is left.
 */
function sceneLine(environment: string, breadcrumb: string[]) {
  const seen = new Set(breadcrumb.map((b) => b.toLowerCase()));
  const rest = environment
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p && !seen.has(p.toLowerCase()));
  return rest.join(". ");
}

export function SampleModal({
  sample,
  onClose,
}: {
  sample: Sample | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);

  /**
   * The other lenses of the same rig, and the base clip's transport driving
   * them.
   *
   * Only the base carries `controls`: six scrubbers on one capture is six ways
   * to pull the views out of step, and the whole claim of a stereo pair — or of
   * a six-camera rig — is that these frames are the SAME instant. So the
   * reader gets one transport and the rest follow it.
   *
   * `LiveTelemetry` also reads `video.currentTime` off the base, which is the
   * second reason there can only be one of them.
   *
   * Followers are re-synced on seek and on play rather than continuously: an
   * assignment to `currentTime` every frame fights the decoder and shows as
   * stutter, and 0.15 s is below what anyone reads as a mismatch between two
   * tiles of the same bench.
   */
  const followers = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (!video) return;
    const live = () => followers.current.filter((v): v is HTMLVideoElement => !!v);
    const sync = () => {
      for (const v of live()) {
        if (Math.abs(v.currentTime - video.currentTime) > 0.15) v.currentTime = video.currentTime;
      }
    };
    const play = () => {
      sync();
      for (const v of live()) v.play().catch(() => undefined);
    };
    const pause = () => {
      for (const v of live()) v.pause();
      sync();
    };
    video.addEventListener("play", play);
    video.addEventListener("pause", pause);
    video.addEventListener("seeked", sync);
    return () => {
      video.removeEventListener("play", play);
      video.removeEventListener("pause", pause);
      video.removeEventListener("seeked", sync);
    };
  }, [video]);

  /* Computed above the early return, because the hooks have to be. An absent
     record lays out as a single view and renders nothing anyway. */
  const rig = rigLayout(sample?.slug ?? "");
  const panel = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  /** Tab must not walk out of an `aria-modal` dialog into the page behind it. */
  const trap = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panel.current) return;
    const focusable = panel.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!sample) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // Freezing the page keeps the invoking card where the reader left it. Pad by
    // the scrollbar width the lock removes, or the whole layout jumps sideways.
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prev = { overflow: body.style.overflow, pad: body.style.paddingRight };
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    window.addEventListener("keydown", onKey);
    panel.current?.focus();
    return () => {
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.pad;
      window.removeEventListener("keydown", onKey);
    };
  }, [sample, onClose]);

  if (!mounted) return null;

  const sections = sample ? groupSpec(sample.spec) : [];

  // Content settles a beat after the panel, so the layer reads as one object
  // arriving rather than six that happen to share a box.
  const band = {
    hidden: reduce ? {} : { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };
  return createPortal(
    <AnimatePresence>
      {sample && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ background: "rgba(7,9,15,0.58)" }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={sample.title}
            onKeyDown={trap}
            className="samples-scope relative flex w-full max-w-[1240px] flex-col overflow-hidden rounded-xl outline-none"
            style={{
              maxHeight: PANEL_MAX,
              background: C.base,
              border: `1px solid ${C.hairline}`,
              boxShadow: "0 32px 80px -20px rgba(7,9,15,0.55)",
              // The panel is focused on open so Escape and the tab trap have a
              // host. That is a scripted focus, not a keyboard arrival, so the
              // global `outline-ring/50` base rule must not draw a ring round
              // the whole layer.
              outline: "none",
            }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
            transition={
              reduce
                ? { duration: 0.15 }
                : { type: "spring", stiffness: 320, damping: 30, mass: 0.85 }
            }
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header: identity. Pinned, so you always know what you opened. ── */}
            <motion.header
              className="flex flex-none items-start gap-4 px-5 py-4 lg:px-7"
              style={{ borderBottom: `1px solid ${C.hairline}` }}
              variants={band}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.08 }}
            >
              <div className="min-w-0 flex-1">
                <p
                  className="bp-mono text-[10px]"
                  style={{ color: C.accent }}
                >
                  {sample.label}
                </p>
                <h2
                  className="mt-1.5 text-lg font-medium leading-snug md:text-xl"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {sample.title}
                </h2>
                <p className="mt-1.5 text-[12px]" style={{ color: C.textMid }}>
                  {sample.breadcrumb.map((b, i) => (
                    <span key={`${b}-${i}`}>
                      {i > 0 && <span style={{ color: C.textDim }}> › </span>}
                      <span style={{ color: i === 0 ? C.value : C.textMid }}>{b}</span>
                    </span>
                  ))}
                </p>
                {/* Without `sample.locale`. It appended the city — `Hanoi`,
                    and on four records the commune `Xa Van Giang` — to a line
                    that already names the trade and the kind of premises. That
                    combination is the locator Tam asked us to cut, and it read
                    as scene-setting rather than as an address, which is why it
                    survived the first pass over the spec table. */}
                <p className="mt-1 text-[12px]" style={{ color: C.textDim }}>
                  {sceneLine(sample.environment, sample.breadcrumb)}
                </p>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
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
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 shrink-0 rounded-full p-2 transition-colors"
                style={{ border: `1px solid ${C.hairline}`, color: C.textMid }}
              >
                <X className="h-4 w-4" />
              </button>
            </motion.header>

            {/* ── Body: the only band that scrolls. `min-h-0` is what allows it. ── */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain lg:grid lg:grid-cols-12 lg:overflow-hidden">
              {/* This pane does not scroll. Everything in it — the clip, its
                  caption, and either the live readout or the delivery list — is
                  sized to fit the band. It used to scroll, which meant rows slid
                  under the sticky caption and were clipped in half. The video
                  takes a viewport-relative height rather than a 4:3 box so the
                  budget still holds on a short laptop. */}
              <motion.div
                className="flex min-h-0 flex-col overflow-hidden lg:col-span-5 lg:h-full"
                style={{ borderRight: `1px solid ${C.hairlineSoft}` }}
                variants={band}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 0.12 }}
              >
                {/* The clip's box absorbs whatever the caption and the readout
                    below do not use, rather than claiming a fixed height and
                    pushing them out of a pane that cannot scroll. At a fixed
                    `min(32vh,300px)` the readout was clipped by 86px on a 700px
                    viewport — silently, because the pane hides its overflow.
                    `object-contain` means shrinking only letterboxes. */}
                <div className="lg:min-h-0 lg:flex-1">
                  {/* The slack around the clip paints as page, not as black.
                      The pane's height is whatever the caption and readout leave
                      over, so its box is almost never 4:3 — taller on a tall
                      window, wider on a short one — and `object-contain` has to
                      pad one axis or the other. Painted black that padding read
                      as a black frame belonging to the video, on sources that
                      are exactly 4:3 (576x432) and need no frame at all. Painted
                      as page it reads as the clip sitting on the panel.

                      Some robotics cuts do carry baked-in bars — a wide stereo
                      strip letterboxed into the 4:3 canvas at encode time. Those
                      stay: `object-cover` would crop real footage to hide them,
                      and the fix belongs in preview generation. */}
                  <div
                    className={`grid w-full gap-px ${rig.cols} ${
                      rig.kind === "single" ? "aspect-[4/3]" : rig.band
                    } lg:aspect-auto lg:h-full`}
                    style={{ background: C.base }}
                  >
                    {rig.cells.map(({ view, label, place }, i) => (
                      <figure
                        key={view || "base"}
                        className={`relative m-0 min-h-0 overflow-hidden ${place}`}
                      >
                        <video
                          ref={
                            i === 0
                              ? setVideo
                              : (el) => {
                                  followers.current[i] = el;
                                }
                          }
                          className="h-full w-full object-contain"
                          style={{ background: C.base }}
                          src={clipSrc(sample.slug, view)}
                          poster={posterSrc(sample.slug, view)}
                          muted
                          loop
                          playsInline
                          /* See `followers` above: one transport for the rig. */
                          controls={i === 0}
                          preload="metadata"
                          aria-label={label ? `${sample.title} — ${label}` : sample.title}
                        />
                        {rig.kind === "six" && (
                          <figcaption
                            className="bp-mono pointer-events-none absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate px-1.5 py-0.5 text-[9px]"
                            style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
                          >
                            {label}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
                <p
                  className="bp-mono flex-none px-5 py-2 text-[10px]"
                  style={{ color: C.textDim, borderBottom: `1px solid ${C.hairlineSoft}` }}
                >
                  {sample.preview}
                </p>
                {/* One or the other, never both: together they overran the pane
                    and brought the scrollbar back. A record with per-frame data
                    shows the readout, because that is what the scrubber is for.
                    A record without one shows what ships instead of dead space —
                    which is the question the downscaled preview raises anyway. */}
                <div className="flex-none px-5 pb-5">
                  {sample.telemetry ? (
                    <LiveTelemetry slug={sample.slug} video={video} />
                  ) : (
                    <>
                      <p
                        className="bp-mono mt-4 text-[10px]"
                        style={{ color: C.accent }}
                      >
                        In the delivery
                      </p>
                      <ul className="mt-2 grid grid-cols-2 gap-x-5">
                        {sample.streams.map((s) => (
                          <li
                            key={s}
                            className="py-[5px] font-mono text-[11px]"
                            style={{ color: C.value, borderTop: `1px solid ${C.hairlineSoft}` }}
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-[11px] leading-relaxed" style={{ color: C.textDim }}>
                        Ships as {sample.formats.join(", ")} · {sample.size}
                      </p>
                    </>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="min-h-0 lg:col-span-7 lg:h-full lg:overflow-y-auto lg:overscroll-contain"
                variants={band}
                initial="hidden"
                animate="show"
                transition={{ staggerChildren: 0.04, delayChildren: reduce ? 0 : 0.16 }}
              >
                {/* The four figures a buyer checks before reading anything else.
                    Sticky, so scrolling into the checksums does not cost you the
                    answer to "how long, shot how, how big". */}
                <dl
                  className="sticky top-0 z-10 grid grid-cols-2 sm:grid-cols-4"
                  style={{ background: C.base, borderBottom: `1px solid ${C.hairline}` }}
                >
                  {[
                    // Not the delivered size: the pill row and the action bar
                    // already carry it, and three prints of "486 MB" is noise.
                    { k: "Source length", v: mmss(sample.durationSec) },
                    { k: "Viewpoint", v: sample.viewpoint === "first-person" ? "1st person" : "3rd person" },
                    // "1920 x 1080 per camera" wraps a strip cell to two lines
                    // and skews the row. The qualifier is already spelled out in
                    // the Streams section; the strip only needs the figure.
                    { k: "Capture", v: /(\d+\s*x\s*\d+)/.exec(sample.resolution)?.[1] ?? sample.resolution },
                    { k: "Frame rate", v: `${sample.fps} fps` },
                  ].map((s, i) => (
                    <div
                      key={s.k}
                      className="px-5 py-3 lg:px-7"
                      style={{ borderLeft: i > 0 ? `1px solid ${C.hairlineSoft}` : undefined }}
                    >
                      <dt className="text-[10px]" style={{ color: C.textDim }}>
                        {s.k}
                      </dt>
                      <dd
                        className="mt-0.5 font-mono text-[15px] tracking-tight"
                        style={{ color: C.value }}
                      >
                        {s.v}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* One column, not two.
                    `columns-2` balances by height, so it cut the section list at
                    an arbitrary row and halved the value track to ~340px — every
                    checksum, uuid and path then wrapped. At full pane width the
                    label takes a fixed 170px and a 64-character SHA-256 lands on
                    one line. */}
                <div className="px-5 pb-6 lg:px-7">
                  {sections.map((section) => (
                    <motion.section
                      key={section.title}
                      className="mt-6"
                      variants={band}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          aria-hidden
                          className="h-[11px] w-[2px] rounded-full"
                          style={{ background: C.accent }}
                        />
                        <h3
                          className="bp-mono text-[10px]"
                          style={{ color: C.value }}
                        >
                          {section.title}
                        </h3>
                        <span
                          aria-hidden
                          className="h-px flex-1"
                          style={{ background: C.hairline }}
                        />
                      </div>
                      {/* No rule between rows. A record carries 31 of them, and
                          a hairline under each turned the group headings into
                          noise: 31 evenly spaced lines read as one texture, so
                          nothing was findable without reading every label. The
                          groups already have a rule at their heading, which is
                          the one separator this list needs. Alignment does the
                          rest — a fixed label column and a mono value column
                          give the eye two straight edges to run down. */}
                      <dl className="mt-2">
                        {section.rows.map(([k, v]) => (
                          <div
                            key={k}
                            className="grid grid-cols-[minmax(0,10.5rem)_1fr] items-baseline gap-x-5 py-[5px]"
                          >
                            <dt
                              className="text-[11px] leading-relaxed"
                              style={{ color: C.textDim }}
                            >
                              {k}
                            </dt>
                            <dd
                              className={`min-w-0 font-mono text-[11px] leading-relaxed ${
                                /\s/.test(v) ? "break-words" : "break-all"
                              }`}
                              style={{ color: C.value }}
                            >
                              {v}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </motion.section>
                  ))}

                  {/* Licence last, because it is the question a buyer resolves
                      after deciding they want the data. Both catalogues we read
                      print it on every card; ours is provisional and says so
                      through QUALIFIER rather than a badge - "indicative terms,
                      the agreement governs" is a normal thing for a vendor to
                      publish, a PROVISIONAL stamp is not. */}
                  <motion.section
                    className="mt-6"
                    variants={band}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        aria-hidden
                        className="h-[11px] w-[2px] rounded-full"
                        style={{ background: C.accent }}
                      />
                      <h3
                        className="bp-mono text-[10px]"
                        style={{ color: C.value }}
                      >
                        Licence
                      </h3>
                      <span aria-hidden className="h-px flex-1" style={{ background: C.hairline }} />
                    </div>
                    <dl className="mt-2">
                      {LICENSE.map((t) => (
                        <div
                          key={t.label}
                          className="grid grid-cols-[minmax(0,10.5rem)_1fr] items-baseline gap-x-5 py-[5px]"
                        >
                          <dt className="text-[11px] leading-relaxed" style={{ color: C.textDim }}>
                            {t.label}
                          </dt>
                          <dd
                            className="min-w-0 break-words font-mono text-[11px] leading-relaxed"
                            style={{ color: C.value }}
                          >
                            {t.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="mt-3 text-[11px]" style={{ color: C.textDim }}>
                      {QUALIFIER}
                    </p>
                  </motion.section>
                </div>
              </motion.div>
            </div>

            {/* ── Action bar: pinned, because this is what the page is for. ── */}
            <motion.footer
              className="flex flex-none flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3.5 lg:px-7"
              style={{ borderTop: `1px solid ${C.hairline}`, background: C.band }}
              variants={band}
              initial="hidden"
              animate="show"
              transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.2 }}
            >
              <AccessActions sample={sample} from="modal" />
            </motion.footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
