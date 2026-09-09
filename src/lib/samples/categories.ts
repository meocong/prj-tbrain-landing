import samples from "./samples.json";
import { CAPABILITY, IN_FLIGHT, type CapabilityTier } from "./capability";

/**
 * The six things a buyer can be here for.
 *
 * `/samples` used to be one grid with a facet rail, which asked a reader to
 * learn what "egocentric" means from a chip reading `Egocentric 118`. Both
 * catalogues we read route instead of filtering: a chooser, then a page per
 * category that can afford to explain itself. `samples.tbrain.ai` is one of
 * those pages already done properly, and this is the shape that generalises it.
 *
 * Each category needs a sentence saying what it IS, because the name does not
 * say it. That is the block the page never had.
 */

export interface Category {
  slug: string;
  /** Which purchase this belongs to. Two buyers, kept apart. */
  line: "robotics" | "gaming" | "coding";
  name: string;
  /** Matches `Sample["modality"]`. Null where the records live elsewhere. */
  modality: string | null;
  /** What it IS, in one sentence, for a reader who has not met the word. */
  whatItIs: string;
  /**
   * The shelf behind the samples, hedged the way Claru hedges it: a figure and
   * an admission that it is approximate. Null where there is no shelf claim.
   */
  shelf: string | null;
  /** Where this category's records live, if not on this site. */
  externalHref?: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "egocentric",
    line: "robotics",
    name: "Egocentric",
    modality: "egocentric",
    whatItIs:
      "Head-mounted capture of skilled manual work, filmed from the worker's own viewpoint while they do their job.",
    shelf:
      "Around 1,200 hours across roughly 15,000 episodes on the shelf, collected in 70+ operating businesses. Figures are approximate.",
  },
  {
    slug: "exocentric",
    line: "robotics",
    name: "Exocentric",
    modality: "exocentric",
    whatItIs:
      "The same work seen from outside the body: a fixed or handheld camera watching the whole person, not just their hands.",
    shelf: null,
  },
  {
    slug: "teleoperation",
    line: "robotics",
    name: "Teleoperation",
    modality: "teleoperation",
    whatItIs:
      "Robot episodes rather than human ones. Joint state and action recorded alongside the cameras, in the format policy training reads.",
    shelf: null,
  },
  {
    slug: "mocap",
    line: "robotics",
    name: "Mocap",
    modality: "mocap",
    whatItIs:
      "Full-body motion capture with per-finger hand pose, for work that hands alone do not describe.",
    shelf: null,
  },
  {
    slug: "gaming",
    line: "gaming",
    name: "Gaming",
    modality: "gaming",
    whatItIs:
      "Screen capture from live play with every keystroke, mouse delta and camera pose aligned to the frame it happened on.",
    shelf: null,
  },
  {
    slug: "coding-stem",
    line: "coding",
    name: "Coding & STEM",
    modality: null,
    whatItIs:
      "Terminal benchmark tasks with deterministic verification, authored and peer-reviewed by engineers in each domain.",
    shelf: null,
    // Already a product with its own gated sample area. Tam's instruction was to
    // bring the samples the site already has into one system, not to rebuild
    // them, so this card routes out rather than duplicating the catalogue.
    externalHref: "/data/terminal-bench",
  },
];

type Row = { modality: string; durationSec: number; spec: [string, string][] };
const ALL = samples as unknown as Row[];

export interface CategoryStats {
  episodes: number;
  hours: number;
  tiers: CapabilityTier[];
  /** Collected but not published here, stated as a fact with a count or date. */
  inFlight: string | null;
}

export function statsForCategory(c: Category): CategoryStats {
  const rows = c.modality ? ALL.filter((r) => r.modality === c.modality) : [];
  return {
    episodes: rows.length,
    hours: rows.reduce((a, r) => a + r.durationSec, 0) / 3600,
    tiers: (c.modality && CAPABILITY[c.modality]) || [],
    inFlight: (c.modality && IN_FLIGHT[c.modality]) || null,
  };
}

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/**
 * The line above the clips on `samples.tbrain.ai`, generalised: a count of what
 * makes this set varied, derived rather than written down.
 *
 * That page opens with "10 hard episodes · 37.7 minutes · 10 skill categories ·
 * 10 distinct tasks · 7 industries · 10 workstations · 10 professional operators
 * · 4 cities · 2 rig families". This is the same idea against whatever the
 * category actually holds.
 */
export function packSummary(c: Category): string | null {
  const rows = c.modality ? ALL.filter((r) => r.modality === c.modality) : [];
  if (rows.length === 0) return null;

  const cell = (r: Row, k: string) => r.spec?.find((p) => p[0] === k)?.[1] ?? null;
  const count = (k: string) => new Set(rows.map((r) => cell(r, k)).filter(Boolean)).size;
  const mins = rows.reduce((a, r) => a + r.durationSec, 0) / 60;

  const parts = [
    `${rows.length} episodes`,
    `${mins.toFixed(1)} minutes`,
    `${count("Skill group")} skill groups`,
    `${count("Task id")} distinct tasks`,
    `${count("Industry")} industries`,
    `${count("Workplace")} workplaces`,
    `${count("Operator")} operators`,
    `${count("Device")} rigs`,
  ].filter((p) => !p.startsWith("0 "));

  return parts.join(" · ");
}
