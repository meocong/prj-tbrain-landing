import { gamingTitles } from "@/lib/samples/gaming";
import { clipSrc, posterSrc } from "@/lib/samples/categories";
import { C, OVER_MEDIA } from "./tokens";
import { Reveal } from "./Reveal";

/**
 * What a game session carries.
 *
 * Every other category sells what a camera saw. This one sells the input stream
 * and the camera pose aligned to the frame they happened on, and the page said
 * so in a facet rail and nowhere else — R8 asks for the games, the keystrokes
 * and the camera matrices, R16 for the category to stop borrowing robotics'
 * framing.
 *
 * The camera path is the piece that could not be said in words. `p` across the
 * shipped window is a real route through a real game world, and five of the
 * eight titles carry it. Drawing them small and side by side says "this is
 * pose data" faster than "Camera pose: populated" does, and the three without
 * are named rather than quietly left out — a missing field is a fact about the
 * capture.
 *
 * Chart notes, because they are decisions:
 *
 * - **Normalised per title, not across the set.** Five different game worlds in
 *   five different unit systems; a shared extent would draw four of them as a
 *   dot beside BeamNG's map.
 * - **One scale for both axes within a title,** so a route that is long and
 *   narrow stays long and narrow instead of being stretched to fill its box.
 * - **One hue, no legend.** A single series per plot, and the title names it.
 * - **No axis ticks.** The numbers are world coordinates in the game's own
 *   units and mean nothing to a reader; the shape is the information, and the
 *   convention that makes the shape correct is printed under it.
 */
export function GamingSet() {
  const titles = gamingTitles();
  if (titles.length === 0) return null;

  const posed = titles.filter((t) => t.path.length > 1);
  const unposed = titles.filter((t) => t.path.length <= 1);

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-14 lg:px-10 xl:px-16">
        <Reveal variant="rise">
          <h2
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: C.textDim }}
          >
            What a game session carries
          </h2>

          <p className="mt-5 max-w-2xl text-[14px] leading-relaxed" style={{ color: C.textMid }}>
            The footage is the smaller half. Every frame carries the keys held, the semantic action
            they map to, the mouse delta, and — where the title exposes it — the camera&apos;s
            position and orientation in the game world.
          </p>

          {/* The routes. Five plots, because five titles record pose. */}
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 xl:grid-cols-5">
            {posed.map((t) => (
              <figure key={t.slug} className="min-w-0">
                <div
                  className="relative w-full overflow-hidden"
                  style={{ aspectRatio: "1 / 1", background: C.wash }}
                >
                  <svg viewBox="-6 -6 112 112" className="absolute inset-0 h-full w-full">
                    <polyline
                      points={t.path.map(([x, y]) => `${x},${100 - y}`).join(" ")}
                      fill="none"
                      stroke={C.accent}
                      strokeWidth={1.4}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                    {/* Where the window starts and ends, so the line reads as a
                        route with a direction rather than as a scribble. */}
                    <circle cx={t.path[0][0]} cy={100 - t.path[0][1]} r={2.6} fill={C.accent} />
                    <circle
                      cx={t.path[t.path.length - 1][0]}
                      cy={100 - t.path[t.path.length - 1][1]}
                      r={2.6}
                      fill={C.base}
                      stroke={C.accent}
                      strokeWidth={1.4}
                    />
                  </svg>
                </div>
                <figcaption className="mt-2.5">
                  <p className="truncate text-[12.5px] font-medium" title={t.title}>
                    {t.title}
                  </p>
                  <p className="mt-1 font-mono text-[10.5px]" style={{ color: C.textDim }}>
                    {t.axis} axes · {t.keys} keys · {t.actions} actions
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>

          <p className="mt-5 max-w-3xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
            Ground-plane projection of the camera position across the shipped window, normalised per
            title — five game worlds in five unit systems, so a shared extent would draw four of
            them as a dot. Filled dot starts, hollow dot ends. The axis convention is printed
            because it is load-bearing: right-forward-up puts the floor on x and y, right-up-back
            puts it on x and z, and a loader that assumes one plots the other title&apos;s route
            against its own height.
          </p>

          {unposed.length > 0 && (
            <p className="mt-3 max-w-3xl text-[12px] leading-relaxed" style={{ color: C.textDim }}>
              {unposed.map((t) => t.title).join(", ")} record no camera pose. The rows are shipped
              with <code className="font-mono">p</code>, <code className="font-mono">yaw</code> and{" "}
              <code className="font-mono">pitch</code> null rather than interpolated, and the keys
              and actions are there in full.
            </p>
          )}

          {/* Every title, with what a buyer pays for: frames and bytes. */}
          <div className="mt-12 flex gap-3 overflow-x-auto pb-3">
            {titles.map((t) => (
              <div key={t.slug} className="w-[196px] shrink-0">
                <span
                  className="relative block w-full overflow-hidden"
                  style={{ aspectRatio: "16 / 9", background: C.band }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={posterSrc(t.slug)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  <span
                    className="pointer-events-none absolute bottom-1.5 left-1.5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]"
                    style={{ background: OVER_MEDIA.scrim, color: OVER_MEDIA.textDim }}
                  >
                    {t.frames} frames
                  </span>
                </span>
                <p className="mt-2 truncate text-[12.5px] font-medium" title={t.title}>
                  {t.title}
                </p>
                <p className="mt-0.5 truncate font-mono text-[10.5px]" style={{ color: C.textDim }}>
                  {t.sessionType} · {t.size}
                </p>
                <noscript>
                  <a href={clipSrc(t.slug)}>Clip</a>
                </noscript>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
