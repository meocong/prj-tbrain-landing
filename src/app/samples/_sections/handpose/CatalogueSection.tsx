import Link from "next/link";
import samples from "@/lib/samples/samples.json";
import { categoryBySlug } from "@/lib/samples/categories";
import { STATE_LABEL, type StateKey } from "@/lib/samples/handpose";
import { C } from "../tokens";
import { Reveal } from "../Reveal";
import { SampleCatalog } from "../SampleCatalog";
import { StateGlyph } from "./glyphs";
import { HP_RECORDS } from "./records";
import { HEADING, PageSection } from "./page-kit";
import { numberWord, pad2, startHere } from "./page-data";
import { HashLink } from "./page-links";
import { StartHere } from "./StartHere";

/**
 * The catalogue, with the page's own introduction above it.
 *
 * `SampleCatalog` prints no heading and no explanation, by design: it is the
 * same grid on every category. What a reader of THIS category needs before the
 * grid is how to read what is drawn on it, which sample to open first, and a
 * pointer to the older records that share the word "hand pose" and would
 * otherwise be taken for these.
 *
 * `#samples` is the anchor `recordHref()` targets, so a link that opens a
 * record without scripts lands here.
 */

/** The legend line's order. Not `STATES`, which starts with "none" because it is the state code order. */
const LEGEND: StateKey[] = ["measured", "guessed", "bridged", "none"];

type OldRecord = { slug: string; durationSec?: number };

/**
 * The six earlier overlay previews that live under Egocentric (six-camera).
 * Counted from the records rather than typed, so the sentence stays true if
 * one is withdrawn, as the shoe-sewing preview already was.
 */
function earlierRecords() {
  return (samples as unknown as OldRecord[]).filter((r) => r.slug.startsWith("handpose-"));
}

export function CatalogueSection() {
  const old = earlierRecords();
  const durations = new Set(old.map((r) => r.durationSec));
  const clip = durations.size === 1 && durations.has(30) ? "30-second" : "short";
  const stereo6 = categoryBySlug("egocentric") ? "/samples/egocentric/stereo6" : null;

  const chips = startHere().map((c) => ({
    label: c.label,
    slug: c.sample.slug,
    no: `#${pad2(c.sample.n)}`,
    title: c.sample.title,
    sub: c.sub,
  }));

  return (
    <div id="samples" className="scroll-mt-20">
      <PageSection tone="paper" labelledBy="hp-samples-title" padding="pb-4 pt-11 md:pb-6 md:pt-[72px]">
        <Reveal variant="rise">
          <h2 id="hp-samples-title" className="text-balance text-[28px] font-medium md:text-5xl" style={HEADING}>
            Open a sample,{" "}
            <span style={{ color: C.textDim }}>see every frame&apos;s state</span>
          </h2>

          {old.length > 0 && stereo6 && (
            <p className="mt-4 max-w-3xl text-[13px] leading-relaxed" style={{ color: C.textMid }}>
              The {numberWord(old.length)} earlier hand-pose records under Egocentric (six-camera) are {clip} overlay
              previews with no per-frame metrics.{" "}
              <Link
                href={stereo6}
                className="font-mono text-[11px] underline decoration-1 underline-offset-4"
                style={{ color: C.accent }}
              >
                See them
              </Link>
            </p>
          )}

          {/* Borders are inline and the hover is `!important`: globals.css sets
              `border-color` on `*` outside any layer, so a utility class cannot
              colour a border by itself.

              Colour is the hand, pattern is the state: said once here and drawn
              in the four chips, each of which is also a way to the full
              definitions. The fourth mark is the faint dotted bone, which is
              what "nothing was delivered" looks like in a render. */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
            <p className="text-[13px]" style={{ color: C.textMid }}>
              Colour is the hand. Pattern is how the frame was obtained.
            </p>
            <ul className="flex flex-wrap gap-2" aria-label="The four frame states">
              {LEGEND.map((k) => (
                <li key={k}>
                  <HashLink
                    id="legend"
                    className="inline-flex items-center gap-2 rounded-full py-1.5 pl-2.5 pr-3 text-[12px] transition-colors hover:border-(--sm-accent)!"
                    style={{ background: C.wash, color: C.text, border: `1px solid ${C.hairline}` }}
                  >
                    <StateGlyph state={k} width={30} />
                    {STATE_LABEL[k]}
                  </HashLink>
                </li>
              ))}
            </ul>
          </div>

          <StartHere chips={chips} />
        </Reveal>
      </PageSection>

      {/* The grid. Records come from this category's own file, not samples.json,
          so no site-wide count moves. Eight to a page: all sixteen made the
          catalogue 9,100 px of a 23,000 px page on a phone, and the comparison
          table below already lays every sample side by side. */}
      <SampleCatalog modality="handpose" records={HP_RECORDS} pageSize={8} />
    </div>
  );
}
