import { captureFor } from "@/lib/samples/capture";
import type { Category } from "@/lib/samples/categories";
import { C } from "./tokens";

/**
 * The block that makes one category page not interchangeable with another.
 *
 * Before this, swapping the h1 and the clips left nothing on
 * `/samples/egocentric` that said egocentric rather than gaming: both pages ran
 * the same summary line, the same facets, the same tier table shape and the
 * same licence. The records are nothing like each other — egocentric carries
 * RGB stereo, an IMU near 200 Hz, VIO and camera info at 30 fps into
 * `.mcap`; gaming carries 1920x1080 at 60 fps with per-frame keystrokes, mouse
 * deltas and a camera-to-world 4x4 into `.mp4` plus three sidecars — and none
 * of that difference reached the page.
 *
 * It sits high, above the clips, because it is the question a technical buyer
 * asks first and the one a chip reading `Egocentric 118` cannot answer. R1
 * (the rig split), R5 (annotation depth) and R8/R16 (gaming stating its
 * keystrokes and camera matrices) are all this block.
 */
export function CaptureSpec({ category }: { category: Category }) {
  const rows = captureFor(category);
  if (rows.length === 0) return null;

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-4 pt-14 lg:px-10 xl:px-16">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
          How this is captured
        </h2>

        <dl className="mt-6">
          {rows.map((r) => (
            <div
              key={r.label}
              className="grid gap-x-8 gap-y-1 py-3 md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)]"
              style={{ borderTop: `1px solid ${C.hairline}` }}
            >
              <dt className="text-[12.5px]" style={{ color: C.textDim }}>
                {r.label}
              </dt>
              <dd className="font-mono text-[12.5px] leading-relaxed" style={{ color: C.value }}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
