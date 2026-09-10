/**
 * Read a public Google Drive delivery folder and write a metadata manifest.
 *
 * The exocentric delivery arrived as a Drive link rather than as files on disk,
 * and `samples.json` cannot be written from a link: every record needs
 * `durationSec`, `resolution`, `fps` and `size`, and inventing any of them is
 * the failure `capability.ts` already records once, where a pack's own
 * `info.json` declared ten episodes against eleven on disk.
 *
 * Downloading is not the answer either — the two GoPro files alone are 826 MB
 * and 1.20 GB. But Drive's download endpoint honours HTTP range requests, and
 * ffprobe issues range requests of its own, so pointing it at the URL reads the
 * moov atom and nothing else. A 1.2 GB file costs a few hundred kilobytes to
 * measure.
 *
 * What this does NOT do is fetch pixels. Posters and the 8-second web previews
 * are a second pass (`ffmpeg -ss`), kept separate so a slow, quota-bound crawl
 * is not repeated every time a still needs recutting.
 *
 * Usage:
 *   node scripts/samples/ingest-drive.mjs <folderId> [--out <path>] [--limit N]
 *
 * The manifest is cache-keyed by file id, so re-running resumes rather than
 * re-measuring. Delete the out file to start over.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

/**
 * The delivery is filed by operator, and four of those folders are named after
 * real people. Those names are not data about the footage, they are data about
 * staff, and `redact.mjs` exists because this repo has shipped internal names to
 * the browser before.
 *
 * Redacting at render time would be too late: the manifest itself is a file on
 * disk that a later script reads and a careless `git add` commits. So the name
 * is replaced here, at the only point it is ever held, by a one-way digest. The
 * result is stable across runs — the same folder maps to the same label — and
 * cannot be turned back into the name.
 *
 * Structural and activity folders are kept verbatim: they describe the shoot,
 * which is exactly what the catalogue needs to say. Anything not recognised as
 * one is treated as a person.
 */
/**
 * An episode folder in a delivery package, which carries two things at once:
 *
 *   02__fabric-sewing__capture__20260822_072004__8009793a__seg_001
 *      ^^^^^^^^^^^^^^          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *      the task — catalogue    the session handle — exactly what
 *      data, keep it           `redactFile` in redact.mjs strips
 *
 * The first pass hashed the whole string, because it matched nothing in
 * STRUCTURAL and so was treated as a person. That threw the task away with the
 * handle and left every episode filed under `operator-<hash>` with no way to
 * tell fabric-sewing from wood-grinding.
 */
const EPISODE = /^\d+__([a-z0-9][a-z0-9-]*)__capture__/i;

/** Folder names that describe the shoot or the package, never a person. */
const STRUCTURAL =
  /^(?:\w{3} \d{1,2} \d{4}|video|videos|clips|scripts|meta|metadata|raw|export|exports|.*(?:office|indoor|urban|walking|cycling|vehicular|navigation|environment|outdoor|studio|household|factory|sewing|grinding|cutting|cleaning|installation|selecting|working).*)$/i;

function safeSegment(name) {
  const t = name.trim();
  const ep = EPISODE.exec(t);
  // The task alone. The timestamp, the session hash and the segment index all
  // go, which is what `redactFile` does to the same string in the spec table.
  if (ep) return ep[1].toLowerCase();
  if (STRUCTURAL.test(t)) return t;
  return `operator-${createHash("sha256").update(t.toLowerCase()).digest("hex").slice(0, 6)}`;
}

const safePath = (segments) => segments.map(safeSegment);

const args = process.argv.slice(2);
const ROOT_ID = args.find((a) => !a.startsWith("--"));
const OUT = resolve(
  args.includes("--out") ? args[args.indexOf("--out") + 1] : "scripts/samples/drive-manifest.json"
);
const LIMIT = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : Infinity;
/** Re-measure entries written before a field was added, leaving the rest cached. */
const REFRESH = args.includes("--refresh");

if (!ROOT_ID) {
  console.error("usage: node scripts/samples/ingest-drive.mjs <folderId> [--out path] [--limit N]");
  process.exit(1);
}

const VIDEO = /\.(mp4|mov|avi|mkv|m4v)$/i;

/**
 * Drive renders a folder's contents into the page's bootstrap payload, so the
 * names and ids are in the HTML even though the visible list is drawn later by
 * script. Each entry appears as a quoted id followed within a few hundred bytes
 * by a quoted name; anchoring on the name and walking backwards to the nearest
 * id is what survives Drive's payload shape changing around it.
 *
 * A folder announces itself by the literal "Shared folder" suffix Drive appends
 * for accessibility, which is what separates a subfolder from a file here.
 */
async function listFolder(id) {
  const res = await fetch(`https://drive.google.com/drive/folders/${id}`, {
    headers: { "user-agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`folder ${id}: HTTP ${res.status}`);
  const html = await res.text();

  const entries = [];
  const seen = new Set();
  const re = /"((?:[^"\\]|\\.){2,120}?)\s(Shared folder|Video|Image|PDF|File)"/g;
  for (const m of html.matchAll(re)) {
    const name = m[1];
    if (seen.has(name)) continue;
    const before = html.slice(Math.max(0, m.index - 600), m.index);
    const ids = [...before.matchAll(/"([a-zA-Z0-9_-]{28,44})"/g)].map((x) => x[1]);
    if (ids.length === 0) continue;
    seen.add(name);
    entries.push({ name, id: ids[ids.length - 1], kind: m[2] === "Shared folder" ? "folder" : "file" });
  }
  return entries;
}

/**
 * The download endpoint answers a large file with a virus-scan interstitial
 * rather than bytes. The form in it carries the token that turns the same URL
 * into the real stream, so this posts the form back as a query string.
 */
