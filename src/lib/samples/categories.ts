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
  /**
   * What a category with no playable sample can put in the place of a frame.
   *
   * Three of the six hold nothing on disk, and a chooser card is mostly its
   * media band. Repeating the state line there said the same words twice; a
   * borrowed frame from a neighbouring category would be a lie about what we
   * can show. So: the one figure that is true about the category, set large.
   *
   * Each is copied from the prose in `IN_FLIGHT` or `CAPABILITY` for the same
   * modality - if one moves, move both.
   */
  held?: { figure: string; unit: string };
}

export const CATEGORIES: Category[] = [
  {
    slug: "egocentric",
    line: "robotics",
    name: "Egocentric",
    modality: "egocentric",
    whatItIs:
      "Head-mounted capture of skilled manual work, filmed from the worker's own viewpoint while they do their job.",
    // Hedged, but not in Claru's words. Theirs reads "approximately 118k hours
    // ... Approximate, and the figure may overlap across sources" - they broker,
    // so their hours can be counted twice. Ours cannot: we shot all of it, and
    // the reason for the hedge is that the shelf is bigger than what is indexed
    // here, which is a different admission and should not borrow their sentence.
    shelf:
      "The shelf behind these runs to roughly 15,000 episodes and 1,200 hours, shot across 70+ operating businesses. Counted off our own collection, rounded down.",
  },
  {
    slug: "exocentric",
    line: "robotics",
    name: "Exocentric",
    modality: "exocentric",
    whatItIs:
      "The same work seen from outside the body: a fixed or handheld camera watching the whole person, not just their hands.",
    shelf: null,
    // IN_FLIGHT.exocentric: "20 hours in collection since 5 September 2026".
    held: { figure: "20 h", unit: "in collection · 15 operators" },
  },
  {
    slug: "teleoperation",
    line: "robotics",
    name: "Teleoperation",
    modality: "teleoperation",
    whatItIs:
      "Robot episodes rather than human ones. Joint state and action recorded alongside the cameras, in the format policy training reads.",
    shelf: null,
    // IN_FLIGHT.teleoperation, counted off the disk rather than off the
    // dataset's own manifest, which disagrees with it.
    held: { figure: "11", unit: "LeRobot episodes · 14,076 frames" },
  },
  {
    slug: "mocap",
    line: "robotics",
    name: "Mocap",
    modality: "mocap",
    whatItIs:
      "Full-body motion capture with per-finger hand pose, for work that hands alone do not describe.",
    shelf: null,
    // CAPABILITY.mocap, the only tier on it. Nothing is collected, so the true
    // figure here is the price of collecting it.
    held: { figure: "$720-1,200", unit: "per hour · collected to spec" },
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
    held: { figure: "terminal-bench", unit: "verified tasks · own sample area" },
  },
];

type Row = {
  slug: string;
  modality: string;
  durationSec: number;
  skillGroup: string | null;
  spec: [string, string][];
};
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

/**
 * Slugs to show as the face of a category, spread across skill groups.
 *
 * The chooser was six text blocks on hairlines: zero images and zero video on
 * the front door of a catalogue whose entire product is footage. There are 126
 * posters and 126 clips on disk keyed by exactly this slug — they were sitting
 * unused one route away.
 *
 * Round-robin over skill groups rather than taking the first n, because the
 * first n of 118 egocentric records are all one group and the strip would show
 * the same workbench four times. Deterministic, so the server render and the
 * client hydration agree.
 */
export function facesFor(c: Category, n: number): string[] {
  const rows = c.modality ? ALL.filter((r) => r.modality === c.modality) : [];
  if (rows.length === 0) return [];

  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const k = r.skillGroup ?? "—";
    (groups.get(k) ?? groups.set(k, []).get(k)!).push(r);
  }

  const lanes = [...groups.values()];
  const out: string[] = [];
  for (let i = 0; out.length < n && i < rows.length; i++) {
    for (const lane of lanes) {
      if (out.length >= n) break;
      if (lane[i]) out.push(lane[i].slug);
    }
  }
  return out;
}

export const posterSrc = (slug: string) => `/samples/posters/${slug}.jpg`;
export const clipSrc = (slug: string) => `/samples/clips/${slug}.mp4`;

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
