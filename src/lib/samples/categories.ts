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
   * What it is FOR — the model or the task it serves.
   *
   * All six categories said what they were and none said what they were for,
   * which is R15: robotics has to lead the customer rather than list at them. A
   * buyer who knows they are training a manipulation policy was left to work
   * out for themselves whether that means exocentric or mocap.
   *
   * Names a model or a task, never an adjective. "Behaviour cloning and VLA
   * training" is a use; "high-quality data for robotics" is a mood.
   */
  forWhat: string;
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
  /**
   * What records this category and what rides with a frame, for the three that
   * hold nothing on disk. Where there ARE records, `captureFor` derives this
   * instead and ignores whatever is written here — a written list beside real
   * records is a list that will drift.
   *
   * Every line below is traceable to `IN_FLIGHT` or `CAPABILITY` for the same
   * modality. Nothing here is a guess about a rig we have not run.
   */
  capture?: { label: string; value: string }[];
  /**
   * The rig as a configuration, stated rather than derived.
   *
   * It was derived from the `Streams` spec field and rendered as "4 cameras
   * 116 · 2 cameras 1", which is wrong twice over: `Streams` counts the video
   * streams DELIVERED, not the lenses on the head, and a distribution is not a
   * configuration. The rig is six cameras in three stereo pairs; four of them
   * ship as standard, per the "data 6 cam" pack README. Both facts are true and
   * they are two different rows.
   */
  rig?: string;
  /** Nominal IMU rate. Not the per-file measured reading — see capture.ts. */
  imuHz?: string;
  /**
   * Clips to run behind the header for a category that has footage but no
   * records in `samples.json`.
   *
   * Mocap had a hand-drawn skeleton because "we hold no mocap footage" — which
   * was wrong twice. The pose bundle carries 80 real keyframes of the capture,
   * embedded in the explorer as JPEG, and drawing anatomy by hand was the wrong
   * answer even when it was the only one: the figure read as a rake and the
   * hand as a box. Real frames beat a drawing of them.
   */
  reel?: { slug: string; title: string }[];

  /**
   * The clip the front-door card wears, when the automatic pick is wrong.
   *
   * `facesFor` round-robins over skill groups in record order, which is fine
   * where every group is equally representative and wrong where one is not:
   * exocentric drew its card face from the single office clip, so the card
   * selling street navigation opened on a shot of our own desks.
   *
   * Only set it where the automatic answer is actually bad. A slug per category
   * hand-maintained across a growing catalogue is a list that goes stale.
   */
  face?: string;
}

