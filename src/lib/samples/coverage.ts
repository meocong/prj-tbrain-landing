import samples from "./samples.json";

/**
 * The shape of a category, as counts rather than a list of names.
 *
 * `FacetIndex` printed every distinct value of every facet. For egocentric that
 * was 78 workplaces in one paragraph, alphabetically — which is the worst
 * possible order, because it buries the nine records shot in a sewing factory
 * between "Office Workspace, Library" and "Auto Repair, Service Counter". A
 * reader learns nothing from a wall except that the wall is long.
 *
 * Two faults, and they compound. The second is that `environment` is two axes
 * crammed into one string: 31 site types crossed with 44 areas inside them
 * produce 78 compounds, so the cardinality was never real. It is split here.
 *
 * What a buyer wants from this block is the MIX — is this catalogue mostly
 * kitchens, is it evenly spread, is one rig doing all the work. That is a
 * magnitude question, so it gets bars and a top-n, not prose.
 *
 * The axes differ per category on purpose. Egocentric is cut by trade, industry
 * and site; gaming has none of those and is cut by title, session type and
 * stress category. That difference is the thing that makes one detail page not
 * interchangeable with the next, and it comes free from the records.
 */

export interface CoverageBar {
  name: string;
  count: number;
  /**
   * Hours in this bucket, and the value the bar length encodes.
   *
   * Ranking by record count and ranking by hours give a different order —
   * measured on egocentric, "Pick and Place / Object Handling" is first by
   * count with 14 clips and third by duration with 1.58 h, behind "Tool Use &
   * Technical Manipulation" at 1.97 h from 13. A buyer licenses hours, so the
   * bar has to be hours; the count rides along as text because "1.97 h from 13
   * clips" and "1.97 h from 90" are different products.
   */
  hours: number;
}

export interface CoverageAxis {
  label: string;
  /** Distinct values across the whole category, not just the ones shown. */
  total: number;
  /** Ranked by hours, longest first — unless `ordinal`. */
  top: CoverageBar[];
  /** Distinct values not shown, so the block never implies it is exhaustive. */
  rest: number;
  /**
   * A fixed order for an axis that has one.
   *
   * Difficulty is a scale, not a set of labels. Ranking it by size would put
   * easy, medium and hard in whatever order the catalogue happens to have, and
   * sorting it alphabetically is worse — easy, hard, medium reads as a scale
   * that goes down and then up. Where this is set the bars follow it.
   */
  ordinal?: boolean;
}

type Row = {
  modality: string;
  rig: string;
  job: string | null;
  industry: string | null;
  skillGroup: string | null;
  environment: string | null;
  durationSec: number;
  spec: [string, string][];
};
const ALL = samples as unknown as Row[];

const cell = (r: Row, k: string) => r.spec?.find((p) => p[0] === k)?.[1] ?? null;

/** Six bars. Enough to show a shape, short enough to read without scanning. */
const SHOWN = 6;

type Pick = (r: Row) => string | null;
type AxisCfg = { label: string; pick: Pick; order?: string[] };

/** Axes per modality. A category with no entry falls back to nothing. */
const AXES: Record<string, AxisCfg[]> = {
  egocentric: [
    { label: "Skill group", pick: (r) => r.skillGroup },
    {
      // R3, and the split the off-the-shelf shelf below is named for. 104 of
      // the 118 are in an operating business and 14 are homes, backyards and
      // hotel rooms — a fact the page implied in a heading and never counted.
      label: "Setting",
      pick: (r) =>
        /^(Backyard|Home|Hotel Room|Bedroom|Residential|Garden)/i.test(
          (r.environment ?? "").split(",")[0]?.trim() ?? "",
        )
          ? "Residential"
          : r.environment
            ? "Non-residential"
            : null,
      order: ["non-residential", "residential"],
    },
    {
      label: "Difficulty",
      pick: (r) => cell(r, "Difficulty"),
      // The scale, not the ranking. 118 of the 126 records carry this and it
      // was on no page at all, while R3, R12 and R14 all ask for it.
      order: ["easy", "medium", "hard"],
    },
    { label: "Trade", pick: (r) => r.job },
    { label: "Industry", pick: (r) => r.industry },
    // The business, not the corner of it. "Auto Repair, Service Bay" and "Auto
    // Repair, Repair Bench" are one site type answering one question.
    { label: "Site type", pick: (r) => r.environment?.split(",")[0]?.trim() ?? null },
  ],
  gaming: [
    { label: "Title", pick: (r) => cell(r, "Title") },
    { label: "Session type", pick: (r) => cell(r, "Session type") },
    { label: "Stress category", pick: (r) => cell(r, "Stress category") },
    { label: "Capture", pick: (r) => cell(r, "Capture") },
  ],
};

export function coverageFor(modality: string): CoverageAxis[] {
  const rows = ALL.filter((r) => r.modality === modality);
  const axes = AXES[modality];
  if (!rows.length || !axes) return [];

  return axes
    .map(({ label, pick, order }) => {
      const buckets = new Map<string, { count: number; sec: number }>();
      for (const r of rows) {
        const v = pick(r);
        if (!v) continue;
        const b = buckets.get(v) ?? { count: 0, sec: 0 };
        b.count += 1;
        b.sec += r.durationSec;
        buckets.set(v, b);
      }

      const bars = [...buckets.entries()].map(([name, b]) => ({
        name,
        count: b.count,
        hours: b.sec / 3600,
      }));

      const ranked = order
        ? // Scale order, and anything the scale does not name goes after it
          // rather than being dropped — a value we did not expect is a fact
          // about the data, not a rendering error.
          bars.sort(
            (a, b) =>
              (order.indexOf(a.name.toLowerCase()) + 1 || 99) -
                (order.indexOf(b.name.toLowerCase()) + 1 || 99) ||
              a.name.localeCompare(b.name),
          )
        : // Ties broken alphabetically so the render is stable between builds.
          bars.sort((a, b) => b.hours - a.hours || a.name.localeCompare(b.name));

      return {
        label,
        total: ranked.length,
        top: ranked.slice(0, SHOWN),
        rest: Math.max(0, ranked.length - SHOWN),
        ordinal: Boolean(order),
      };
    })
    .filter((a) => a.total > 1);
}
