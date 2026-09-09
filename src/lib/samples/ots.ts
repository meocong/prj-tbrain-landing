/**
 * The off-the-shelf egocentric corpus.
 *
 * `/samples` offers two purchase routes and shows only one of them. The 118
 * records in the catalogue are stereo rig deliveries — the custom-collection
 * side — while the shelf the "Off the shelf" column is selling is a separate,
 * much larger smartphone corpus: 12,900+ episodes across nine skill domains,
 * about 72 hours at an average of 20 seconds a clip. The page said that in
 * prose and showed none of it.
 *
 * The capability sheet carries a `Sample Link` per skill, pointing at Drive
 * folders of real clips. Five of the nine rows have one. Every clip in all five is
 * now on the site: 61 previews.
 *
 * Numbers below are the sheet's, verbatim. The episode counts are its own
 * estimates — it says so: "Episode counts estimated from distribution
 * percentages × 12,900 total."
 */

export interface OtsSkill {
  slug: string;
  /** The skill as the sheet names it. */
  name: string;
  /** Share of the corpus, from the sheet's Distribution column. */
  share: string;
  /** The sheet's estimate, not a count. */
  episodes: string;
  /** Slugs of the clips published here, `public/samples/clips/<slug>.mp4`. */
  clips: string[];
}

export const OTS_SKILLS: OtsSkill[] = [
  {
    slug: "cup",
    name: "Pick up a cup",
    share: "49%",
    episodes: "~6,321",
    clips: [
      "ots-cup-1",
      "ots-cup-2",
      "ots-cup-3",
      "ots-cup-4",
      "ots-cup-5",
      "ots-cup-6",
      "ots-cup-7",
      "ots-cup-8",
      "ots-cup-9",
      "ots-cup-10",
      "ots-cup-11",
      "ots-cup-12",
      "ots-cup-13",
      "ots-cup-14",
      "ots-cup-15",
    ],
  },
  {
    slug: "screwdriver",
    name: "Use a screwdriver",
    share: "13%",
    episodes: "~1,677",
    clips: [
      "ots-screwdriver-1",
      "ots-screwdriver-2",
      "ots-screwdriver-3",
      "ots-screwdriver-4",
      "ots-screwdriver-5",
      "ots-screwdriver-6",
      "ots-screwdriver-7",
      "ots-screwdriver-8",
      "ots-screwdriver-9",
      "ots-screwdriver-10",
      "ots-screwdriver-11",
      "ots-screwdriver-12",
      "ots-screwdriver-13",
      "ots-screwdriver-14",
      "ots-screwdriver-15",
    ],
  },
  {
    slug: "fridge",
    name: "Pick up an item from a refrigerator",
    share: "8%",
    episodes: "~1,032",
    clips: [
      "ots-fridge-1",
      "ots-fridge-2",
      "ots-fridge-3",
      "ots-fridge-4",
      "ots-fridge-5",
      "ots-fridge-6",
      "ots-fridge-7",
      "ots-fridge-8",
      "ots-fridge-9",
      "ots-fridge-10",
    ],
  },
  {
    slug: "wipe",
    name: "Wipe a surface",
    share: "5%",
    episodes: "~645",
    clips: [
      "ots-wipe-1",
      "ots-wipe-2",
      "ots-wipe-3",
      "ots-wipe-4",
      "ots-wipe-5",
      "ots-wipe-6",
    ],
  },
  {
    slug: "scissors",
    // The sheet files this under "Other tasks"; the Drive folder behind that
    // row is scissors, so it is named for what the clips show.
    name: "Cut with scissors",
    share: "1%",
    episodes: "~129",
    clips: [
      "ots-scissors-1",
      "ots-scissors-2",
      "ots-scissors-3",
      "ots-scissors-4",
      "ots-scissors-5",
      "ots-scissors-6",
      "ots-scissors-7",
      "ots-scissors-8",
      "ots-scissors-9",
      "ots-scissors-10",
      "ots-scissors-11",
      "ots-scissors-12",
      "ots-scissors-13",
      "ots-scissors-14",
      "ots-scissors-15",
    ],
  },
];

/** The four skills the sheet prices but publishes no sample folder for. */
export const OTS_UNSAMPLED = [
  "Open and close a door",
  "Use a hammer",
  "Arrange utensils on a rack",
  "Fold and stack cloth",
];

export const OTS_CORPUS = {
  episodes: "12,900+",
  hours: "~72 h",
  domains: "9",
  clipLength: "10-30 s",
  fps: "30 fps",
  /**
   * The sheet's row reads "SD / HD / Full HD (1080p)". Measured off the sample
   * folders it understates: the clips we pulled run to 2160x3840, and every one
   * of the ten is shot in portrait on a phone held upright. Stated as measured
   * rather than as written, because a buyer downloading them gets the files,
   * not the row.
   */
  resolution: "Up to 4K, shot in portrait",
  // A stat tile is one figure. "7 business days from agreement" wrapped to
  // three lines beside six one-line neighbours and broke the row; the
  // qualifier belongs in the caption under it.
  lead: "7 business days",
  size: "~160-315 GB by resolution tier",
} as const;
