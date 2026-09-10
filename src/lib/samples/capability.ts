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
  /**
   * Join key against `Sample["tier"]`.
   *
   * The sheet identifies a tier by its prose name ("Egocentric + gripper
   * (UMI)"), which is a label and not a key: it carries punctuation, it is the
   * string we may want to rewrite for the page, and two modalities quote the
   * same row. Records carry a slug instead, so the facet rail can count a tier
   * and the panel can find the row behind a chip without matching on prose.
   *
   * Not every key appears on a record yet — four of the five egocentric tiers
   * hold nothing on disk. That is the point of the key: a chip reading zero is
   * still pressable, and pressing it has to reach THIS row.
   */
  key: string;
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
  /**
   * One or two lines for the configuration card, written to sell rather than to
   * specify.
   *
   * `when` answers "should I pick this over the row above", which is the right
   * question once a reader is comparing a table. `pitch` is what a card has to
   * say before they are comparing anything — Tam, 2026-09-10: "ví dụ con 6 cam
   * thì em cần highlight là cam xịn, nhìn thấy các góc khác nhau… 2 cam thì mô
   * tả là stereo đủ dùng… 1 cam mình bảo là dùng phone hoặc GoPro".
   *
   * Device classes only, never models: "GoPro + smartphone" is the level Tam
   * asked for, and it is also what `redact.mjs` exists to enforce.
   */
  pitch?: string;
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
      key: "mono",
      /* "Egocentric" beside "Egocentric stereo" does not say one camera — the
         cards read as a category and a variant of it rather than as two rigs.
         The doc's own list is Monoegocentric / Stereo egocentric (2 cam) /
         Advanced Stereo Egocentric (6 cam) / With wrist camera, and each of
         those names its own rig. Following it. */
      name: "Mono egocentric (1 cam)",
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
      pitch:
        "One camera on the head — smartphone or GoPro — with a scale reference in frame. No depth and no parallax, and in exchange the widest spread of trades and workplaces and the fastest ramp we run.",
    },
    {
      key: "rgbd",
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
      key: "stereo",
      name: "Stereo egocentric (2 cam)",
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
      pitch:
        "Two synchronised eyes and a 200-400 Hz IMU on one clock — true depth, not a single RGB feed. Enough parallax for VIO and hand pose, and the rig most of the published catalogue is shot on.",
    },
    {
      /* Added 2026-09-10. The doc lists four egocentric configurations and this
         was the one capability.ts had no row for, so the catalogue could
         neither file a record under it nor offer it — while the page was
         already SHOWING it, in RigViews, from a delivery carrying camera0..5 in
         three stereo pairs.

         Ramp and ceiling are the 2-cam figures until the pricing sheet states
         its own, and `price` reads "On brief" rather than an invented range. An
         invented number on a premium tier is worse than none; the field is
         never rendered on this surface anyway — see the note on it. */
      key: "stereo6",
      name: "Advanced stereo egocentric (6 cam)",
      rig: "Six-camera head rig, three stereo pairs",
      sensors: "6-DoF IMU, 200-400 Hz, time-synced across all six",
      ramp: "14-21 business days",
      ceiling: "1,000 h / month",
      price: "On brief",
      outputs:
        "camera0..5.mp4 + camera_info per lens + imu.csv + VIO — one MCAP carrying every stream",
      environment: "Workshop, workplace, on site",
      firstMonth: "200 h in month one",
      when:
        "Where one pair is not enough geometry: a second angle on an occluded grasp, wider coverage of the bench, and calibration across three baselines rather than one.",
      pitch:
        "Six cameras in three stereo pairs on a hardware-synced clock — frame-level, no post-hoc alignment. 100° of coverage keeps both hands in frame, so a grasp hidden from one pair is still visible in another, with per-lens calibration and a 200-400 Hz IMU on the same timeline.",
    },
    {
      key: "wrist",
      name: "Egocentric with wrist camera",
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
      pitch:
        "The head view plus a camera on each wrist, time-synced to it. Keeps the grasp in frame at the moment the head camera loses it behind the object.",
    },
    {
      key: "umi",
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
      key: "exo",
      name: "Exocentric (basic)",
      rig: "Fixed, tripod or following camera, third-person",
      sensors: null,
      ramp: "14-21 business days",
      ceiling: "10,000 h / month",
      price: "$36-56 / h",
      outputs: "exo.mp4 (RGB) + metadata.json",
      environment: "Household, factory, daily",
      firstMonth: "2,000 h in month one",
      when:
        "Where the route and the room matter more than the hands — how a body moves through a space, what is around it, and who else is in frame.",
    },
  ],
  mocap: [
    {
      key: "mocap-full",
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
      key: "umi",
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
