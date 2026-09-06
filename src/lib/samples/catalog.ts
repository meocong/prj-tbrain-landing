/**
 * Catalog data for the /samples hub.
 *
 * Every number here is taken from a real source, not invented:
 *  - OTS figures come from the published sample pack at samples.tbrain.ai
 *  - Robotics collections come from "Tbrain - Robotics / Sample mangement" on Drive
 *  - Game session figures come from the session.json shipped with each capture
 *
 * When the samples tables land in Postgres this module is replaced by a query.
 * Until then it is the single place to edit copy and figures.
 */

export interface ProductLine {
  slug: string;
  name: string;
  positioning: string;
  headline: string;
  body: string;
  facts: { label: string; value: string }[];
  modalities: string[];
  status: "live" | "sample-ready";
}

export const PRODUCT_LINES: ProductLine[] = [
  {
    slug: "robotics",
    name: "Robotics",
    positioning: "Egocentric, mocap, gripper, teleop",
    headline: "Skilled manual work, captured from the operator's own viewpoint",
    body: "Seven collections spanning factory floors, homes, offices and a calibrated studio. Head-mounted capture is the backbone; wrist cameras, full-body mocap, depth and bimanual teleoperation extend it where a policy needs more than RGB.",
    facts: [
      { label: "Collections", value: "7" },
      { label: "Sample tasks ready", value: "14" },
      { label: "Capture rigs", value: "6" },
    ],
    modalities: [
      "Egocentric RGB",
      "Stereo pair",
      "Wrist cameras",
      "Xsens mocap (MVNX, FBX)",
      "RGB-D and LiDAR point cloud",
      "Bimanual teleop (LeRobot v2)",
      "Gripper",
      "Stereo audio",
    ],
    status: "sample-ready",
  },
  {
    slug: "video-game",
    name: "Video game",
    positioning: "Action-conditioned world model data",
    headline: "Frame-aligned video, keystrokes and camera pose from live play",
    body: "Every session ships the video next to a 27-column telemetry table: camera-to-world matrix, pinhole intrinsics, the exact keys and mouse deltas held on each frame, and the semantic action they map to. Two-player coop sessions add a shared clock and per-agent visibility.",
    facts: [
      { label: "Titles captured", value: "8" },
      { label: "Capture rate", value: "60 fps at 1080p" },
      { label: "Telemetry columns", value: "27" },
    ],
    modalities: [
      "Screen capture",
      "Per-frame keystrokes",
      "Semantic action labels",
      "Mouse delta",
      "Camera-to-world 4x4",
      "Pinhole intrinsics",
      "Multi-agent shared clock",
      "Cross-agent visibility",
    ],
    status: "sample-ready",
  },
  {
    slug: "ots",
    name: "Off the shelf",
    positioning: "Egocentric stereo, already collected",
    headline: "1,200 hours of stereo capture recorded inside working businesses",
    body: "The catalog is commercial-only: workshops, factories, restaurants, farms, repair shops. Never a private residence, never a staged studio. Episodes average close to five minutes of sustained, tool-mediated work with real failure and recovery.",
    facts: [
      { label: "Hours in catalog", value: "1,200" },
      { label: "Episodes", value: "15,000" },
      { label: "Commercial sites", value: "70+" },
    ],
    modalities: [
      "Synchronized stereo",
      "Head IMU at 200 Hz",
      "Visual-inertial odometry",
      "Camera intrinsics and extrinsics",
      "Task annotation",
      "Environment annotation",
      "In-band session metadata",
      "SHA-256 per file",
    ],
    status: "live",
  },
];

/** Layers that ship with every delivered sample, whatever the domain. */
export const DELIVERY_LAYERS = [
  {
    key: "video",
    title: "Source video",
    detail: "Full resolution, every lens the rig recorded. The preview you play here is a downscaled derivative, never the deliverable.",
    metric: "1080p and up",
  },
  {
    key: "motion",
    title: "Motion and pose",
    detail: "Camera trajectory, IMU, visual-inertial odometry on the robotics side. Camera-to-world matrix plus intrinsics on the game side.",
    metric: "Per frame",
  },
  {
    key: "action",
    title: "Action stream",
    detail: "What the operator did, frame by frame. Keystrokes and mouse deltas for game capture, hand and gripper state for robotics.",
    metric: "60 Hz",
  },
  {
    key: "annotation",
    title: "Annotation",
    detail: "Task id, description, skill category and difficulty. Environment, industry and workstation. Cleaned English, not raw log text.",
    metric: "Human QC",
  },
  {
    key: "provenance",
    title: "Provenance",
    detail: "Operator consent recorded per session, operators identified only by an opaque id. Calibration date and pass state travel with the file.",
    metric: "Per session",
  },
  {
    key: "integrity",
    title: "Integrity",
    detail: "Metadata written twice, in band and as a sidecar, so the two can be diffed. Every file carries a checksum that verifies on its own.",
    metric: "SHA-256",
  },
] as const;

