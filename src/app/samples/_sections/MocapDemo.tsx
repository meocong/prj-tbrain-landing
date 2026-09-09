import { C } from "./tokens";

/**
 * The mocap sample, playing on the page.
 *
 * `/samples/mocap` said "Collected to spec" and showed a drawing, on the
 * grounds that we hold no mocap footage. That was wrong, and the evidence was
 * in the capability sheet's own "Visualized Demo" column the whole time: a
 * deployed pose bundle at `pose-demo-3d.surge.sh` carrying a 160-second
 * recording, 80 keyframes synchronised to it, and 4,801 frames of wrist
 * trajectory at 30 fps with all 21 Xsens hand joints as position and
 * quaternion.
 *
 * It is built to be embedded — the demo page itself prints `Embed:
 * /pose-explorer.html` — so this is the mocap equivalent of the clip grid every
 * other category has. Mocap's product is a pose stream, not footage; a video
 * player would be the wrong instrument for it and the explorer is the right
 * one.
 *
 * Iframed rather than rebuilt. The explorer is ours, it is already deployed,
 * and a second implementation of a pose viewer on this site would be a second
 * thing to keep in step with the data.
 */

const BASE = "https://pose-demo-3d.surge.sh";

/** Straight from the demo, which reads them off the bundle it is showing. */
const FACTS = [
  { value: "160 s", label: "Recording" },
  { value: "80", label: "Synced keyframes" },
  { value: "4,801", label: "Wrist frames" },
  { value: "21", label: "Joints per hand" },
  { value: "30 fps", label: "Delivered rate" },
];

export function MocapDemo() {
  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-14 lg:px-10 xl:px-16">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
          Play the mocap sample
        </h2>

        <p className="mt-5 max-w-2xl text-[14px] leading-relaxed" style={{ color: C.textMid }}>
          A real bundle, not a rendering: video with the Xsens hand and wrist pose synchronised to
          it, frame for frame. Scrub the timeline and the pose follows.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-5">
          {FACTS.map((f) => (
            <div key={f.label} style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-3">
              <dd
                className="font-mono text-2xl tracking-tight md:text-[28px]"
                style={{ color: C.value, lineHeight: 1 }}
              >
                {f.value}
              </dd>
              <dt
                className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: C.textDim }}
              >
                {f.label}
              </dt>
            </div>
          ))}
        </dl>

        {/* Lazy, because it is a third-party document and this section is below
            the fold on every viewport. */}
        <div
          className="mt-10 w-full overflow-hidden"
          style={{ border: `1px solid ${C.hairline}`, background: C.band }}
        >
          <iframe
            src={`${BASE}/pose-explorer.html`}
            title="Egocentric video with synchronised Xsens hand pose"
            loading="lazy"
            className="block h-[520px] w-full md:h-[620px]"
            style={{ border: "none" }}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
          <a
            href={`${BASE}/pose-explorer.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11.5px] underline decoration-1 underline-offset-4"
            style={{ color: C.accent }}
          >
            Open the pose explorer full screen
          </a>
          <a
            href={`${BASE}/wrist.html`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11.5px] underline decoration-1 underline-offset-4"
            style={{ color: C.accent }}
          >
            Wrist charts — trajectory, speed, grip, XYZ
          </a>
          <span className="font-mono text-[11.5px]" style={{ color: C.textDim }}>
            Raw sample: wrist_sample.json · 2.1 MB · 150 frames · position + quaternion
          </span>
        </div>
      </div>
    </section>
  );
}
