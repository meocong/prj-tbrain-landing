/**
 * Read a kit delivery's per-session sidecars and write a session manifest.
 *
 * `ingest-drive.mjs` measures footage with ffprobe over HTTP range requests,
 * which is the right tool when the delivery is bare video and the container is
 * the only thing that knows its own duration. This delivery is not that. Every
 * session ships `metadata.json` and `session.json` naming its devices, streams,
 * per-device frame counts, capture fps and start/stop host clock, plus a
 * `.calib.json` per camera with the model and intrinsics — so the numbers are
 * declared, and reading them costs a few kilobytes against a delivery whose
 * video is 140 files and tens of gigabytes.
 *
 * That distinction stopped being academic: probing the video hit Drive's
 * per-file download quota 51 files in, and the quota page is served as the file,
 * so ffprobe reported "Invalid data found when processing input" rather than
 * "quota". Sidecar reads are small enough that the same crawl completes.
 *
 * Declared is not the same as verified — `capability.ts` records a pack whose
 * own `info.json` claimed ten episodes against eleven on disk. So this writes
 * `frames`, `fps` and the host-clock span side by side and never reconciles
 * them; `durationSec` is the clock span, `framesDurationSec` is frames/fps, and
 * a session where those disagree is visible rather than averaged.
 *
 * Usage:
 *   node scripts/samples/ingest-kit-sessions.mjs <folderId> [--out path] [--task-depth N]
 *
 * Cache-keyed by session folder id, so re-running resumes.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";

const args = process.argv.slice(2);
const ROOT_ID = args.find((a) => !a.startsWith("--"));
const OUT = resolve(
  args.includes("--out") ? args[args.indexOf("--out") + 1] : "scripts/samples/kit-sessions.json",
);
/** Folders at this depth are activity labels; see the note in ingest-drive.mjs. */
const TASK_DEPTH = args.includes("--task-depth")
  ? Number(args[args.indexOf("--task-depth") + 1])
  : null;

if (!ROOT_ID) {
  console.error(
    "usage: node scripts/samples/ingest-kit-sessions.mjs <folderId> [--out path] [--task-depth N]",
  );
  process.exit(1);
}

const FOLDER_MIME = "application/vnd.google-apps.folder";
const unhex = (s) =>
  s.replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

/**
 * A folder's children, from the bootstrap payload Drive writes into the page.
 *
 * `sizeBytes` rides along for free here, which is the second reason this script
 * does not need to touch the video: the delivered size of a 200 MB mp4 is a fact
 * about the delivery a buyer wants, and it arrives with the listing.
 */
async function listFolder(id) {
  const res = await fetch(`https://drive.google.com/drive/folders/${id}`, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`folder ${id}: HTTP ${res.status}`);
  const m = /window\['_DRIVE_ivd'\]\s*=\s*'([^']+)'/.exec(await res.text());
  if (!m) throw new Error(`folder ${id}: no _DRIVE_ivd payload (private, or Drive changed shape)`);
  return (JSON.parse(unhex(m[1]))[0] ?? []).map((r) => ({
    id: r[0],
    name: r[2],
    kind: r[3] === FOLDER_MIME ? "folder" : "file",
    sizeBytes: r[13] != null ? Number(r[13]) : null,
  }));
}

async function readJson(id) {
  const res = await fetch(
    `https://drive.usercontent.google.com/download?id=${id}&export=download`,
    { headers: { "user-agent": "Mozilla/5.0" } },
  );
  const text = await res.text();
  if (/^\s*</.test(text)) {
    // Drive serves its quota and virus-scan interstitials with a 200 and the
    // file's own content type, so the only tell is the body.
    const title = /<title>([^<]*)<\/title>/.exec(text)?.[1] ?? "html";
    throw new Error(`drive returned ${title}`);
  }
  return JSON.parse(text);
}

