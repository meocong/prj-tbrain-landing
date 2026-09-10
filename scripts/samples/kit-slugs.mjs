/**
 * The one place a kit delivery is turned into tasks, configurations and slugs.
 *
 * Same rule as `sixcam-slugs.mjs` and `exo-slugs.mjs`: the slug is the only join
 * between a clip in `public/samples/` and a row in `samples.json`, so the cutter
 * and the builder both derive it here rather than each deriving it from the same
 * intention.
 *
 * WHAT MAKES THIS DELIVERY DIFFERENT
 *
 * One Drive folder, three configurations. The tree is filed by task, and the rig
 * changes underneath it from session to session — 59 sessions on a single head
 * GoPro, 13 on three body-worn GoPros, 11 on a RealSense D455. Nothing in the
 * metadata says which; `session.json` records `mode: ""` on every GoPro session.
 * The rig is the set of device directories, so that is what this file reads.
 *
 * A record is a TASK AT ONE CONFIGURATION, not a session. The delivery is ten
 * near-identical two-minute repeats of the same bench by the same operator, so
 * filing per session would put "Pressing garments" on the grid ten times over —
 * the same argument `sixcam-slugs.mjs` makes about six lenses of one bench, and
 * Thạch's on the video budget: "tôi cảm giác workload của nó nhiều quá." The 118
 * stereo records are per-episode because each of those episodes is a DIFFERENT
 * trade; these are not.
 *
 * Slugs are prefixed `kit-`. `fabric-sewing` and `garment-sewing` already belong
 * to the 2-cam corpus and `sixcam-*` to the six-camera one, all of which shot
 * neighbouring trades on different rigs.
 */

/**
 * The trade behind each folder name, in the catalogue's own vocabulary.
 *
 * The folders are the customer's own Vietnamese, which is the only place the
 * task is recorded at all — `session.json` carries `task: null` on all 85. So
 * these are translations of a label, not guesses at what was filmed, and the
 * Vietnamese is kept beside each one so the mapping can be checked without
 * going back to Drive.
 *
 * `skillGroup` is asserted against `SKILL_GROUPS` and `job` against `JOBS` in
 * `taxonomy.ts`, so a drifted string fails the run rather than quietly adding a
 * facet value of one.
 */
export const TASKS = {
  "Đóng gói sản phẩm hoàn thiện vào túi.": {
    slug: "garment-bagging",
    title: "Bagging finished garments",
    skillGroup: "Packing & Bagging",
    industry: "Clothing and Fashion",
    job: "Packaging operator",
  },
  "Gắn tag cho sản phẩm": {
    slug: "garment-tagging",
    title: "Tagging garments",
    skillGroup: "Packing & Bagging",
    industry: "Clothing and Fashion",
    job: "Packaging operator",
  },
  "In mã số cho các chi tiết vải.": {
    slug: "fabric-marking",
    title: "Marking fabric parts",
    skillGroup: "Tool Use & Technical Manipulation",
    industry: "Clothing and Fashion",
    job: "Printer / press operator",
  },
  "kiểm tra chất lượng và đường chỉ của sản phẩm": {
    slug: "stitch-inspection",
    title: "Stitch quality inspection",
    /* The taxonomy has no inspection group. "Clothing & Laundry" is where the
       work is, and `job: "Quality inspector"` is what it is — splitting the
       difference the other way would file a garment task under a group no other
       garment record uses. */
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Quality inspector",
  },
  "Là sản phẩm": {
    slug: "garment-pressing",
    title: "Pressing garments",
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Laundry worker",
  },
  "May sản phẩm trên máy khâu đường viền": {
    slug: "hem-sewing",
    title: "Hem sewing",
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Tailor / seamstress",
  },
  "sắp xếp chi tiết vải và cho vào má khâu": {
    slug: "fabric-feeding",
    title: "Sorting and feeding fabric",
    skillGroup: "Clothing & Laundry",
    industry: "Clothing and Fashion",
    job: "Tailor / seamstress",
  },
};

/**
 * Configurations this delivery actually holds, keyed by `CapabilityTier.key`.
 *
 * `rig` is the configuration, never the model string — "Rig ko ghi tên", which
 * is what `redact.mjs` exists to enforce. The camera model IS in the delivery
 * (`HERO13 Black` in every `.calib.json`) and stays out of the record.
 */
export const CONFIGS = {
  mono: {
    rig: "Head-mounted action camera",
    streams: ["RGB", "IMU", "Camera intrinsics", "Mic audio"],
    cameras: "One, head-mounted",
  },
  wrist: {
    rig: "Head camera + wrist cameras",
    streams: ["RGB x3 (head and both wrists)", "IMU per camera", "Camera intrinsics", "Mic audio"],
    cameras: "Three body-worn — one head, two wrist",
  },
  rgbd: {
    rig: "Head-mounted depth camera",
    streams: ["RGB", "Depth (16-bit)", "IR stereo pair", "IMU", "Camera intrinsics"],
    cameras: "One depth camera — colour, depth and an IR pair",
  },
};