export const CATEGORIES: Category[] = [
  {
    slug: "egocentric",
    line: "robotics",
    name: "Egocentric",
    modality: "egocentric",
    whatItIs:
      // Both shelves, since both are now on the page. The old sentence promised
      // only the trades-at-work one and made the household corpus below it read
      // as a mistake.
      "First-person capture from a head-mounted rig: skilled trades at work in operating businesses, and everyday manipulation at home.",
    forWhat:
      "Behaviour cloning and VLA training where the policy has to see what the hands see: the grasp, the tool, and the order a task is really done in.",
    // Hedged, but not in Claru's words. Theirs reads "approximately 118k hours
    // ... Approximate, and the figure may overlap across sources" - they broker,
    // so their hours can be counted twice. Ours cannot: we shot all of it, and
    // the reason for the hedge is that the shelf is bigger than what is indexed
    // here, which is a different admission and should not borrow their sentence.
    shelf:
      "The shelf behind these runs to roughly 15,000 episodes and 1,200 hours, shot across 70+ operating businesses. Counted off our own collection, rounded down.",
    rig: "6 cameras, three stereo pairs",
    imuHz: "200 Hz",
  },
  {
    slug: "exocentric",
    line: "robotics",
    name: "Exocentric",
    modality: "exocentric",
    whatItIs:
      "The same work seen from outside the body: a camera watching the whole person and the space around them, not just what their hands are doing.",
    /* Rewritten 2026-09-10 to describe the shelf rather than the tier.

       It read "Whole-body pose, scene context, and anything with a second
       person in frame", which is what an exocentric rig CAN serve and not what
       these twenty hours are: fifteen of them are urban walking and vehicular
       navigation. Those two answer route and layout, not joint angles, and they
       sell to a different buyer — VLN and world models rather than humanoid
       retargeting. The tier still offers pose work on request; the shelf in
       front of it does not hold any, so the line leads with what it does hold.

       The distinction is load-bearing, not cosmetic: ExoActor (arXiv 2604.27711)
       measures back-to-front exo views winning on navigation because they carry
       heading and layout, and facing views winning on manipulation because they
       carry the hands. A buyer who reads "whole-body pose" and receives follow
       footage of someone walking has been mis-sold. */
    forWhat:
      "Navigation and scene understanding — the route taken, the layout around it, and how a body moves through a place. Vision-language navigation and world models, and whole-body pose where the frame holds the whole person.",
    shelf: null,
    /* Urban walking, not the office. Fifteen of the twenty hours are street
       capture and one clip is an interior; left to `facesFor` the card opened
       on that interior, so the card selling outdoor navigation showed a desk. */
    face: "exo-20260904-049",
    // IN_FLIGHT.exocentric: "20 hours in collection since 5 September 2026".
    held: { figure: "20 h", unit: "in collection · 15 operators" },
    /* Rig and outputs from the capability sheet's row A4, "Exocentric
       (basic)"; the collection figures from IN_FLIGHT. Two sources because they
       answer two questions — what the tier IS, and what is on the floor now. */
    capture: [
      /* Not "fixed or tripod camera", which this said until the delivery folder
         was read on 2026-09-10. Every file in it is from a moving body-worn or
         handheld device — GoPro (GX0101xx.MP4), iPhone (IMG_xxxx.MOV) and an
         Android phone (VID2026xxxx.mp4) — with the same activity shot on two
         devices at once on 5 September. Nothing in the set is on a tripod. */
      { label: "Recorded on", value: "GoPro and phone, third-person and following the operator" },
      /* The one spec a buyer cannot infer and cannot work without. ExoActor
         (arXiv 2604.27711) measures the two angles serving opposite tasks:
         back-to-front carries heading and layout, so navigation policies train
         on it; facing carries hands and objects, so manipulation does. Leaving
         it off the sheet, as this did, is leaving off the field that decides
         whether the footage is usable at all.

         Stated as mixed because it IS mixed, per session. The split is not
         written down yet — when it is counted off the files it belongs here as
         a ratio, the way "Mix in collection" below carries its hours. */
      { label: "Camera angle", value: "Mixed per session — following and facing both occur" },
      /* Two devices on one activity, 5 September: "Urban Walking (GoPro)" and
         "Urban Walking (Phone)" are the same walk. Worth stating because it is
         a property a buyer can use — two viewpoints of one route — and not one
         they would assume from an hours figure. */
      { label: "Multi-device", value: "Some sessions shot on GoPro and phone at once" },
      { label: "Video", value: "1080p at 30 fps, with audio" },
      { label: "Clip length", value: "30 seconds to 15 minutes" },
      { label: "Mix in collection", value: "10 h urban walking · 5 h vehicular navigation · 5 h structured indoor" },
      { label: "Ships as", value: "exo.mp4 + metadata.json · LeRobot v3, convertible to HDF5 / RLDS / MCAP" },
    ],
  },
  {
    slug: "teleoperation",
    line: "robotics",
    name: "Teleoperation",
    modality: "teleoperation",
    whatItIs:
      // Two products, and the page used to name one. It said "robot episodes
      // rather than human ones" while the tier under it was "Egocentric +
      // gripper (UMI)" — a PERSON wearing a gripper, not a robot. The held set
      // is an openarm_gripper_follower, a real bimanual arm. Both are
      // teleoperation data and a buyer choosing between them needs to know
      // which one they are looking at.
      "Joint state and action beside the cameras, in the format policy training reads — from a bimanual robot arm, or from a person wearing a UMI gripper rig.",
    forWhat:
      "Action-conditioned policy training. Every frame carries the state the arms were in and the action taken, which is the pair a policy learns from.",
    shelf: null,
    // IN_FLIGHT.teleoperation, counted off the disk rather than off the
    // dataset's own manifest, which disagrees with it.
    held: { figure: "11", unit: "episodes · 3 synced cameras each" },
    // The head camera of all eleven episodes. They are real footage and are not
    // in `samples.json`, so without this the header fell back to a drawing on a
    // category that has thirty-three video files.
    reel: [
      { slug: "teleop-ep00", title: "Episode 0 · pick and place into the bin" },
      { slug: "teleop-ep01", title: "Episode 1 · pick and place into the bin" },
      { slug: "teleop-ep02", title: "Episode 2 · pick and place into the bin" },
      { slug: "teleop-ep03", title: "Episode 3 · pick and place into the bin" },
      { slug: "teleop-ep04", title: "Episode 4 · pick and place into the bin" },
      { slug: "teleop-ep05", title: "Episode 5 · pick and place into the bin" },
      { slug: "teleop-ep06", title: "Episode 6 · pick and place into the bin" },
      { slug: "teleop-ep07", title: "Episode 7 · pick and place into the bin" },
      { slug: "teleop-ep08", title: "Episode 8 · pick and place into the bin" },
      { slug: "teleop-ep09", title: "Episode 9 · pick and place into the bin" },
      { slug: "teleop-ep10", title: "Episode 10 · pick and place into the bin" },
    ],
    // Every line from IN_FLIGHT.teleoperation, which is counted off the disk
    // rather than off the dataset's own manifest - the two disagree.
    capture: [
      { label: "Recorded on", value: "openarm_gripper_follower, bimanual" },
      { label: "Video", value: "Three synchronised 640x480 cameras (head, left, right) at 30 fps" },
      { label: "On every frame", value: "Joint state and action, 16-dimensional" },
      { label: "Arms", value: "Seven degrees of freedom per arm, plus a gripper each" },
      { label: "Held now", value: "11 episodes · 14,076 frames · 7 min 49 s · 1.2 GB of video" },
      { label: "Ships as", value: "LeRobotDataset v2.1 with a GR00T-compatible modality map" },
    ],
  },
  {
    slug: "mocap",
    line: "robotics",
    name: "Mocap",
    modality: "mocap",
    whatItIs:
      "Full-body motion capture with per-finger hand pose, for work that hands alone do not describe.",
    forWhat:
      "Retargeting to a humanoid, and dexterous work where the finger matters — 21 joints a hand, not a box drawn round it.",
    shelf: null,
    // CAPABILITY.mocap, the only tier on it. Nothing is collected, so the true
    // figure is what the rig captures: 17 IMUs at 240 Hz plus per-finger gloves.
    // Not the rate — see the comment on `CapabilityTier.price`.
    /* Not "nothing here". The capability sheet's Visualized Demo column links
       a deployed bundle — 160 s of video with the Xsens hand and wrist pose
       synchronised to it — which is a published mocap sample by any reading.
       The figure is what that bundle actually contains. */
    held: { figure: "4,801", unit: "wrist-pose frames · 21 joints per hand" },
    /* The recording itself, at the rate it was shot.
       Tam, 2026-09-09: "Mocap em embed video thật nhé, hiện play nó bị giật
       quá", then "ko chỉ cái mocap thôi, các video khác ok" — which was the
       whole diagnosis. What sat here was 80 base64 JPEGs lifted out of the
       deployed pose bundle and strung together at 8 fps: a 16x timelapse of a
       160-second capture, a new frame every 125 ms. It was not stuttering under
       load, it was playing exactly as encoded. Those frames exist to be
       SCRUBBED against the pose stream, one per keyframe, and making a video of
       them was the wrong instrument.
       Now cut from `recording.mp4` in the source folder — 1920x1080, 30 fps,
       4,804 frames, 160.13 s, which matches the 4,801 wrist frames the bundle
       reports and the README's "Video output 1080p, 30 fps, duration 160s".
       The window is 80-102 s because that is where the operator's hands and
       the mocap gloves are in shot; at 40 s the frame is an empty green floor,
       which is the "ko thấy tay đâu cả" complaint from the same thread. */
    reel: [{ slug: "mocap-recording", title: "Egocentric video, synchronised to the hand pose · 1080p30" }],
    /* Row C of the capability sheet, "Egocentric + full mocap". The 240 Hz is
       the suit's native rate; the sheet says it is downsampled to 30 Hz for
       delivery, and stating only the native rate would let a buyer plan around
       a resolution they do not receive. */
    capture: [
      { label: "Recorded on", value: "Helmet-mounted GoPro, SuperView ~150 degrees" },
      { label: "Body", value: "Xsens MVN HD, 17 IMUs · 240 Hz native, delivered at 30 Hz" },
      { label: "Hands", value: "Xsens Metagloves, per-finger pose" },
      { label: "Shot in", value: "Studio, controlled" },
      { label: "Ships as", value: "video .mp4 + full-body IMU streams + hand pose · FBX / BVH / SMPL" },
    ],
  },
  {
    slug: "gaming",
    line: "gaming",
    name: "Gaming",
    modality: "gaming",
    whatItIs:
      "Screen capture from live play with every keystroke, mouse delta and camera pose aligned to the frame it happened on.",
    forWhat:
      "World models and agents that act through a UI: the frame, the input that produced the next frame, and where the camera was when it did.",
    shelf: null,
  },
  {
    slug: "coding-stem",
    line: "coding",
    name: "Coding & STEM",
    modality: null,
    whatItIs:
      "Terminal benchmark tasks with deterministic verification, authored and peer-reviewed by engineers in each domain.",
    forWhat:
      "Agent evaluation and supervised fine-tuning on tasks that either pass or fail, with no judge in the loop.",
    shelf: null,
    // Already a product with its own gated sample area. Tam's instruction was to
    // bring the samples the site already has into one system, not to rebuild
    // them, so this card routes out rather than duplicating the catalogue.
    externalHref: "/data/terminal-bench",
    // The only card with no figure of any kind. terminal-bench tasks are
    // pass/fail against a written test, which is the one number that matters
    // about them and the reason this line exists at all.
    held: { figure: "Pass / fail", unit: "deterministic verification · no judge" },
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

/**
 * One folder inside a configuration: a skill group, and the records in it.
 *
 * The catalogue used to be a flat grid of 118 behind a facet rail, which meant
 * the page's opening move was to render every clip it had. A folder level is
 * what Tam's reference does instead — `claru.ai/explore/egocentric/processed`
 * shows a few stills per group and an "Open folder", and no video at all until
 * a group is chosen.
 */
export interface SkillFolder {
  /** URL segment. Derived, so a renamed group renames its route with it. */
  slug: string;
  /** The group as written in the record. */
  name: string;
  count: number;
  /** Stills for the card face. No clips: this level ships no video. */
  faces: string[];
  /** Total playable minutes in the folder. */
  minutes: number;
}

/** Group names are prose — "Pick and Place / Object Handling" — so the URL is derived. */
export const groupSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * The folders a modality holds, largest first.
 *
 * Derived from the records rather than from `SKILL_GROUPS` in taxonomy.ts,
 * which is the egocentric vocabulary. The exocentric delivery files itself by
 * activity — "Urban walking", "Vehicular navigation" — and those are equally
 * real folders. Reading the axis off the data covers both without a second
 * list to keep in step.
 */
export function skillFolders(modality: string, facesPerFolder = 2): SkillFolder[] {
  const rows = (samples as unknown as { modality: string; skillGroup: string | null; slug: string; durationSec: number }[])
    .filter((r) => r.modality === modality && r.skillGroup);

  const byGroup = new Map<string, typeof rows>();
  for (const r of rows) {
    const g = r.skillGroup as string;
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(r);
  }

  return [...byGroup.entries()]
    .map(([name, list]) => ({
      slug: groupSlug(name),
      name,
      count: list.length,
      faces: list.slice(0, facesPerFolder).map((r) => r.slug),
      minutes: list.reduce((a, r) => a + r.durationSec, 0) / 60,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** The folder a URL segment names, or null. */
export function skillFolderBySlug(modality: string, slug: string): SkillFolder | null {
  return skillFolders(modality).find((f) => f.slug === slug) ?? null;
}

/**
 * Whether a category is worth a folder level at all.
 *
 * It is not always. Gaming carries `skillGroup: null` on all eight of its
 * records — its axes are the game, the session type and the stress category,
 * which live in `spec` — so a folder view derived from skill groups produced
 * nothing, and swapping the grid for it removed the catalogue from
 * `/samples/gaming` entirely: no clips, no way to open one.
 *
 * One condition: more than one folder. A single folder holding everything is a
 * click that changes nothing.
 *
 * There was a second — a minimum record count, so a category that fits on one
 * screen went straight to the grid. It is gone. Tam, 2026-09-10: "kể cả nó có 1
 * item thì cũng nên cho vào các loại game gì như là các loại của egocentric",
 * and the reference agrees: claru.ai does not consolidate small groups either.
 * A folder holding one record still tells a reader that this kind of work
 * exists and that we hold exactly one of it, which a grid of eight
 * undifferentiated tiles does not.
 *
 * Everything else goes straight to the catalogue, which is what a category with
 * no grouping axis at all should do.
 */
export function usesFolders(modality: string): boolean {
  return skillFolders(modality).length > 1;
}

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

/**
 * True when `/samples/<slug>` opens on footage rather than on paper.
 *
 * `CategoryHeader` has two branches — a full-bleed `HeroReel` where the
 * category has clips, and a hatched drawing band where it does not — and the
 * header bar needs opposite answers over each: white nav over the reel, ink nav
 * over the band. It cannot ask the section, which renders below it, so the
 * branch condition is derived here instead.
 *
 * Repeating the condition rather than exporting it from the section is
 * deliberate: the section is a client component holding JSX, and what the
 * header needs is the one boolean. Keep the two in step — `CategoryHeader`
 * takes records first and falls back to `c.reel`, and so does this.
 */
export function categoryHeroIsDark(slug: string): boolean {
  const c = categoryBySlug(slug);
  if (!c) return false;
  const fromRecords = c.modality ? ALL.some((r) => r.modality === c.modality) : false;
  return fromRecords || (c.reel?.length ?? 0) > 0;
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
export interface PackStat {
  value: string;
  label: string;
}

/**
 * The same nine figures `samples.tbrain.ai` opens with, as data rather than a
 * sentence.
 *
 * It used to return one joined string, which the page printed as a run-on mono
 * line: "In this category: 118 episodes · 852.7 minutes · 16 skill groups · 106
 * distinct tasks · ...". Nine numbers in body type, none of them findable,
 * reading as a caption. As stats each figure gets its own numeral and its own
 * label, which is what a number that size is for.
 *
 * Order is deliberate: scale first, then the two that answer "is it varied",
 * then provenance. Zeroes drop out rather than printing "0 operators".
 */
export function packStats(c: Category): PackStat[] {
  const rows = c.modality ? ALL.filter((r) => r.modality === c.modality) : [];
  if (rows.length === 0) return [];

  const cell = (r: Row, k: string) => r.spec?.find((p) => p[0] === k)?.[1] ?? null;
  const count = (k: string) => new Set(rows.map((r) => cell(r, k)).filter(Boolean)).size;
  const mins = rows.reduce((a, r) => a + r.durationSec, 0) / 60;

  return [
    // "Episodes" alone stopped being unambiguous once the off-the-shelf shelf
    // went onto the same page: a header reading 118 with 61 more clips playing
    // below it invites the reader to work out which number covers what. These
    // are the delivery files; the pack samples say so themselves.
    { value: String(rows.length), label: "Delivery files" },
    { value: `${mins.toFixed(0)} min`, label: "Playable here" },
    { value: String(count("Skill group")), label: "Skill groups" },
    { value: String(count("Task id")), label: "Distinct tasks" },
    { value: String(count("Industry")), label: "Industries" },
    { value: String(count("Workplace")), label: "Workplaces" },
    { value: String(count("Operator")), label: "Operators" },
    { value: String(count("Device")), label: "Rigs" },
  ].filter((s) => s.value !== "0" && s.value !== "0 min");
}
