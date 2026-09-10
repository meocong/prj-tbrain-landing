/**
 * Turn the measured Drive manifest into `samples.json` records.
 *
 * Nothing here is typed by hand. Every field a record carries — duration,
 * resolution, fps, size — comes off `ingest-drive.mjs`, which read it from the
 * file itself. That is the whole point: the one prior time this catalogue
 * described a pack from something other than the pack, it declared ten episodes
 * against eleven on disk (see the note in `capability.ts`).
 *
 * Activity is the one thing the delivery does NOT state. Most of it is filed by
 * operator, so the tree says who shot it, not what it is. Where an iPhone wrote
 * a location into the container, consecutive clips in a session give a distance
 * and an elapsed time, and the average speed between them separates walking
 * from cycling from a vehicle. Where it did not, the record says so rather than
 * guessing — `null`, not a plausible label.
 *
 * Usage:
 *   node scripts/samples/build-exo-records.mjs [--dry]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { exoFiles, statedActivity } from "./exo-slugs.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const MANIFEST = join(ROOT, "scripts/samples/drive-manifest.json");
const SAMPLES = join(ROOT, "src/lib/samples/samples.json");
const CLIPS = join(ROOT, "public/samples/clips");
const POSTERS = join(ROOT, "public/samples/posters");

const DRY = process.argv.includes("--dry");


/* Speed bands, km/h, from the average between one clip's start point and the
   next in the same session. Deliberately wide and deliberately gapped: the
   point is to refuse a label when the evidence sits between two answers rather
   than to force every clip into a bucket.

   A single GPS fix per clip has ~14 m of horizontal error, so a short hop
   between two nearby clips is mostly noise. `MIN_SPAN_M` is what keeps that
   noise from being read as movement. */
const BANDS = [
  { max: 8, activity: "urban-walking", label: "Urban walking" },
  { max: 12, activity: null, label: null },
  { max: 22, activity: "urban-cycling", label: "Urban cycling" },
  { max: 26, activity: null, label: null },
  { max: Infinity, activity: "vehicular-navigation", label: "Vehicular navigation" },
];
const MIN_SPAN_M = 60;
/** Beyond this the two clips are separate outings, not one continuous move. */
const MAX_GAP_S = 900;

