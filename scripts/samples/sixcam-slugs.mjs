/**
 * The one place a six-camera delivery is turned into tasks and slugs.
 *
 * Same rule as `exo-slugs.mjs`, and for the same reason: the slug is the only
 * join between a clip in `public/samples/` and a row in `samples.json`, so the
 * cutter and the builder have to derive it from this file rather than each
 * deriving it from the same intention. The exo pair drifted once already —
 * 39 clips on disk against 12 records that could find them.
 *
 * Two deliveries share this shape:
 *
 *   6cam      <task>/video/{primary,mid,outer}_{left,right}.mp4   ~4m38s each
 *   handpose  <task>/video/{primary,mid,outer}_{left,right}.mp4   30s each
 *             <task>/hand-pose_<pair>_{left,right}.mp4            the overlay
 *
 * A record is a TASK, not a file. Six lenses of one bench are one thing a
 * buyer looks at, and filing them as six cards would put the same 4m38s on the
 * page six times — Thạch, 2026-09-10, on the video budget: "tôi cảm giác
 * workload của nó nhiều quá."
 *
 * Slugs are prefixed. `fabric-sewing` and `garment-sewing` are already taken by
 * the 2-cam corpus, which shot the same trades on a different rig; an
 * unprefixed slug would overwrite their clips on disk.
 */

/** Camera order within a delivery, widest baseline last. */
const CAMS = ["primary_left", "primary_right", "mid_left", "mid_right", "outer_left", "outer_right"];

/**
 * Trades whose 6-cam delivery is recorded upside down.
 *
 * The head rig ships in two builds. The 1600x1300 one records upright; the
 * 1920x1080 one has the camera block mounted inverted, so the whole file is
 * rotated 180° — the floor at the top, lettering on a shirt reading backwards.
 * It is not a container flag: `ffprobe` finds no `rotate` tag and no display
 * matrix on these files, and ffmpeg autorotates when there is one. The frames
 * themselves are upside down.
 *
 * Listed by trade rather than keyed off `width === 1920`, which is the same
 * seven today and is a coincidence of which sessions were shot on which build.
 * A resolution rule would silently flip the first upright 1080p delivery that
 * lands. This list is eyeballed off the posters, and a new delivery has to be
 * eyeballed too — `cut-drive-previews.mjs --set sixcam --force` after adding
 * to it.
 *
 * The previews are flipped; the delivery is not, and the record says so.
 */
const INVERTED = new Set([
  "fabric-sewing",
  "garment-sewing",
  "panel-installation",
  "room-cleaning",
  "wood-grinding",
  "wrapping-selecting",
  "zipper-sewing",
]);

/**
 * The lens a card shows.
 *
 * Left eye of the primary pair where there is one, because that is the view
 * closest to what the wearer saw. On the hand-pose delivery the overlay wins:
 * a card for an annotated set that shows the raw feed is selling the thing it
 * is not the point of.
 */
function faceOrder(kind) {
  return kind === "handpose"
    ? ["hand-pose_primary_left", "hand-pose_mid_left", "primary_left", "mid_left", "outer_left"]
    : ["primary_left", "mid_left", "outer_left"];
}

const base = (name) => name.replace(/\.[^.]+$/, "");

/**
 * Group a crawl manifest by task.
 *
 * `path[0]` is the task, which is true only because `safeSegment` in
 * `ingest-drive.mjs` was taught to keep it — before that fix every folder came
 * back as `operator-<hash>` and this grouping would have produced one bucket
 * per session with no name on it.
 *
 * Files that failed to probe are kept in `broken` rather than dropped. One
 * lens missing its dimensions does not invalidate a task that has five others,
 * and the count has to be honest about which.
 */
