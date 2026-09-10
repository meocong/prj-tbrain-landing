"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { C, EASE, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * The rig, shown rather than asserted.
 *
 * `CaptureSpec` above this says "Head rig: 6 cameras, three stereo pairs" and
 * every preview on the page was one 576x432 eye, so the page made a claim about
 * its own hardware and then showed a single view — the one thing that cannot
 * evidence it. Tam, 2026-09-09: "Stereo em phải show 2 cam ít nhất, xong 6 cam
 * stereo".
 *
 * Both clips are cut from ONE delivery file, at the same instant on each
 * camera. The filename and the optical-frame ids are deliberately not quoted
 * anywhere in this file: both carry the rig's name, and "Rig ko ghi tên" has no
 * exception for a source comment. What the file carries, read out of it rather
 * than off a spec sheet:
 *
 *     /robot0/sensor/camera0..5/compressed   ~4,540 messages each, h264 1600x1300
 *     /robot0/sensor/camera0..5/camera_info  foxglove.CameraCalibration
 *     /robot0/sensor/imu                     30,264 messages
 *     /robot0/sensor/audio                    2,365 messages
 *
 * Six streams, not four. The `Streams: 4` row in the record counts something
 * else — stream KINDS, on the evidence of the six it lists as one "RGB stereo".
 *
 * The pairing is read from each camera's `camera_info` frame id, not guessed
 * from the numbering: camera0 and camera4 report themselves as the left eye of
 * a pair, camera1 and camera5 as the right. So the pairs are (0,1), (2,3),
 * (4,5) — which is what "three stereo pairs" means, and why the default view is
 * 0 and 1 rather than any two of the six.
 *
 * ## Why six by default and the pair behind the control
 *
 * It opened on the pair, on the argument that "stereo" is a word until you see
 * parallax and that six tiles read as a contact sheet. Tam, 2026-09-10: "auto
 * để 6 đi". The contact-sheet worry was answered by the layout rather than by
 * hiding them — laid out as the cameras are mounted, six tiles are a diagram of
 * the rig, and a diagram is worth opening on. The pair is still one press away
 * for the reader who wants the parallax full size.
 *
 * It costs nothing to do it this way round. The six are encoded at CRF 29 and
 * come to 4.74 MB, against 4.62 MB for the single `rig-stereo.mp4` they now
 * replace at page load — so the default view weighs what it always weighed, and
 * whichever view is second is the one fetched on demand.
 *
 * ## Why the six are six files and not one mosaic
 *
 * They were one baked 1320x716 grid, three across and two down, with the labels
 * laid over it on a matching CSS grid. That works exactly as long as nobody
 * wants a different arrangement: the layout lived in the pixels, so the only
 * shape the page could show was the shape ffmpeg had already committed to, and
 * the label grid had to be kept in step with it by hand.
 *
 * Cut into six now — `rig-cam0..5.mp4`, one 440x358 cell each, cropped from
 * that same mosaic so they are still the same instant on each camera. The
 * arrangement is CSS, each tile carries its own label, and it can reflow on a
 * phone, none of which a baked grid can do.
 */

const BASE = "/samples";

/**
 * One, two, two, one — ACROSS, because that is how the cameras sit.
 *
 * Tam, 2026-09-10: "vẽ 6 cam cho tôi, sắp xếp kiểu 1 2 2 1", then, on seeing
 * the first attempt stacked into a vertical diamond: "1 2 2 1 xếp đúng cấu
 * trúc cam bên ngoài chứ, cái này sao xếp từ trên xuống vậy". The arrangement
 * is not a shape chosen to look tidy — it is a front elevation of the rig, and
 * a reader should be able to point at a tile and know which lens took it.
 *
 * Four columns, read left to right as the rig is worn: one camera at the outer
 * left, a pair, a pair, one camera at the outer right.
 *
 *     cam2   cam0 cam1   cam3
 *            cam4 cam5
 *
 * The middle four are two stereo pairs, each pair side by side on its own row,
 * which is the one thing a pair has to look like. The outer two span both rows
 * and centre themselves, so every tile is the same size — a tile stretched to
 * fill two rows would be the only one in the picture not showing a 440x358
 * frame at its own aspect.
 *
 * `eye` is only set where the calibration record states it: camera0 and camera4
 * report themselves left, camera1 and camera5 right. It says nothing about 2
 * and 3, so neither does the label.
 *
 * Placement is Tailwind rather than inline style because it has to be
 * responsive and an inline `style` cannot carry a breakpoint. Below `sm` the
 * classes do not apply and the tiles fall into a plain two-column grid in DOM
 * order — which is why that order is 0, 1, 4, 5, 2, 3: on a phone the pairs
 * still land beside their own partner.
 */
const MOUNTS: { cam: number; eye?: "left" | "right"; place: string }[] = [
  { cam: 0, eye: "left", place: "sm:[grid-column:2] sm:[grid-row:1]" },
  { cam: 1, eye: "right", place: "sm:[grid-column:3] sm:[grid-row:1]" },
  { cam: 4, eye: "left", place: "sm:[grid-column:2] sm:[grid-row:2]" },
  { cam: 5, eye: "right", place: "sm:[grid-column:3] sm:[grid-row:2]" },
  { cam: 2, place: "sm:[grid-column:1] sm:[grid-row:1/span_2] sm:self-center" },
  { cam: 3, place: "sm:[grid-column:4] sm:[grid-row:1/span_2] sm:self-center" },
];