async function directUrl(id) {
  const base = `https://drive.usercontent.google.com/download?id=${id}&export=download`;
  const res = await fetch(base, { headers: { "user-agent": "Mozilla/5.0" } });
  const html = await res.text();
  const uuid = /name="uuid" value="([^"]+)"/.exec(html)?.[1];
  return uuid ? `${base}&confirm=t&uuid=${uuid}` : base;
}

/** Total bytes, without transferring them. */
async function sizeOf(url) {
  const res = await fetch(url, { headers: { range: "bytes=0-0", "user-agent": "Mozilla/5.0" } });
  const range = res.headers.get("content-range");
  return range ? Number(range.split("/")[1]) : null;
}

async function probe(url) {
  const { stdout } = await run(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries",
      // `format_tags` is where the iPhone location and device live. Without it
      // listed here `-show_entries` filters the tags block out entirely and
      // `format.tags` comes back undefined.
      "format=duration,bit_rate:format_tags:stream=codec_name,codec_type,width,height,r_frame_rate",
      "-of", "json",
      url,
    ],
    { maxBuffer: 8 << 20 }
  );
  const j = JSON.parse(stdout);
  const v = j.streams?.find((s) => s.codec_type === "video");
  const a = j.streams?.find((s) => s.codec_type === "audio");
  // GoPro writes GPS, accelerometer and gyroscope into GPMF tracks, which
  // surface here as `data` streams. That is the difference between footage and
  // footage a navigation buyer can train on, so it is recorded per file.
  const data = j.streams?.filter((s) => s.codec_type === "data") ?? [];
  const [num, den] = (v?.r_frame_rate ?? "0/0").split("/").map(Number);

  /* The delivery has no activity labels — most of it is filed by operator, so
     the tree says who shot it and not what it is. But an iPhone writes where
     and when into the container, and those two together are the label:
     consecutive clips in a session give a distance and an elapsed time, and the
     average speed between them separates walking from cycling from a vehicle.
     No timed-metadata parsing needed; this is the same ffprobe call. */
  const t = j.format?.tags ?? {};
  const iso = t["com.apple.quicktime.location.ISO6709"] ?? null;
  const gps = iso ? parseISO6709(iso) : null;

  return {
    durationSec: j.format?.duration ? Number(j.format.duration) : null,
    bitRate: j.format?.bit_rate ? Number(j.format.bit_rate) : null,
    codec: v?.codec_name ?? null,
    width: v?.width ?? null,
    height: v?.height ?? null,
    fps: den ? Number((num / den).toFixed(3)) : null,
    audio: a?.codec_name ?? null,
    dataTracks: data.length,
    device: t["com.apple.quicktime.model"] ?? t.model ?? null,
    shotAt: t["com.apple.quicktime.creationdate"] ?? t.creation_time ?? null,
    gps,
    gpsAccuracyM: t["com.apple.quicktime.location.accuracy.horizontal"]
      ? Number(t["com.apple.quicktime.location.accuracy.horizontal"])
      : null,
  };
}

/** "+21.0409+105.8064+016.666/" -> { lat, lon, altM }. */
function parseISO6709(s) {
  const m = /^([+-]\d+(?:\.\d+)?)([+-]\d+(?:\.\d+)?)(?:([+-]\d+(?:\.\d+)?))?\/?$/.exec(s.trim());
  if (!m) return null;
  return {
    lat: Number(m[1]),
    lon: Number(m[2]),
    altM: m[3] !== undefined ? Number(m[3]) : null,
  };
}

const manifest = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : { files: {} };
let measured = 0;

async function walk(id, path) {
  const entries = await listFolder(id);
  for (const e of entries) {
    const here = [...path, e.name];
    if (e.kind === "folder") {
      // Pseudonymised in the log too. A terminal scrollback is not the repo,
      // but it is pasted into tickets, and the point is that the name has one
      // place it exists and this process is not it.
      console.log(`  dir  ${safePath(here).join(" / ")}`);
      await walk(e.id, here);
      continue;
    }
    if (!VIDEO.test(e.name)) continue;
    if (measured >= LIMIT) return;
    const cached = manifest.files[e.id];
    if (cached && !(REFRESH && cached.gps === undefined && !cached.error)) {
      console.log(`  hit  ${e.name}`);
      continue;
    }
    try {
      const url = await directUrl(e.id);
      const [size, meta] = await Promise.all([sizeOf(url), probe(url)]);
      manifest.files[e.id] = { name: e.name, path: safePath(here.slice(0, -1)), sizeBytes: size, ...meta };
      measured++;
      console.log(
        `  ok   ${e.name}  ${meta.width}x${meta.height} ${meta.fps}fps ` +
          `${meta.durationSec?.toFixed(1)}s ${(size / 1e6).toFixed(0)}MB ` +
          `data:${meta.dataTracks}`
      );
    } catch (err) {
      manifest.files[e.id] = { name: e.name, path: safePath(here.slice(0, -1)), error: String(err.message ?? err) };
      console.log(`  FAIL ${e.name}  ${err.message ?? err}`);
    }
    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(manifest, null, 2));
  }
}

console.log(`reading drive folder ${ROOT_ID}`);
await walk(ROOT_ID, []);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 2));

const rows = Object.values(manifest.files).filter((f) => !f.error);
const hours = rows.reduce((a, f) => a + (f.durationSec ?? 0), 0) / 3600;
console.log(
  `\n${rows.length} files measured, ${hours.toFixed(2)} h total, ` +
    `${Object.values(manifest.files).length - rows.length} failed → ${OUT}`
);