export function sixcamTasks(manifest, kind = "sixcam") {
  const tasks = new Map();

  for (const [id, file] of Object.entries(manifest.files)) {
    const task = file.path?.[0];
    if (!task) continue;
    let t = tasks.get(task);
    if (!t) tasks.set(task, (t = { task, files: [], broken: [] }));
    (file.error || !file.durationSec ? t.broken : t.files).push({ id, file });
  }

  const order = faceOrder(kind);

  return [...tasks.values()]
    .sort((a, b) => a.task.localeCompare(b.task))
    .map((t) => {
      const byName = new Map(t.files.map((f) => [base(f.file.name), f]));
      const face = order.map((n) => byName.get(n)).find(Boolean) ?? t.files[0];

      /* Dimensions off the face rather than off whichever file sorted first:
         the overlay renders at the source resolution, and a card that prints
         1280x720 has to print the size of the frame it is showing. */
      const cams = CAMS.filter((n) => byName.has(n));
      const overlays = [...byName.keys()].filter((n) => n.startsWith("hand-pose_"));

      return {
        task: t.task,
        slug: `${kind === "handpose" ? "handpose" : "sixcam"}-${t.task}`,
        face,
        cams,
        overlays,
        /* Only the 6-cam delivery. The hand-pose renders come out of a
           pipeline that has already put the frame the right way up — the
           overlay's own legend text reads normally on every one of them. */
        inverted: kind === "sixcam" && INVERTED.has(t.task),
        broken: t.broken.map((f) => f.file.name),
        durationSec: face?.file.durationSec ?? 0,
        width: face?.file.width ?? 0,
        height: face?.file.height ?? 0,
        fps: Math.round(face?.file.fps ?? 30),
        bytes: [...t.files].reduce((a, f) => a + (f.file.sizeBytes ?? 0), 0),
      };
    });
}

/**
 * Every view a card shows, as one cut job each.
 *
 * A card for a six-camera rig that plays ONE lens is an advertisement for a
 * one-camera rig. Thạch, 2026-09-11: "6 cam thì phải show cả 6 cam chứ sao
 * samples lại là 1 cam nhỉ" — and Tam said the same thing about the pair back
 * on 2026-09-09, "Stereo em phải show 2 cam ít nhất, xong 6 cam stereo", which
 * is what `RigViews` was built for. This puts the same argument on the tile,
 * where a reader browsing the grid actually meets it.
 *
 * So the 6-cam delivery stages six clips per task and the card lays them out
 * as the rig is worn. The hand-pose delivery stages the overlay pair: its six
 * raw lenses are the same rig shown one card up, and what THIS set adds is the
 * annotation, so the tile shows the annotation in stereo.
 *
 *     public/samples/clips/<slug>.mp4               the base view
 *     public/samples/clips/<slug>-<lens>.mp4        every other view
 *
 * The base carries no suffix because `<slug>.mp4` is the file every other part
 * of the catalogue already expects to exist — `preview`, the record modal, the
 * `STANDIN` face on the configuration card. Six-up is a layout on top of that
 * convention, not a replacement for it.
 */
const LENS_SUFFIX = {
  primary_left: "",
  primary_right: "-primary-right",
  mid_left: "-mid-left",
  mid_right: "-mid-right",
  outer_left: "-outer-left",
  outer_right: "-outer-right",
};

/** The overlay pair, on the `-right` convention `index-views.mjs` already reads. */
const OVERLAY_SUFFIX = { left: "", right: "-right" };

export function sixcamViews(manifest, kind = "sixcam") {
  const jobs = [];

  for (const t of sixcamTasks(manifest, kind)) {
    const byName = new Map(
      Object.entries(manifest.files)
        .filter(([, f]) => f.path?.[0] === t.task && !f.error && f.durationSec)
        .map(([id, file]) => [base(file.name), { id, file }]),
    );

    if (kind === "handpose") {
      /* Whichever pair the renderer chose — `mid` on five tasks, `primary` on
         two. It is the pair that could see the hands, which is why it is the
         one with an overlay on it. */
      const pair = overlayPair([...byName.keys()]);
      for (const [eye, suffix] of Object.entries(OVERLAY_SUFFIX)) {
        const f = pair && byName.get(`hand-pose_${pair}_${eye}`);
        if (f) jobs.push({ id: f.id, file: f.file, slug: `${t.slug}${suffix}`, inverted: false });
      }
      continue;
    }

    for (const [lens, suffix] of Object.entries(LENS_SUFFIX)) {
      const f = byName.get(lens);
      if (f) jobs.push({ id: f.id, file: f.file, slug: `${t.slug}${suffix}`, inverted: t.inverted });
    }
  }

  return jobs;
}

/** "primary" | "mid" | "outer" — which pair the hand-pose overlay was rendered on. */
export function overlayPair(names) {
  for (const n of names) {
    const m = /^hand-pose_(primary|mid|outer)_/.exec(n);
    if (m) return m[1];
  }
  return null;
}