/** Robotics collections, from the internal sample management sheet. */
export const ROBOTICS_COLLECTIONS = [
  {
    name: "Factory floor",
    environment: "Garment warehouses and factories",
    capture: "Egocentric with wrist cameras, full production cycle",
    status: "Available",
  },
  {
    name: "Everyday tasks",
    environment: "Homes and offices",
    capture: "Egocentric, daily personal tasks",
    status: "Available",
  },
  {
    name: "Studio mocap",
    environment: "Greenscreen studio",
    capture: "Egocentric plus full-body mocap and IMU, exported as MVNX and FBX",
    status: "Available",
  },
  {
    name: "Spatial capture",
    environment: "Residential interiors",
    capture: "Egocentric RGB-D and LiDAR point cloud",
    status: "Available",
  },
  {
    name: "Stereo with audio",
    environment: "Controlled office space",
    capture: "Egocentric stereo with stereo sound",
    status: "Available",
  },
  {
    name: "Gripper",
    environment: "Office",
    capture: "Gripper-mounted capture, two revisions",
    status: "Available",
  },
  {
    name: "Bimanual teleoperation",
    environment: "Simulation",
    capture: "Three synchronized cameras, delivered in LeRobot v2 layout",
    status: "Available",
  },
] as const;

export const ACCESS_PATHS = [
  {
    key: "request",
    title: "Request the sample pack",
    body: "Tell us the task, environment and modality you are training for. We send the matching sample files and the schema documentation.",
    detail: "Reply within one business day",
    cta: "Request access",
    href: "/contact?utm_source=samples&utm_medium=site&utm_campaign=sample_library&utm_content=access_band",
    primary: true,
  },
  {
    key: "passcode",
    title: "Enter a passcode",
    body: "If we have already spoken, your passcode opens the full sample set and the download links without another form.",
    detail: "Seven day session",
    cta: "Enter passcode",
    href: "/samples/enter",
    primary: false,
  },
] as const;

/**
 * Case studies already published on the marketing site. Only the three that are
 * about this product line are linked from the sample library.
 */
export const CASE_STUDIES = [
  {
    title: "Egocentric Data for a Robot Foundation Model",
    href: "/casestudy/egocentric-foundation-model",
  },
  {
    title: "Real-World Video to Ground a World Model",
    href: "/casestudy/world-model-ground-truth",
  },
  {
    title: "Teleop Cold-Start for a Manipulation Startup",
    href: "/casestudy/teleop-cold-start",
  },
] as const;

/**
 * Operational figures. These describe the off-the-shelf corpus specifically,
 * which is the only line with published fleet-wide numbers.
 */
export const PROOF_POINTS = [
  { value: "100%", label: "of the capture fleet in calibration" },
  { value: "100%", label: "of episodes human QC-ed" },
  { value: "70+", label: "operating businesses recorded in" },
  { value: "82%", label: "of episodes rated medium or hard" },
] as const;

/**
 * Rights and privacy. Draft wording, pending sign-off before it goes public.
 */
export const TERMS = [
  {
    title: "Collected, not scraped",
    body: "Every robotics and off-the-shelf episode is recorded by Tbrain at a partner site under a capture agreement. Consent is recorded per session and travels with the file.",
  },
  {
    title: "Operators stay anonymous",
    body: "Operators appear only as an opaque id. Job, experience band and handedness ship with the record because a policy needs them; names do not.",
  },
  {
    title: "Game capture is licensed per engagement",
    body: "Game sessions are recorded from commercial titles. Rights for a given delivery are scoped in writing before anything ships, and we will tell you where a title constrains use.",
  },
] as const;

/** Formats a buyer can load without writing a converter. */
export const FORMATS = [
  { name: "LeRobot v2", detail: "Teleoperation episodes as parquet plus per-camera video, loads in LeRobot and GR00T" },
  { name: "MCAP", detail: "Egocentric deliveries open directly in Foxglove or Lichtblick, both free" },
  { name: "MP4 + CSV + JSON", detail: "Game sessions: video, per-frame telemetry, session record and key bindings" },
] as const;
