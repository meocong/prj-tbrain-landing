import { CATEGORIES, statsForCategory, type Category } from "@/lib/samples/categories";
import { INTEROP } from "@/lib/samples/capability";
import { C } from "./tokens";

/**
 * The two ways to buy, given a section instead of a clause.
 *
 * This page offered both routes in six words in the hero subhead - "Off the
 * shelf, or collected to your spec" - and said nothing more about either.
 * Tam's R2 asks for both, per category. `claru.ai/data-catalog`, read
 * 2026-09-09, gives them a numbered block with two sentences each ("01
 * Off-the-Shelf, Tailored", "02 Bespoke Collection"), and a buyer who wants
 * bespoke has no reason to keep scrolling a page that only shows a catalogue.
 *
 * Numbered because they are alternatives and a reader should see there are
 * exactly two, which is the one thing Claru's version gets right that a pair of
 * unnumbered columns would not.
 *
 * `category` switches this from the front-door version to the one that can put
 * real figures under each route. Both are the same two paragraphs; only the
 * figures differ, so a reader who reads it twice is not reading two claims.
 */
export function TwoRoutes({ category }: { category?: Category }) {
  const shelf = shelfFigures(category);
  const spec = specFigures(category);

  return (
    <section style={{ background: C.base, color: C.text }}>
      <div className="mx-auto max-w-[1400px] px-4 pb-20 pt-4 lg:px-10 xl:px-16">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: C.textDim }}>
          Two ways to buy
        </h2>

        <div className="mt-6 grid gap-x-12 gap-y-10 md:grid-cols-2">
          <Route
            n="01"
            name="Off the shelf"
            body="Already recorded, indexed and cleared. Play any of it on this page, read the telemetry beside it, then licence the sets you want. No collection lead time — the files exist."
            figures={shelf}
          />
          <Route
            n="02"
            name="Collected to your spec"
            body="You name the environment, the device, the task mix and the volume. We design the capture, run it in operating businesses with paid professionals, and hand back the same delivery shape as the shelf."
            figures={spec}
          />
        </div>

        <p
          className="mt-10 pt-4 font-mono text-[11px]"
          style={{ borderTop: `1px solid ${C.hairline}`, color: C.textDim }}
        >
          Either route delivers as {INTEROP}
        </p>
      </div>
    </section>
  );
}

function Route({
  n,
  name,
  body,
  figures,
}: {
  n: string;
  name: string;
  body: string;
  figures: string[];
}) {
  return (
    <div style={{ borderTop: `1px solid ${C.hairline}` }} className="pt-5">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px]" style={{ color: C.accent }}>
          {n}
        </span>
        <h3
          className="text-xl font-medium tracking-tight"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
        >
          {name}
        </h3>
      </div>

      <p className="mt-3 max-w-md text-[13.5px] leading-relaxed" style={{ color: C.textMid }}>
        {body}
      </p>

      {figures.length > 0 && (
        <ul className="mt-4">
          {figures.map((f) => (
            <li
              key={f}
              className="py-1.5 font-mono text-[11.5px]"
              style={{ borderTop: `1px solid ${C.hairlineSoft}`, color: C.value }}
            >
              {f}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Published records, for one category or for all of them. Derived, never written. */
function shelfFigures(c?: Category): string[] {
  const cats = c ? [c] : CATEGORIES;
  const s = cats.map(statsForCategory);
  const episodes = s.reduce((a, x) => a + x.episodes, 0);
  const hours = s.reduce((a, x) => a + x.hours, 0);
  if (episodes === 0) {
    // Honest rather than blank: the category has a shelf, it is not indexed here
    // yet, and saying "0 samples" would read as "we have none".
    return ["Nothing published in this category yet", "Ask and we will send what we hold"];
  }
  return [
    `${episodes} samples published${c ? "" : " across six catalogues"}`,
    `${hours.toFixed(1)} hours playable on this site`,
  ];
}

/**
 * Ramp, ceiling and price. For one category that is its cheapest tier; for the
 * front door it is the cheapest and the fastest across every tier we price, so
 * the figure is a floor rather than a quote.
 */
function specFigures(c?: Category): string[] {
  const tiers = (c ? [c] : CATEGORIES).flatMap((x) => statsForCategory(x).tiers);
  if (tiers.length === 0) return ["Priced per brief"];

  const num = (s: string) => parseFloat(s.replace(/[^0-9.]/g, "")) || Infinity;
  const cheapest = tiers.reduce((a, b) => (num(a.price) <= num(b.price) ? a : b));
  const fastest = tiers.reduce((a, b) => (num(a.ramp) <= num(b.ramp) ? a : b));

  // The ceiling only appears per category. On the front door the cheapest tier
  // and the fastest tier are usually not the same row, and printing one row's
  // ceiling under another row's price would read as a single offer that nothing
  // in the sheet supports.
  return c
    ? [`From ${cheapest.price}`, `First delivery in ${fastest.ramp}`, `Up to ${cheapest.ceiling}`]
    : [`From ${cheapest.price}, across ${tiers.length} priced tiers`, `Fastest ramp ${fastest.ramp}`];
}