/**
 * A stable label for a capture site, from coordinates that never land on disk.
 *
 * The sessions carry a GPS fix each, to seven decimal places — that is the
 * factory floor of a named customer, at metre accuracy, and this manifest is a
 * file a later script reads and a careless `git add` commits. Rounding it is not
 * enough; two decimal places is still a kilometre square with one garment
 * factory in it.
 *
 * What the catalogue actually needs from a fix is whether two sessions were shot
 * in the same place, which a digest answers. The rounding before hashing is what
 * makes the answer stable across sessions whose fixes differ by a few metres.
 */
function siteOf(loc) {
  if (!loc || loc.lat == null || loc.lon == null) return null;
  const key = `${loc.lat.toFixed(1)},${loc.lon.toFixed(1)}`;
  return `site-${createHash("sha256").update(key).digest("hex").slice(0, 6)}`;
}

/**
 * Device rows with the identifiers stripped.
 *
 * `session.json` names each camera's serial and, for the wired GoPros, the
 * `control_url` they were driven on — which is a private address on the
 * customer's network. Neither is data about the footage. The model, the mode and
 * the stream list are, and they are what a buyer reads.
 */
function safeDevices(devices) {
  return (devices ?? []).map((d) => ({
    name: d.name ?? null,
    kind: d.kind ?? null,
    model: d.model ?? null,
    mode: d.mode ?? null,
    streams: d.streams ?? [],
    width: d.width ?? null,
    height: d.height ?? null,
    fps: d.fps ?? null,
  }));
}

/** Camera model, lens and intrinsics from a `<name>.calib.json`, minus serials. */
function safeCalib(c) {
  return {
    role: c.role ?? null,
    model: c.model ?? null,
    lens: c.lens ?? null,
    resolution: c.resolution ?? null,
    fps: c.fps ?? null,
    intrinsics: c.intrinsics ?? null,
  };
}

const manifest = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { sessions: {} };
const flush = () => {
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(manifest, null, 2));
};

/**
 * Everything under one session folder, in one pass.
 *
 * Device directories are walked rather than assumed: a session holds one folder
 * per camera under `gopro/`, or a flat `d455/`, or a `zed/`, and which of those
 * it is IS the configuration this delivery has to be filed under. Counting the
 * `gopro_N` folders is what separates the single head camera from the three-GoPro
 * rig, and nothing in the metadata says it outright.
 */