function haversineM(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const humanSize = (b) =>
  b >= 1073741824 ? `${(b / 1073741824).toFixed(1)} GB` : `${Math.round(b / 1048576)} MB`;

const manifest = JSON.parse(readFileSync(MANIFEST, "utf8"));

/* Slug and identity come from `exo-slugs.mjs`, the same module the cutting pass
   reads. They used to be derived separately here and the two disagreed: 39 clips
   on disk against 12 records that could find them. */
const rows = exoFiles(manifest).map(({ id, file, slug }) => ({
  id,
  slug,
  ...file,
  at: file.shotAt ? Date.parse(file.shotAt) : null,
}));

/* Session = one operator's run on one day. Speed is only meaningful inside one,
   and only if the clips are in the order they were shot — which is a different
   order from the one the slugs are numbered in, so it is sorted here rather
   than upstream. Sorting the slug source by time instead would renumber files
   already written to disk every time one more timestamp appeared. */
const sessions = new Map();
for (const r of rows) {
  const key = (r.path ?? []).join("/");
  if (!sessions.has(key)) sessions.set(key, []);
  sessions.get(key).push(r);
}
for (const list of sessions.values()) {
  list.sort((a, b) => (a.at ?? 0) - (b.at ?? 0) || a.name.localeCompare(b.name));
}

/** Average speed between this clip and its neighbour in the same session. */
function derivedActivity(list, i) {
  const cur = list[i];
  if (!cur.gps || !cur.at) return null;
  for (const j of [i + 1, i - 1]) {
    const other = list[j];
    if (!other?.gps || !other.at) continue;
    const gapS = Math.abs(other.at - cur.at) / 1000;
    if (gapS < 1 || gapS > MAX_GAP_S) continue;
    const m = haversineM(cur.gps, other.gps);
    if (m < MIN_SPAN_M) continue;
    const kmh = (m / gapS) * 3.6;
    const band = BANDS.find((b) => kmh <= b.max);
    if (band?.activity) return { ...band, kmh: Number(kmh.toFixed(1)) };
    return null;
  }
  return null;
}

/* Only a third of the delivery carries a location tag — Apple writes one,
   Android and GoPro do not — so measuring speed labels a minority of the files
   and leaves the rest with nothing.
 *
 * But a session is one operator on one outing, and an operator who was walking
 * between clip 4 and clip 5 was walking for clip 6 as well. So a session that
 * measured cleanly lends its answer to its own unmeasured clips.
 *
 * Two guards on that. It only applies where every measured clip in the session
 * agreed — a session holding both walking and cycling evidence has genuinely
 * changed activity partway and must not be flattened to whichever won. And the
 * record says `inherited` rather than `derived`, so a buyer reading the spec can
 * tell a measurement from an inference.
 */
function sessionConsensus(list) {
  const seen = new Map();
  for (let i = 0; i < list.length; i++) {
    const a = statedActivity(list[i].path ?? []) ?? derivedActivity(list, i);
    if (a?.activity) seen.set(a.activity, a);
  }
  return seen.size === 1 ? [...seen.values()][0] : null;
}

const records = [];
const unlabelled = [];

for (const [key, list] of sessions) {
  const consensus = sessionConsensus(list);

  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    const stated = statedActivity(r.path ?? []);
    const derived = stated ? null : derivedActivity(list, i);
    const inherited = stated || derived ? null : consensus;
    const act = stated ?? derived ?? inherited;

    const slug = r.slug;

    // A record whose clip is not on disk would render an empty tile.
    if (!existsSync(join(CLIPS, `${slug}.mp4`)) || !existsSync(join(POSTERS, `${slug}.jpg`))) continue;
    if (!act) {
      unlabelled.push(slug);
      continue;
    }

    records.push({
      slug,
      domain: "robotics",
      modality: "exocentric",
      /* `exo`, not `mono`. Both words mean "one camera" in English and they are
         not the same rig: `mono` in `capability.ts` is the head-mounted
         smartphone tier of EGOcentric capture, priced and ramped separately.
         Since the catalogue is about to be filed by configuration, a wrong key
         here would file street footage from a GoPro under a head rig. */
      tier: "exo",
      provenance: "custom",
      title: act.label,
      label: act.label,
      environment: act.activity === "office-indoor" ? "Office, indoor" : "Street, outdoor",
      locale: "Hanoi, Vietnam",
      rig: r.device ?? "Handheld camera",
      viewpoint: "third-person",
      skillGroup: act.label,
      industry: null,
      job: null,
      // GoPro GPMF and Apple `mebx` both surface as data tracks; either way the
      // file carries motion and location alongside the pictures.
      telemetry: (r.dataTracks ?? 0) > 0,
      durationSec: Math.round(r.durationSec),
      resolution: `${r.width}x${r.height}`,
      fps: Math.round(r.fps ?? 0),
      streams: ["rgb"],
      formats: ["mp4"],
      size: humanSize(r.sizeBytes ?? 0),
      spec: [
        ["Activity", act.label],
        ["Camera", r.device ?? "Handheld"],
        ["Resolution", `${r.width}x${r.height}`],
        ["Frame rate", `${r.fps} fps`],
        ["Duration", `${Math.round(r.durationSec)} s`],
        ["Telemetry", (r.dataTracks ?? 0) > 0 ? "Motion and location tracks in file" : "None"],
        ...(derived ? [["Activity derived from", `GPS, ${derived.kmh} km/h between clips`]] : []),
        ...(inherited
          ? [["Activity derived from", "Same session as GPS-measured clips, one activity throughout"]]
          : []),
      ],
      breadcrumb: ["Samples", "Exocentric", act.label],
      preview: `/samples/clips/${slug}.mp4`,
      pills: [
        { t: act.label, k: "skill" },
        { t: `${r.width}x${r.height}`, k: "device" },
        ...((r.dataTracks ?? 0) > 0 ? [{ t: "Telemetry", k: "quality" }] : []),
      ],
      downloads: [{ t: "Preview pack", primary: true }],
    });
  }
}

const byActivity = {};
for (const r of records) byActivity[r.skillGroup] = (byActivity[r.skillGroup] ?? 0) + 1;
console.log("records:", records.length);
for (const [k, v] of Object.entries(byActivity)) console.log(`  ${String(v).padStart(3)}  ${k}`);
console.log(`  ${String(unlabelled.length).padStart(3)}  (no activity evidence — skipped)`);

if (DRY) process.exit(0);

const existing = JSON.parse(readFileSync(SAMPLES, "utf8"));
const kept = existing.filter((s) => s.modality !== "exocentric");
writeFileSync(SAMPLES, JSON.stringify([...kept, ...records], null, 2) + "\n");
console.log(`\nwrote ${kept.length} kept + ${records.length} exocentric → samples.json`);
