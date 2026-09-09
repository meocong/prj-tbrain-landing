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
  /**
   * DO NOT RENDER ON THE SAMPLES SURFACE.
   *
   * Transcribed from the sheet and kept here because it is the record of what
   * the sheet says, but `/samples` and `/samples/[category]` must not print a
   * number with a currency on it — a public page quoting a rate sets an anchor
   * before anyone has said what they need, and the sheet prices a brief, not a
   * page view. Every route to a figure is a conversation: `AccessPaths`.
   *
   * It was rendered in four places until 2026-09-09: both tier tables, the
   * chooser's state line, and the spec column of `TwoRoutes`. All four now show
   * ramp and ceiling instead, which are the two things a buyer actually plans
   * around and neither of which is a quote.
   */
  price: string;
  /**
   * The exact files a delivery of this tier lands, from the sheet's "Output
   * data format" column.
   *
   * The first transcription took the name, rig, ramp, ceiling and rate and left
   * this column behind, which is the column a technical buyer reads first —
   * "Egocentric stereo" is a label, `left.mp4 + right.mp4 + imu.csv` is the
   * thing they have to write a loader for.
   */
  outputs?: string;
  /** Where this tier is shot. Mocap is studio-only; UMI is table-top. */
  environment?: string;
  /**
   * What the first month sustains, which is always lower than the ceiling.
   * "Up to 20,000 hours per month / 5000 hours for the first month" — quoting
   * only the ceiling to somebody scheduling a pilot overstates month one by 4x.
   */
  firstMonth?: string;
  /** A demo of this tier that a reader can open. Only mocap has one. */
  demoHref?: string;
  /**
   * When a buyer would pick this configuration over the one above it.
   *
   * The table listed five rigs and what each outputs, and never said which to
   * choose. A reader who does not already know what VIO needs cannot tell
   * "Egocentric stereo" from "Egocentric + wrist" by reading their file lists —
   * that is R1 stated as a table rather than as an answer.
   */
  when?: string;
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
      ramp: "5-10 business days",
      ceiling: "20,000 h / month",
      price: "$30-40 / h",
      outputs: "head.mp4 (RGB) + metadata.json",
      environment: "Household, factory, daily",
      firstMonth: "5,000 h in month one",
      when:
        "Volume. The cheapest hour and the fastest ramp, where the model needs breadth rather than geometry.",
    },
    {
      name: "Egocentric (RGB-D / LiDAR)",
      rig: "Head-mounted phone or body-worn iPad Pro LiDAR",
      sensors: null,
      ramp: "5-10 business days",
      ceiling: "5,000 h / month",
      price: "$40-60 / h + $0.1-2 / cuboid",
      outputs: "rgb.mp4 + depth .png 16-bit + point cloud .ply / .pcd + metadata.json",
      environment: "Household, factory, daily",
      firstMonth: "1,000 h in month one",
      when:
        "Where distance matters — grasp planning, collision, anything that has to know how far away the object is.",
    },
    {
      name: "Egocentric stereo",
      rig: "RealSense D455 or Pico 4 Ultra",
      sensors: "6-DoF IMU, 200-400 Hz",
      ramp: "14-21 business days",
      ceiling: "2,000 h / month",
      price: "$80-120 / h",
      outputs: "left.mp4 + right.mp4 (+ depth .png 16-bit) + imu.csv, 200-400 Hz time-synced — enables VIO",
      environment: "Household, factory, daily",
      firstMonth: "500 h in month one",
      when:
        "Where the model needs to know where the camera was: the IMU and the pair make visual-inertial odometry possible, which mono cannot.",
    },
    {
      name: "Egocentric + wrist",
      rig: "Head-mounted phone + wrist camera",
      sensors: "Optional 6-DoF IMU on head and wrist, time-synced",
      ramp: "5-10 business days",
      ceiling: "2,000 h / month",
      price: "$120-180 / h",
      outputs: "head.mp4 + wrist_left.mp4 + wrist_right.mp4 + sync_offset.json + imu_head.csv + imu_wrist.csv",
      environment: "Household, office, factory",
      firstMonth: "500 h in month one",
      when:
        "Where the head view loses the hand. A wrist camera keeps the grasp in frame through the whole reach.",
    },
    {
      name: "Egocentric + gripper (UMI)",
      rig: "Head-mounted phone + UMI wrist cam",
      sensors: "UMI gripper kit, optional Xsens gloves",
      ramp: "14-21 business days",
      ceiling: "1,000 h / month",
      price: "$100-150 / h",
      outputs: "head.mp4 + wrist.mp4 + imu.csv (6-DoF, 200 Hz) + gripper_state.json + task_label.json",
      environment: "Table-top manipulation, workshop or lab",
      firstMonth: "200 h in month one",
      when:
        "Where you want the gripper state recorded with the video — a person wearing the rig, not a robot arm.",
    },
  ],
  exocentric: [
    {
      name: "Exocentric (basic)",
      rig: "Fixed or tripod camera, third-person",
      sensors: null,
      ramp: "14-21 business days",
      ceiling: "10,000 h / month",
      price: "$36-56 / h",
      outputs: "exo.mp4 (RGB) + metadata.json",
      environment: "Household, factory, daily",
      firstMonth: "2,000 h in month one",
      when:
        "Where the body matters more than the hands — whole-person pose, approach, and a second person in the scene.",
    },
  ],
  mocap: [
    {
      name: "Egocentric + full mocap",
      rig: "Helmet GoPro, SuperView ~150°",
      sensors: "Xsens MVN HD, 17 IMUs at 240 Hz, + Metagloves per-finger pose",
      ramp: "14-21 business days",
      ceiling: "1,000 h / month",
      price: "$720-1,200 / h",
      outputs: "video .mp4 + full-body IMU mocap streams + hand pose",
      environment: "Studio, controlled",
      firstMonth: "200 h in month one",
      when:
        "Where a joint angle is the label. Retargeting to a humanoid, and finger-level dexterity a camera cannot infer.",
      demoHref: "https://pose-demo-3d.surge.sh/",
    },
  ],
  teleoperation: [
    {
      name: "Egocentric + gripper (UMI)",
      rig: "Head-mounted phone + UMI wrist cam",
      sensors: "UMI gripper kit, optional Xsens gloves",
      ramp: "14-21 business days",
      ceiling: "1,000 h / month",
      price: "$100-150 / h",
      outputs: "head.mp4 + wrist.mp4 + imu.csv (6-DoF, 200 Hz) + gripper_state.json + task_label.json",
      environment: "Table-top manipulation, workshop or lab",
      firstMonth: "200 h in month one",
      when:
        "Where you want the gripper state recorded with the video — a person wearing the rig, not a robot arm.",
    },
  ],
};