async function readSession(sessionId, task, clock) {
  const top = await listFolder(sessionId);
  const byName = new Map(top.map((e) => [e.name, e]));

  const out = {
    task,
    clock,
    devices: [],
    cameras: {},
    /** Non-camera directories: the mic track, and the orientation CSVs. */
    aux: {},
    files: {},
    lerobot: false,
    previews: [],
  };

  for (const key of ["metadata.json", "session.json", "context.json", "kit.json"]) {
    const e = byName.get(key);
    if (!e) continue;
    try {
      const j = await readJson(e.id);
      if (key === "metadata.json" || key === "session.json") {
        const meta = j.session_metadata ?? j;
        out.schema = j.schema ?? j.schema_version ?? out.schema;
        out.episodeId = j.episode_id ?? out.episodeId;
        out.sessionLabel = j.session ?? j.session_id ?? j.egokit_session_id ?? out.sessionLabel;
        out.mode = j.mode ?? out.mode;
        out.fps = j.fps ?? j.target_fps ?? out.fps;
        out.captureFps = j.capture_fps ?? j.capture?.fps ?? out.captureFps;
        out.frames = j.streams ?? (j.frames != null ? { _total: j.frames } : out.frames);
        out.sync = j.sync ?? out.sync;
        out.startPolicy = j.recording_start_policy ?? out.startPolicy;
        out.audio = j.audio?.enabled ?? out.audio;
        out.depth = j.depth ?? out.depth;
        out.missingStreams = j.missing_streams ?? out.missingStreams;
        out.rig = j.rig ?? out.rig;
        out.kitCode = j.kit_code ?? j.kit ?? meta?.kit ?? out.kitCode;
        out.startedAt = j.timestamp_start_iso ?? j.started_at ?? meta?.timestamp_start_iso ?? out.startedAt;
        out.site = siteOf(j.location ?? meta?.location) ?? out.site;
        if (j.recording_start_host_ms != null && j.recording_stop_host_ms != null) {
          out.durationSec = Number(
            ((j.recording_stop_host_ms - j.recording_start_host_ms) / 1000).toFixed(3),
          );
        } else if (j.started_ms != null && j.ended_ms != null) {
          out.durationSec = Number(((j.ended_ms - j.started_ms) / 1000).toFixed(3));
        }
        if (j.devices) out.devices = safeDevices(j.devices);
        if (j.camera) {
          out.devices = [
            {
              name: j.rig ?? "camera",
              kind: "zed",
              model: j.camera.model ?? null,
              mode: null,
              streams: j.capture?.views ? [j.capture.views] : [],
              width: j.capture?.resolution?.[0] ?? null,
              height: j.capture?.resolution?.[1] ?? null,
              fps: j.capture?.fps ?? null,
            },
          ];
        }
      }
      if (key === "context.json") {
        out.app = j.start_context?.app?.platform ?? null;
        out.site = siteOf(j.start_context?.location) ?? out.site;
      }
    } catch (err) {
      out.errors = [...(out.errors ?? []), `${key}: ${err.message ?? err}`];
    }
  }

  /* Frames-over-fps beside the clock span. Where they disagree, the disagreement
     is the finding — see the note at the top of this file. */
  const frameTotal = Object.values(out.frames ?? {}).reduce(
    (a, n) => a + (Number.isFinite(n) ? n : 0),
    0,
  );
  const fps = Number(out.captureFps ? Object.values(out.captureFps)[0] : out.fps) || null;
  if (frameTotal > 0 && fps) {
    out.framesDurationSec = Number((frameTotal / fps / Math.max(1, Object.keys(out.frames).length)).toFixed(3));
  }

  /* `{ id, bytes }` rather than a bare size. The id is what the preview cutter
     needs to reach the file, and a manifest that records only how big something
     is cannot be used to show it — which is how the first version of this file
     forced a full re-crawl. */
  const fileRec = (e) => ({ id: e.id, bytes: e.sizeBytes });

  for (const e of top) {
    if (e.kind === "file") {
      if (/^preview_/.test(e.name)) out.previews.push(e.name);
      else if (e.name !== ".DS_Store") out.files[e.name] = fileRec(e);
      continue;
    }
    if (e.name === "lerobot") {
      out.lerobot = true;
      continue;
    }
    if (e.name === "gopro") {
      for (const cam of await listFolder(e.id)) {
        if (cam.kind !== "folder") continue;
        const inside = await listFolder(cam.id);
        const rec = { files: {} };
        for (const f of inside) {
          if (f.kind !== "file") continue;
          rec.files[f.name] = fileRec(f);
        }
        const calib = inside.find((f) => /\.calib\.json$/.test(f.name));
        if (calib) {
          try {
            rec.calib = safeCalib(await readJson(calib.id));
          } catch (err) {
            rec.error = String(err.message ?? err);
          }
        }
        const audio = inside.find((f) => /_audio\.json$/.test(f.name));
        if (audio) {
          try {
            const j = await readJson(audio.id);
            rec.streamDurationSec = j.duration_s ?? null;
          } catch {
            /* the duration is a cross-check, not the record; a miss is not fatal */
          }
        }
        out.cameras[cam.name] = rec;
      }
      continue;
    }
    const inside = await listFolder(e.id);
    const rec = { files: {} };
    for (const f of inside) if (f.kind === "file") rec.files[f.name] = fileRec(f);
    /* `audio` is the mic track and `derived` is the orientation CSVs computed
       off the GoPro GPMF. Filing them under `cameras` made a one-camera session
       report three, which is the exact count this manifest exists to get right. */
    if (e.name === "audio" || e.name === "derived") out.aux[e.name] = rec;
    // A flat device directory: d455, zed, or whatever the next kit ships.
    else out.cameras[e.name] = rec;
  }

  /* The GoPro sessions declare `recording_start_host_ms` and no stop, so the
     clock span is unavailable and the per-stream audio duration is the only
     measured length in the delivery. It is per CAMERA, not per session, and the
     three-GoPro sessions disagree across their own cameras by tens of seconds —
     which is what `sync: "none"` and an independent start per camera produce.
     So the session length is the longest stream, and `cameraDurationsSec` keeps
     the spread visible rather than presenting one camera's clock as the rig's. */
  const perCam = Object.entries(out.cameras)
    .map(([k, v]) => [k, v.streamDurationSec])
    .filter(([, d]) => Number.isFinite(d));
  if (perCam.length) {
    out.cameraDurationsSec = Object.fromEntries(perCam);
    if (out.durationSec == null) {
      out.durationSec = Number(Math.max(...perCam.map(([, d]) => d)).toFixed(3));
      out.durationFrom = "longest stream";
    }
  } else if (out.durationSec != null) {
    out.durationFrom = "host clock span";
  }

  return out;
}

