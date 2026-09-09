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
}

export interface CoverageAxis {
  label: string;
  /** Distinct values across the whole category, not just the ones shown. */
  total: number;
  /** Ranked by count, longest first. */
  top: CoverageBar[];
  /** Distinct values not shown, so the block never implies it is exhaustive. */
  rest: number;
}

type Row = {
  modality: string;
  rig: string;
  job: string | null;
  industry: string | null;
  skillGroup: string | null;
  environment: string | null;
  spec: [string, string][];
};
const ALL = samples as unknown as Row[];

const cell = (r: Row, k: string) => r.spec?.find((p) => p[0] === k)?.[1] ?? null;

/** Six bars. Enough to show a shape, short enough to read without scanning. */
const SHOWN = 6;

type Pick = (r: Row) => string | null;

/** Axes per modality. A category with no entry falls back to nothing. */
const AXES: Record<string, { label: string; pick: Pick }[]> = {
  egocentric: [
    { label: "Skill group", pick: (r) => r.skillGroup },
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
    .map(({ label, pick }) => {
      const counts = new Map<string, number>();
      for (const r of rows) {
        const v = pick(r);
        if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
      }
      const ranked = [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        // Ties broken alphabetically so the render is stable between builds.
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

      return {
        label,
        total: ranked.length,
        top: ranked.slice(0, SHOWN),
        rest: Math.max(0, ranked.length - SHOWN),
      };
    })
    .filter((a) => a.total > 1);
}