/**
 * Data that exists but is not on this page yet — either being collected now, or
 * already collected and sitting unprocessed. Kept apart from `CAPABILITY`
 * because these are facts with counts and dates behind them, not offers, and a
 * reader can tell the difference.
 */
export const IN_FLIGHT: Partial<Record<string, string>> = {
  exocentric:
    "20 hours in collection since 5 September 2026 with 15 operators: " +
    "10 h urban walking, 5 h vehicular navigation, 5 h structured indoor. " +
    "1080p30 MP4 with audio, clips 30 s to 15 min.",
  // Counted from the dataset itself, not from its own manifest, which is wrong:
  // `info.json` declares 10 episodes / 13,465 frames / 30 videos where the disk
  // holds 11 / 14,076 / 33. See docs/samples-restructure-plan.md §5.4.
  teleoperation:
    "One bimanual pick-and-place set already collected: 11 episodes, " +
    "14,076 frames at 30 fps (7 min 49 s), on an openarm_gripper_follower. " +
    "Seven degrees of freedom per arm plus a gripper each, 16-dimensional " +
    "state and action. " +
    "Three synchronised 640×480 cameras (head, left, right), 1.2 GB of video. " +
    "Ships as LeRobotDataset v2.1 with a GR00T-compatible modality map.",
};

/** Formats every tier can be delivered in, from the same sheet's summary row. */
export const INTEROP = "LeRobot v3 · MCAP · HDF5 · RLDS · mocap to FBX / BVH / SMPL";