export function RigViews() {
  /* Opens on all six — see "Why six by default" above. `open` still means "the
     six-up is showing", so the button, the heading and the caption all read the
     same way round they did; only the initial value moved. */
  const [open, setOpen] = useState(true);

  /* Six autoplaying cameras, and this section sits several screens down.
     `autoPlay` fetches whatever `preload` says, so mounting the videos with the
     page meant six simultaneous downloads for a section most readers had not
     reached — measured at roughly 4 MB on arrival at /samples/egocentric.

     The elements are held back until the section is near the viewport. The
     posters are not: they render immediately, so the layout is the same size
     and the same picture before and after, and nothing moves when the videos
     arrive. `rootMargin` starts the fetch a screen early so the six are running
     by the time the section is actually read. */
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
      { rootMargin: "600px 0px" },
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
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
            <div className="max-w-2xl">
              <h2
                className="bp-mono text-[10px]"
                style={{ color: C.textDim }}
              >
                What the rig sees
              </h2>
              <p
                className="mt-4 text-2xl font-medium tracking-tight md:text-3xl"
                style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
              >
                One moment,{" "}
                <span style={{ color: C.textDim }}>
                  {open ? "all six cameras" : "left and right eye"}
                </span>
              </p>
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: C.textMid }}>
                {open
                  ? "Six cameras in three stereo pairs, every frame synchronised on one clock. Cut from a single delivery file; the pairing comes from each camera's own calibration record."
                  : "The two eyes of one stereo pair, the same instant on both. Depth in the delivery comes from the offset you can see between them."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              /* `whitespace-nowrap`, and two-word labels rather than four. At
                 182px "Show all six cameras" broke across two lines inside the
                 pill, which is the one thing a CTA may not do. */
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] font-medium transition-transform active:scale-[0.98]"
              style={{ border: `1px solid ${C.rule}`, color: C.text }}
            >
              {open ? "Stereo pair" : "All six cameras"}
              <ChevronDown
                className="h-3.5 w-3.5 transition-transform"
                style={{ transform: open ? "rotate(180deg)" : undefined, color: C.textDim }}
              />
            </button>
          </div>

          {open ? (
            /* Two rows of four, capped so the tiles do not grow past the
               resolution behind them: a cell of the six-up is 440px wide, and
               at the full 1400px column each tile would be drawn at 350 and the
               outer pair at nothing better. 1200 keeps the whole rig on one
               line without upscaling anything past its own frame. */
            <div className="mx-auto mt-8 grid w-full max-w-[1200px] grid-cols-2 gap-1.5 sm:grid-cols-4">
              {MOUNTS.map(({ cam, eye, place }) => (
                <figure
                  key={cam}
                  className={`relative m-0 overflow-hidden ${place}`}
                  style={{
                    border: `1px solid ${C.hairline}`,
                    background: C.wash,
                    aspectRatio: "440 / 358",
                  }}
                >
                  {near ? (
                    <video
                      src={`${BASE}/clips/rig-cam${cam}.mp4`}
                      poster={`${BASE}/posters/rig-cam${cam}.jpg`}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="none"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${BASE}/posters/rig-cam${cam}.jpg`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  )}
                  {/* `max-w-full` + `truncate`: at 375px a tile is 92px wide and
                      "cam0 · left eye" is not, so the label has to clip inside
                      its own tile rather than widen it. */}
                  <figcaption
                    className="bp-mono pointer-events-none absolute left-1.5 top-1.5 max-w-[calc(100%-12px)] truncate px-1.5 py-0.5 text-[9px]"
                    style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
                  >
                    cam{cam}
                    {eye ? ` · ${eye}` : ""}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            /* The pair stays one baked 1280x520 file. Its eyes are 640x520
               each, against 440x358 for a cell of the six-up, and this is the
               view that has to carry the parallax — cropping it out of the
               mosaic to match would cost the resolution the claim rests on. */
            <div
              className="relative mt-8 w-full overflow-hidden"
              style={{
                border: `1px solid ${C.hairline}`,
                background: C.wash,
                aspectRatio: "1280 / 520",
                transition: `aspect-ratio 0.45s cubic-bezier(${EASE.join(",")})`,
              }}
            >
              {near ? (
                <video
                  src={`${BASE}/clips/rig-stereo.mp4`}
                  poster={`${BASE}/posters/rig-stereo.jpg`}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="none"
                  className="h-full w-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`${BASE}/posters/rig-stereo.jpg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-0 grid grid-cols-2 gap-0 p-1.5">
                {["cam0 · left eye", "cam1 · right eye"].map((t) => (
                  <div key={t} className="min-w-0">
                    <span
                      className="bp-mono inline-block max-w-full truncate px-1.5 py-0.5 text-[9px]"
                      style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.text }}
                    >
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4 text-[12px]" style={{ color: C.textDim }}>
            {open
              ? "Laid out as the cameras are mounted, left to right across the rig. Each pair sits side by side, which is what the offset between two tiles in a row is showing you. Downscaled for the browser — each camera records 1600 × 1300 and every stream ships in the delivery file."
              : "Downscaled for the browser. Each camera records 1600 × 1300 and every stream ships in the delivery file."}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
