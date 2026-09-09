import samples from "./samples.json";

/**
 * The layer between a modality and a clip.
 *
 * Both catalogues we read (`claru.ai/data-catalog`, `humanoidlayer.dev`) shop at
 * this level: a card is a *dataset* with a name, a paragraph and its counts, not
 * a single clip with a title. A lab does not go looking for one haircut clip. It
 * looks for "egocentric tool use, thousands of hours, commercially licensable",
 * and until now this page had no object that answered that sentence.
 *
 * Grouping is a decision, not a script. `skillGroup` gives sixteen buckets and
 * twelve of them hold fewer than ten records, so a card per group would ship
 * "Inventory & Stock Management, 1 episode" — a clip wearing a heading. These
 * eight merge adjacent groups until every card is worth opening. The smallest is
 * six records; the boundaries moved, the counts did not.
 *
 * Every figure on a card is DERIVED from the records at render time. Nothing
 * here is a written-down number that can go stale the next time samples.json
 * changes.
 *
 * What is deliberately absent: a "use cases" line. Claru ends every card with
 * one ("Use cases: kitchen robotics, recipe-following agents"). That is a
 * commercial claim about what the data suits, not something derivable from a
 * record, and putting eight of them on a sales page unreviewed is how a page
 * starts promising things nobody at Tbrain agreed to. The prose below states
 * what is in each set and stops there.
 */

export interface Dataset {
  slug: string;
  /** Buyer, not modality: robotics and gaming are two different purchases. */
  line: "robotics" | "gaming";
  name: string;
  /** `skillGroup` values this dataset covers. Empty means "the whole line". */
  skillGroups: string[];
  /** Written from the records: environments, rigs, tasks. No claims. */
  blurb: string;
}

export const DATASETS: Dataset[] = [
  {
    slug: "tools-and-repair",
    line: "robotics",
    name: "Tools, machines and repair",
    skillGroups: [
      "Tool Use & Technical Manipulation",
      "Mechanical / Automotive Work",
      "Repair & Maintenance",
    ],
    blurb:
      "Tool-mediated work on machines that are already broken: cowl installation on a motorcycle, an automotive electrical component serviced on the bench, engine repair, a barber trimming a neckline. Shot across motorcycle and auto repair shops, metal fabrication, woodworking and construction sites. The hardest set in the catalogue.",
  },
  {
    slug: "cleaning-and-tidying",
    line: "robotics",
    name: "Cleaning and tidying",
    skillGroups: ["Cleaning & Sanitation", "Organization & Tidying", "Dish Handling"],
    blurb:
      "Surfaces wiped, trash cleared, tools put back, dishes handled. Recorded in offices, restaurants, commercial kitchens, workshops and repair bays rather than staged for the camera, so the mess is real and so is the order it ends in. The largest and the most consistently graded easy.",
  },
  {
    slug: "handling-and-packing",
    line: "robotics",
    name: "Handling, packing and stock",
    skillGroups: [
      "Pick and Place / Object Handling",
      "Packing & Bagging",
      "Inventory & Stock Management",
    ],
    blurb:
      "Objects picked up, moved, sorted and bagged, plus the fiddly end of it: copper wires threaded and routed through a motor, parts sorted by hand, a bag held open while it is filled. Seventeen distinct workplaces, from sewing factories to restaurants.",
  },
  {
    slug: "assembly-and-construction",
    line: "robotics",
    name: "Assembly and construction",
    skillGroups: ["Assembly & Installation", "Construction & Building"],
    blurb:
      "Things built and fixed in place: a signboard mounted on a wall, ceiling panels cut and installed from scaffolding, cabinet installation, body assembly on a factory line. Sign shops, construction companies, hardware manufacturing. Half of it is graded hard.",
  },
  {
    slug: "textiles-and-laundry",
    line: "robotics",
    name: "Textiles and laundry",
    skillGroups: ["Clothing & Laundry"],
    blurb:
      "Fabric handled by people who do it for a living: garments sewn and excess thread cut, jackets folded, beds made. Sewing and textile factories, a bridal atelier, hotel rooms. The only set recorded on all three egocentric rigs.",
  },
  {
    slug: "food-preparation",
    line: "robotics",
    name: "Food preparation",
    skillGroups: ["Food Preparation & Cooking"],
    blurb:
      "Cooking as a job rather than a demonstration: mixed noodles and fried pastries prepared to order, dishes plated, tea poured. Restaurant kitchens and canteens attached to workplaces that are not restaurants.",
  },
  {
    slug: "electronics-and-diagnostics",
    line: "robotics",
    name: "Electronics and diagnostics",
    skillGroups: ["Electronics & Diagnostics"],
    blurb:
      "Fault-finding before repair: a laptop opened up, a scooter diagnosed, components tested, LEDs soldered. Computer and appliance repair shops, sign shops, workshops. Small, and the second-hardest set on the shelf.",
  },
  {
    slug: "retail-and-service",
    line: "robotics",
    name: "Retail and service counters",
    skillGroups: ["Retail & Service Operations", "Human Interaction & Handoffs"],
    blurb:
      "Work done with a customer in frame: an order verified, a table cleared, a client posed at a bridal atelier, a screen wiped down at a service desk. The only set where a second person is part of the task rather than background.",
  },
  {
    slug: "gameplay",
    line: "gaming",
    name: "Gameplay with frame-aligned input",
    skillGroups: [],
    blurb:
      "Live play recorded at 60 fps and 1080p with a 27-column telemetry table beside it: the camera-to-world matrix, pinhole intrinsics, the exact keys and mouse deltas held on each frame, and the semantic action they map to. Two-player coop sessions add a shared clock and per-agent visibility.",
  },
];

type Row = {
  slug: string;
  modality: string;
  skillGroup: string | null;
  durationSec: number;
  rig: string;
  spec: [string, string][];
};

const ALL = samples as unknown as Row[];

export interface DatasetStats {
  episodes: number;
  hours: number;
  /** Distinct `Workplace` values. Diversity a buyer can check, not a claim. */
  workplaces: number;
  rigs: string[];
  /** Only present where every record in the set is graded. */
  hardShare: number | null;
}

const cell = (r: Row, key: string) => r.spec?.find((p) => p[0] === key)?.[1] ?? null;

/** Rows belonging to a dataset. A dataset with no skill groups takes its line. */
export function rowsFor(d: Dataset) {
  if (d.skillGroups.length === 0) {
    return ALL.filter((r) => (d.line === "gaming" ? r.modality === "gaming" : r.modality !== "gaming"));
  }
  return ALL.filter((r) => r.skillGroup !== null && d.skillGroups.includes(r.skillGroup));
}

export function statsFor(d: Dataset): DatasetStats {
  const rows = rowsFor(d);
  const graded = rows.map((r) => cell(r, "Difficulty")).filter(Boolean);
  return {
    episodes: rows.length,
    hours: rows.reduce((a, r) => a + r.durationSec, 0) / 3600,
    workplaces: new Set(rows.map((r) => cell(r, "Workplace")).filter(Boolean)).size,
    rigs: [...new Set(rows.map((r) => r.rig))].sort(),
    hardShare: graded.length
      ? graded.filter((g) => g === "hard").length / graded.length
      : null,
  };
}

/** The two purchases, kept apart because they are two different buyers. */
export const LINES = [
  { key: "robotics", label: "Robotics & Physical AI" },
  { key: "gaming", label: "Gaming" },
] as const;

export type LineKey = (typeof LINES)[number]["key"];
