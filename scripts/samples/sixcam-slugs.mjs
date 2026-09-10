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

/** One cut job per task: the face lens, keyed by the record's own slug. */
export function sixcamFaces(manifest, kind = "sixcam") {
  return sixcamTasks(manifest, kind)
    .filter((t) => t.face)
    .map((t) => ({ id: t.face.id, file: t.face.file, slug: t.slug, inverted: t.inverted }));
}
