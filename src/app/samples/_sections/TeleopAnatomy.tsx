import { channelsFor, isInert, teleopEpisode } from "@/lib/samples/teleop";
import { C } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * A teleoperation episode, opened up.
 *
 * The page showed three synchronised videos and said "16-dimensional state and
 * action per frame" in a caption. That is the fact; this is the product. A
 * policy trained on this set never sees the video alone — it sees the state the
 * arms were in and the action commanded, and learns the second from the first.
 *
 * Sixteen channels, grouped the way the dataset's own `meta/modality.json`
 * groups them: seven joints an arm, one gripper each side.
 *
 * Chart decisions, because they are decisions:
 *
 * - **Two series, so there is a legend,** and they are direct-labelled on the
 *   first plot as well. Action is what was asked for; state is what the arm
 *   did. The gap between them is the whole reason both are shipped.
 * - **A scale shared inside a segment, not across all sixteen.** The seven arm
 *   joints are radians and comparable with each other; a gripper is not, and
 *   one scale over both would flatten every joint to accommodate it. Each
 *   segment prints the range it is drawn on.
 * - **No axis ticks per channel.** Sixteen sets of ticks is a wall; the range
 *   is stated once per segment and the shape is the information.
 * - **Sampled, not decimated blindly.** Every sixth row of 1,444, which is
 *   about 6 Hz over 48 seconds — enough to show a joint settle, and 42 KB
 *   instead of 370.
 */
export function TeleopAnatomy() {
  const ep = teleopEpisode();
  if (!ep) return null;

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: C.textDim }}
          >
            One episode, opened up
          </h2>

          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed" style={{ color: C.textMid }}>
            The video is what a person watches. This is what a policy reads: sixteen numbers for the
            state the arms were in and sixteen for the action commanded, {ep.fps} times a second, for
            all {ep.frames.toLocaleString()} frames of episode {ep.episode}.
          </p>

          {/* Legend. Two series, so it is not optional. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2">
            <span className="inline-flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-block h-[2px] w-6" style={{ background: C.accent }} />
              <span style={{ color: C.textMid }}>Action — what was commanded</span>
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px]">
              <span className="inline-block h-[2px] w-6" style={{ background: C.textDim }} />
              <span style={{ color: C.textMid }}>State — what the arm did</span>
            </span>
            <span className="font-mono text-[11px]" style={{ color: C.textDim }}>
              {ep.durationSec}s · every 6th frame
            </span>
          </div>

          <div className="mt-8 space-y-9">
            {ep.segments.map((seg) => {
              const chans = channelsFor(ep, seg);
              const inert = isInert(ep, seg);
              return (
                <div key={seg.name}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <p className="text-[13px] font-medium">{seg.name}</p>
                    <p className="font-mono text-[10.5px]" style={{ color: C.textDim }}>
                      state[{seg.start}:{seg.end}] · {chans.length}{" "}
                      {chans.length === 1 ? "channel" : "channels"}
                      {inert
                        ? " · not commanded in this episode"
                        : ` · drawn on ${chans[0].min.toFixed(2)} to ${chans[0].max.toFixed(2)}`}
                    </p>
                  </div>

                  {/* A segment that never moved gets a sentence, not seven flat
                      lines. Drawn, they read as a rendering fault; omitted, a
                      buyer plans a bimanual policy on a single-arm recording. */}
                  {inert ? (
                    <p
                      className="mt-3 max-w-2xl px-4 py-3 text-[12.5px] leading-relaxed"
                      style={{ border: `1px solid ${C.hairline}`, background: C.band, color: C.textMid }}
                    >
                      Held at zero for the whole episode. The action column is exactly 0.0 on every
                      frame and the state never leaves sensor noise, so this side of the robot was
                      not driven — the rig is bimanual, this recording is not.
                    </p>
                  ) : (
                  <div
                    className={`mt-3 grid gap-2 ${
                      chans.length > 1 ? "grid-cols-2 sm:grid-cols-4 xl:grid-cols-7" : "grid-cols-2"
                    }`}
                  >
                    {chans.map((ch) => (
                      <figure key={ch.i} className="min-w-0">
                        <svg
                          viewBox="0 -4 100 108"
                          preserveAspectRatio="none"
                          className="block h-[54px] w-full"
                          style={{ background: C.wash }}
                        >
                          <polyline
                            points={ch.state}
                            fill="none"
                            stroke={C.textDim}
                            strokeWidth={1.6}
                            vectorEffect="non-scaling-stroke"
                          />
                          <polyline
                            points={ch.action}
                            fill="none"
                            stroke={C.accent}
                            strokeWidth={1.6}
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        <figcaption
                          className="mt-1 font-mono text-[9.5px]"
                          style={{ color: C.textDim }}
                        >
                          [{ch.i}]
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-6 max-w-3xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
            Column indices are the dataset&apos;s own, from{" "}
            <code className="font-mono">meta/modality.json</code>: seven joints an arm, one gripper a
            side, and action laid out identically to state. Each segment is drawn on its own scale —
            arm joints are radians and comparable with each other, a gripper is not, and one scale
            across both would flatten every joint to fit it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