/**
 * Which configuration a session was shot on, from its device directories.
 *
 * Counting `gopro_N` folders is the whole discriminator, and it is not in the
 * metadata: `missing_streams` names `wrist_left.mp4` and `wrist_right.mp4` on
 * ALL 85 sessions including the three-camera ones, so it is the kit's template
 * of what a profile could carry and not an audit of what it did. Reading it as
 * one would file every session as missing its wrist cameras.
 *
 * Two sessions came back with two GoPros where their neighbours in the same task
 * have three. They are the same rig with a camera that did not record, so they
 * file under `wrist` and the record says how many views it measured — the same
 * treatment `sixcam` gives the trade whose outer lens will not probe.
 */
/**
 * The task row for a folder name, insensitive to how it was typed.
 *
 * Drive keeps a trailing space in a folder name, and this delivery has one: "In
 * mã số cho các chi tiết vải. " with a space after the full stop. A plain lookup
 * silently dropped the whole task — eight sessions, including four of the
 * thirteen three-camera ones — and produced a clean-looking run with no row for
 * it. Case and surrounding whitespace are typing, not data.
 */
const NORMALISED = new Map(
  Object.entries(TASKS).map(([name, t]) => [name.trim().toLowerCase(), t]),
);
export const tradeFor = (name) => NORMALISED.get(String(name ?? "").trim().toLowerCase()) ?? null;

export function configOf(session) {
  const cams = Object.keys(session.cameras ?? {});
  const gopros = cams.filter((c) => /^gopro_\d+$/.test(c)).length;
  if (gopros >= 2) return "wrist";
  if (gopros === 1) return "mono";
  if (cams.includes("d455")) return "rgbd";
  return null;
}

const sum = (o) => Object.values(o ?? {}).reduce((a, f) => a + (Number(f?.bytes) || 0), 0);

/** Every byte a session delivered, across its cameras, aux tracks and root. */
export function sessionBytes(s) {
  return (
    sum(s.files) +
    Object.values(s.cameras ?? {}).reduce((a, c) => a + sum(c.files), 0) +
    Object.values(s.aux ?? {}).reduce((a, c) => a + sum(c.files), 0)
  );
}

/**
 * Group a session manifest into one bucket per task and configuration.
 *
 * ZED is dropped rather than filed. Two sessions at the delivery root hold a
 * `zed.svo2` each, 50 and 66 GB, which is 60% of the delivery's hours and
 * nothing the page can show: SVO2 is a proprietary container that neither a
 * browser nor ffmpeg opens, so there is no frame to cut a preview from.
 * Thạch, 2026-09-11: "3 zed k show được, bỏ đi."
 */
export function kitGroups(manifest) {
  const groups = new Map();

  for (const [id, s] of Object.entries(manifest.sessions)) {
    if (s.error) continue;
    const trade = tradeFor(s.task);
    if (!trade) continue; // the ZED roots and `_speedtest_delete_me`
    const config = configOf(s);
    if (!config) continue;

    const key = `${trade.slug}-${config}`;
    let g = groups.get(key);
    if (!g) {
      groups.set(
        key,
        (g = {
          slug: `kit-${key}`,
          task: trade.slug,
          trade,
          config,
          sessions: [],
        }),
      );
    }
    g.sessions.push({ id, ...s });
  }

  return [...groups.values()]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((g) => {
      /* Only the sessions whose length actually came back. Drive's quota cost
         this crawl a handful of sidecar reads, and `?? 0` would have folded each
         miss into the total as a zero-length episode — a bucket reporting "14
         episodes, 20 min" where two of the fourteen were never measured. The
         count of what was measured travels with the total instead. */
      const measured = g.sessions.filter((s) => s.durationSec != null);
      const durations = measured.map((s) => s.durationSec);
      const camCounts = g.sessions.map((s) => Object.keys(s.cameras ?? {}).length);
      return {
        ...g,
        episodes: g.sessions.length,
        episodesMeasured: measured.length,
        durationSec: durations.reduce((a, d) => a + d, 0),
        longestSec: durations.length ? Math.max(...durations) : 0,
        bytes: g.sessions.reduce((a, s) => a + sessionBytes(s), 0),
        lerobot: g.sessions.filter((s) => s.lerobot).length,
        /* The rig as delivered, low to high. A wrist bucket holding an 11-session
           three-camera run and two two-camera ones has to say so. */
        camerasMin: Math.min(...camCounts),
        camerasMax: Math.max(...camCounts),
        sites: new Set(g.sessions.map((s) => s.site).filter(Boolean)).size,
      };
    });
}

