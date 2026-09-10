"use client";

import { useState } from "react";
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
 * ## Why two by default and six behind a control
 *
 * Two is the claim a reader needs settled — "stereo" is a word until you see
 * parallax between two frames of one moment. Six at card size is six
 * thumbnails, which reads as a contact sheet and proves less than the pair
 * does. So the pair plays, and the whole rig is one click away for the reader
 * who wants it.
 *
 * It also keeps 7.6 MB off the page for everyone who does not: the six-up
 * mounts on expand rather than at page load, so it is fetched when asked for.
 * Same arm-on-demand shape as `FaceBand` in CategoryChooser.
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
 * The diamond: one, two, two, one.
 *
 * Tam, 2026-09-10: "vẽ 6 cam cho tôi, sắp xếp kiểu 1 2 2 1". Four columns with
 * every tile spanning two of them, so the singles at top and bottom sit centred
 * and every tile is the same width — a 3x2 contact sheet reads as a spreadsheet
 * of thumbnails, and this reads as a head.
 *
 * Which camera goes where follows the pairing, not the numbering. Pairs are
 * (0,1), (2,3), (4,5), read off each camera's own `camera_info` frame id rather
 * than guessed. Two of them get a row each, side by side, because that is what
 * a stereo pair looks like. The third closes the diamond top and bottom.
 *
 * `eye` is only set where the calibration record states it: camera0 and camera4
 * report themselves left, camera1 and camera5 right. It says nothing about 2
 * and 3, so neither does the label.
 */
const DIAMOND: { cam: number; eye?: "left" | "right"; col: number; row: number }[] = [
  { cam: 2, col: 2, row: 1 },
  { cam: 0, eye: "left", col: 1, row: 2 },
  { cam: 1, eye: "right", col: 3, row: 2 },
  { cam: 4, eye: "left", col: 1, row: 3 },
  { cam: 5, eye: "right", col: 3, row: 3 },
  { cam: 3, col: 2, row: 4 },
];

export function RigViews() {
  const [open, setOpen] = useState(false);

  return (
    <section className="bp-grid bp-frame relative" style={{ backgroundColor: C.band, color: C.text }}>
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

          {/* One frame, two states. The aspect ratio changes with the layout —
              1280x520 for the pair, 1320x716 for the mosaic — so the box is
              sized per state rather than fixed, which stops the swap from
              letterboxing one of them. */}
          <div
            className="relative mt-8 w-full overflow-hidden"
            style={{
              border: `1px solid ${C.hairline}`,
              background: C.wash,
              aspectRatio: open ? "1320 / 716" : "1280 / 520",
              transition: `aspect-ratio 0.45s cubic-bezier(${EASE.join(",")})`,
            }}
          >
            {/* Keyed so React swaps the element rather than re-pointing one
                video's src, which on Safari keeps the previous frame on screen
                until the new file has buffered. */}
            <video
              key={open ? "six" : "stereo"}
              src={open ? `${BASE}/clips/rig-six.mp4` : `${BASE}/clips/rig-stereo.mp4`}
              poster={open ? `${BASE}/posters/rig-six.jpg` : `${BASE}/posters/rig-stereo.jpg`}
              muted
              loop
              playsInline
              autoPlay
              preload="none"
              className="h-full w-full object-cover"
            />

            {/* Which view is which.
                A grid laid over the media with the SAME shape as the mosaic —
                two columns for the pair, three by two for the six — so each
                label sits in its own cell and cannot reach its neighbour. The
                first version positioned them at hard-coded percentages, which
                held at desktop and collapsed at 182px: the labels are wider
                than a third of a narrow viewport, so they overlapped into
                "CAM0 · CAM1 · CAM2 RIGHT".

                `min-w-0` on the cell plus `truncate` on the label is what makes
                that true rather than merely intended — without it a long label
                widens its own track and pushes the grid out of step with the
                video underneath. */}
            <div
              className="pointer-events-none absolute inset-0 grid gap-0 p-1.5"
              style={{
                gridTemplateColumns: open ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
                gridTemplateRows: open ? "repeat(2, 1fr)" : "1fr",
              }}
            >
              {(open
                ? ["cam0 · left", "cam1 · right", "cam2", "cam3", "cam4 · left", "cam5 · right"]
                : ["cam0 · left eye", "cam1 · right eye"]
              ).map((t) => (
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

          <p className="mt-4 text-[12px]" style={{ color: C.textDim }}>
            Downscaled for the browser. Each camera records 1600 &times; 1300 and every stream
            ships in the delivery file.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
