/**
 * What we can collect, as opposed to what is already on the shelf.
 *
 * Transcribed from `Tbrain_Capability_Catalog_w_Pricing.xlsx`, sheet "Custom
 * Collection Capabilities", which is the spreadsheet sales currently attaches to
 * emails. The samples page exists to replace that attachment, so the figures
 * have to live here rather than in a slide someone edits separately.
 *
 * Every number is quoted, not derived. When the spreadsheet changes, change this
 * file — do not average, round or reconcile it against the deck, which counts a
 * different corpus (see `docs/samples-restructure-plan.md` §5.1).
 *
 * This is the answer to a reader who filters to a line we have not published
 * samples for. "Nothing here" is true and useless; "we run this, at this price,
 * ready in this many days" is the same truth and is what the spreadsheet says.
 */

export interface CapabilityTier {
  /** Category, verbatim from the spreadsheet. */
  name: string;
  rig: string;
  /** Sensors beyond the camera, or null where the sheet has an em dash. */
  sensors: string | null;
  /** Business days from agreement to first delivery. */
  ramp: string;
  /** Sustained ceiling, not a first-month figure. */
  ceiling: string;
  price: string;
}

/**
 * Keyed by `Sample["modality"]`. Egocentric carries five tiers because the
 * spreadsheet prices five; the others carry one each. Gaming has no row in that
 * sheet at all — it is sold from a different sheet — so it is absent here rather
 * than given an invented price.
 */
export const CAPABILITY: Partial<Record<string, CapabilityTier[]>> = {
  egocentric: [
    {
      name: "Egocentric",
      rig: "Head-mounted smartphone",
      sensors: null,
      ramp: "5–10 business days",
      ceiling: "20,000 h / month",
      price: "$30–40 / h",
    },
    {
      name: "Egocentric (RGB-D / LiDAR)",
      rig: "Head-mounted phone or body-worn iPad Pro LiDAR",
      sensors: null,
      ramp: "5–10 business days",
      ceiling: "5,000 h / month",
      price: "$40–60 / h + $0.1–2 / cuboid",
    },
    {
      name: "Egocentric stereo",
      rig: "RealSense D455 or Pico 4 Ultra",
      sensors: "6-DoF IMU, 200–400 Hz",
      ramp: "14–21 business days",
      ceiling: "2,000 h / month",
      price: "$80–120 / h",
    },
    {
      name: "Egocentric + wrist",
      rig: "Head-mounted phone + wrist camera",
      sensors: "Optional 6-DoF IMU on head and wrist, time-synced",
      ramp: "5–10 business days",
      ceiling: "2,000 h / month",
      price: "$120–180 / h",
    },
    {
      name: "Egocentric + gripper (UMI)",
      rig: "Head-mounted phone + UMI wrist cam",
      sensors: "UMI gripper kit, optional Xsens gloves",
      ramp: "14–21 business days",
      ceiling: "1,000 h / month",
      price: "$100–150 / h",
    },
  ],
  exocentric: [
    {
      name: "Exocentric (basic)",
      rig: "Fixed or tripod camera, third-person",
      sensors: null,
      ramp: "14–21 business days",
      ceiling: "10,000 h / month",
      price: "$36–56 / h",
    },
  ],
  mocap: [
    {
      name: "Egocentric + full mocap",
      rig: "Helmet GoPro, SuperView ~150°",
      sensors: "Xsens MVN HD, 17 IMUs at 240 Hz, + Metagloves per-finger pose",
      ramp: "14–21 business days",
      ceiling: "1,000 h / month",
      price: "$720–1,200 / h",
    },
  ],
};

/**
 * Collection already running but with nothing published yet. Distinct from a
 * capability: this has a start date and an operator count, so it can be stated
 * as a fact rather than an offer.
 */
export const IN_FLIGHT: Partial<Record<string, string>> = {
  exocentric:
    "20 hours in collection since 5 September 2026 with 15 operators — " +
    "10 h urban walking, 5 h vehicular navigation, 5 h structured indoor. " +
    "1080p30 MP4 with audio, clips 30 s to 15 min.",
};

/** Formats every tier can be delivered in, from the same sheet's summary row. */
export const INTEROP = "LeRobot v3 · MCAP · HDF5 · RLDS · mocap to FBX / BVH / SMPL";