/**
 * The views a card plays, as one cut job each.
 *
 * A card for a three-camera rig that plays ONE camera is an advertisement for a
 * one-camera rig. That argument is already settled in this repo — Thạch,
 * 2026-09-11: "6 cam thì phải show cả 6 cam chứ sao samples lại là 1 cam nhỉ",
 * which is what `sixcamViews` and `RigViews` exist for — and it applies to three
 * body-worn cameras and to a depth camera for the same reason. The whole value
 * of the wrist configuration is the view the head camera loses, and the whole
 * value of the depth one is the depth.
 *
 *     mono   the single head camera
 *     wrist  all three body-worn cameras, the same instant on each
 *     rgbd   colour and depth, side by side
 *
 *     public/samples/clips/<slug>.mp4            the base view
 *     public/samples/clips/<slug>-<view>.mp4     every other view
 *
 * The base carries no suffix because `<slug>.mp4` is what the rest of the
 * catalogue already expects to exist — `preview`, the record modal, the face on
 * a configuration card.
 *
 * The session a card is cut from is the longest in its bucket: with ten
 * near-identical repeats to choose from, the one with most in it is the one
 * worth showing, and picking by length is reproducible where "the best one" is
 * not.
 */
const VIEW_FILES = {
  mono: [["", (c) => c.gopro_1 && "gopro_1_original.mp4"]],
  /* The HEAD camera is the face, and it is `gopro_3`.
   *
   * The delivery labels nothing — every `.calib.json` says `role: "gopro_1"`
   * and stops — so this is read off the footage, twice:
   *
   *   gopro_3  a frame 40 s into `13-58-30` looks down over the bench with BOTH
   *            hands and both wrist-strapped cameras in shot. Only a camera on
   *            the head sees the wrists.
   *   gopro_1  the packaged mid-session still, on two different sessions, is
   *            tilted, low and pointing at the floor and other people's feet —
   *            a wrist swinging at the operator's side.
   *
   * Ordering `gopro_1` first cost a real poster: three wrist cards came back
   * showing the floor of the workshop and had to be thrown away. The head view
   * is the one that shows the TASK, so it leads; the two wrist views are what
   * the configuration adds, and they follow it. */
  wrist: [
    ["", () => "gopro_3_original.mp4"],
    ["-view-2", () => "gopro_1_original.mp4"],
    ["-view-3", () => "gopro_2_original.mp4"],
  ],
  rgbd: [
    ["", () => "color.mp4"],
    ["-depth", () => "depth.mp4"],
  ],
};

/** Which camera directory a view's file lives in, per configuration. */
const VIEW_DIR = {
  mono: () => "gopro_1",
  wrist: (suffix) => ({ "": "gopro_3", "-view-2": "gopro_1", "-view-3": "gopro_2" })[suffix],
  rgbd: () => "d455",
};

export function kitViews(manifest) {
  const base = [];
  const extra = [];

  for (const g of kitGroups(manifest)) {
    /* Longest episode in the bucket, and for `wrist` one that actually recorded
       all three cameras — two sessions came back with two, and cutting the base
       view from one of those would give a three-camera card two cells. */
    const candidates =
      g.config === "wrist"
        ? g.sessions.filter((s) => Object.keys(s.cameras ?? {}).length >= 3)
        : g.sessions;
    const session = [...(candidates.length ? candidates : g.sessions)].sort(
      (a, b) => (b.durationSec ?? 0) - (a.durationSec ?? 0),
    )[0];
    if (!session) continue;

    for (const [suffix, pick] of VIEW_FILES[g.config]) {
      const dir = VIEW_DIR[g.config](suffix);
      const cam = session.cameras?.[dir];
      if (!cam) continue;
      const name = pick(session.cameras);
      const f = cam.files?.[name];
      if (!f?.id) continue;
      (suffix === "" ? base : extra).push({
        id: f.id,
        file: { name, durationSec: session.cameraDurationsSec?.[dir] ?? session.durationSec ?? 0 },
        slug: `${g.slug}${suffix}`,
        inverted: false,
      });
    }
  }

  /* Base views first, every extra view after them. Drive's download quota is a
     daily budget on one shared account and this delivery has already exhausted
     it twice, so a pass that stops halfway has to stop somewhere useful: eleven
     cards each showing one camera is a catalogue, and four cards showing three
     cameras with seven showing none is not. Thạch, 2026-09-11: "bí quá thì lấy
     mỗi action một loại thôi, đừng có lấy hết." */
  return [...base, ...extra];
}
