import samples from "@/lib/samples/samples.json";
import { C } from "./tokens";

/**
 * What is actually in the catalogue, on the front door.
 *
 * `claru.ai/data-catalog`, read 2026-09-09, prints twenty-four activity words -
 * cooking, walking, assembling, pouring, ironing, driving, barista, climbing,
 * folding, skiing, typing, sewing, washing, surfing, picking up, welding,
 * packing, sweeping, painting, cycling, lifting, knitting, browsing, entering -
 * then "Spanning 14+ countries, 20+ activity domains, and thousands of hours of
 * curated footage." It is the clearest thing on their site and it takes a
 * paragraph of space.
 *
 * We held the same material and showed none of it here: the diversity block
 * lived on a category page, below the clips. R3, R17 and R20 all ask for it.
 *
 * Ours reads better than theirs for one reason we did not plan: our unit is a
 * trade, not a gerund. "Motorcycle mechanic" says who was wearing the camera
 * and why the footage is worth anything; "cooking" does not. So the words are
 * the `job` field verbatim, and every count below is a `new Set` over the
 * records rather than a number somebody typed.
 */

type Row = {
  job: string | null;
  industry: string | null;
  skillGroup: string | null;
  environment: string | null;
  durationSec: number;
};
const ALL = samples as unknown as Row[];

const uniq = (k: keyof Row) =>
  [...new Set(ALL.map((r) => r[k]).filter(Boolean))] as string[];

const JOBS = uniq("job").sort((a, b) => a.localeCompare(b));

const COUNTS = [
  { label: "Trades", value: JOBS.length },
  { label: "Industries", value: uniq("industry").length },
  { label: "Skill groups", value: uniq("skillGroup").length },
  { label: "Workplaces", value: uniq("environment").length },
];

export function Coverage() {
  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-20 lg:px-10 xl:px-16">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
          Who is on the other side of the camera
        </h2>

        <p
          className="mt-5 max-w-3xl text-2xl leading-snug md:text-[28px]"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
        >
          {JOBS.join(" · ")}
        </p>

        <p className="mt-5 max-w-2xl text-[13px] leading-relaxed" style={{ color: C.textDim }}>
          Every trade above appears in a sample you can play on this site — paid professionals doing
          their own job in their own workplace, not actors on a set. The shelf behind them is wider
          than this page indexes.
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
          {COUNTS.map((c) => (
            <div key={c.label} style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-3">
              <dt
                className="font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: C.textDim }}
              >
                {c.label}
              </dt>
              <dd
                className="mt-1 font-mono text-3xl tracking-tight"
                style={{ color: C.value, lineHeight: 1 }}
              >
                {c.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