/** A folder is a session when it carries the sidecars a session is defined by. */
const isSession = (entries) =>
  entries.some((e) => e.kind === "file" && (e.name === "metadata.json" || e.name === "session.json"));

let done = 0;
let failed = 0;
let incomplete = 0;

async function walk(id, path, depth) {
  const entries = await listFolder(id);

  if (isSession(entries)) {
    /* A cached session is only done if it is COMPLETE. Drive answers a sidecar
       read with a quota page once the day's budget is spent, and the first
       version cached that outcome as a successful session — 27 of 85 landed with
       no duration and no sync, and every resume skipped exactly those 27 because
       a row existed for them. An error that survives a retry is not a fact about
       the delivery. */
    const cached = manifest.sessions[id];
    if (cached && !cached.incomplete) {
      console.log(`  hit  ${path.join(" / ")}`);
      return;
    }
    const task = TASK_DEPTH != null ? (path[TASK_DEPTH] ?? null) : (path[0] ?? null);
    try {
      const s = await readSession(id, task, path.at(-1) ?? null);
      /* Incomplete means NO LENGTH, not "something errored". `kit.json` and
         `context.json` carry the kit code and the app build, which no record
         reads — failing to fetch one is not a reason to re-walk a session that
         already knows how long it ran. Duration is the field a record cannot be
         written without, so it is the field that decides.

         Flagged rather than dropped: the file ids come off the folder listing,
         which no quota touches, so a resume repairs the row in place. */
      s.incomplete = s.durationSec == null;
      manifest.sessions[id] = s;
      const cams = Object.keys(s.cameras).join(",") || "none";
      if (s.incomplete) {
        incomplete++;
        console.log(`  PART ${path.join(" / ")}  ${cams}  ${s.errors?.[0] ?? "no duration"}`);
      } else {
        done++;
        console.log(
          `  ok   ${path.join(" / ")}  ${cams}  ${s.durationSec ?? "?"}s  sync=${s.sync ?? "?"}`,
        );
      }
    } catch (err) {
      manifest.sessions[id] = { task, clock: path.at(-1) ?? null, error: String(err.message ?? err) };
      failed++;
      console.log(`  FAIL ${path.join(" / ")}  ${err.message ?? err}`);
    }
    flush();
    return;
  }

  for (const e of entries) {
    if (e.kind !== "folder") continue;
    await walk(e.id, [...path, e.name], depth + 1);
  }
}

console.log(`reading drive folder ${ROOT_ID}`);
await walk(ROOT_ID, [], 0);
flush();

const rows = Object.values(manifest.sessions).filter((s) => !s.error);
const partial = rows.filter((s) => s.incomplete).length;
const hours = rows.reduce((a, s) => a + (s.durationSec ?? 0), 0) / 3600;
console.log(
  `\n${rows.length} sessions read, ${hours.toFixed(2)} h total, ` +
    `${failed} failed, ${partial} incomplete → ${OUT}`,
);
/* Say it loudly. A run that reports only its total looks finished when a third
   of it is missing a duration, which is how the quota page got mistaken for a
   completed crawl once already. */
if (partial) {
  console.log(`re-run to repair the ${partial} incomplete session(s); cached rows are skipped.`);
}
