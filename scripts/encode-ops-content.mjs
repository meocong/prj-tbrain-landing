#!/usr/bin/env node
/**
 * Encode ops-team Drive drops into landing assets.
 * Reads from /data/tbrain/incoming/drive_ops/<slot>/
 * Writes:
 *   public/videos/hero-mix/{1,2,3}.{webm,mp4} + .jpg poster
 *   public/videos/env/{textile,sorting,warehouse,dexterous}.webm + poster
 *   public/videos/modalities/{egocentric,mocap,annotation}.webm + poster
 *   scripts/ops-content-manifest.json
 *
 * Idempotent: skips outputs newer than their source.
 * Muted, no audio, VP9 (webm) + h264 (mp4), 480–720p, portrait-safe scaling.
 *
 * Usage: node scripts/encode-ops-content.mjs [--force] [--only=hero-1,textile]
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, resolve, basename } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const SRC_ROOT = "/data/tbrain/incoming/drive_ops";
const PUB = join(ROOT, "public");
const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const ONLY = [...args].find((a) => a.startsWith("--only="))?.slice(7)?.split(",") ?? null;

/* Encode presets. All muted. */
const PRESETS = {
  hero:      { w: 1920, h: 1080, dur: 10, kind: "landscape" },
  env10:     { w: 1280, h: 720,  dur: 10, kind: "landscape" },
  env20:     { w: 1280, h: 720,  dur: 20, kind: "landscape" },
  modality:  { w: 640,  h: 480,  dur: 10, kind: "landscape" },
  mocap:     { w: 1280, h: 720,  dur: 30, kind: "landscape" },
};

/* slot → { src?: absolute mp4 path, srcDir?: directory, outVariants: [{path, preset}] } */
const JOBS = [
  { slot: "hero-1", outputs: [{ path: "videos/hero-mix/1", preset: "hero" }] },
  { slot: "hero-2", outputs: [{ path: "videos/hero-mix/2", preset: "hero" }] },
  { slot: "hero-3", outputs: [{ path: "videos/hero-mix/3", preset: "hero" }] },
  { slot: "textile-a", outputs: [{ path: "videos/env/textile", preset: "env10" }] },
  { slot: "sorting",   outputs: [{ path: "videos/env/sorting", preset: "env10" }] },
  { slot: "warehouse", outputs: [{ path: "videos/env/warehouse", preset: "env20" }] },
  { slot: "dexterous", outputs: [{ path: "videos/env/dexterous", preset: "env20" }] },
  { slot: "hero-1", outputs: [{ path: "videos/modalities/egocentric", preset: "modality" }] },
  { slot: "mocap",  outputs: [{ path: "videos/modalities/mocap", preset: "mocap" }] },
  { slot: "annotation", outputs: [{ path: "videos/modalities/annotation", preset: "modality" }] },
];

function pickSource(slot) {
  const dir = join(SRC_ROOT, slot);
  if (!existsSync(dir)) return null;
  const st = statSync(dir);
  if (st.isFile()) return dir;
  const stack = [dir];
  const found = [];
  while (stack.length) {
    const d = stack.pop();
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, entry.name);
      if (entry.isDirectory()) stack.push(p);
      else if ([".mp4", ".mov", ".webm", ".mkv"].includes(extname(entry.name).toLowerCase())) {
        found.push({ p, size: statSync(p).size });
      }
    }
  }
  if (!found.length) return null;
  found.sort((a, b) => b.size - a.size);
  return found[0].p;
}

function needsEncode(dst, src) {
  if (FORCE) return true;
  if (!existsSync(dst)) return true;
  return statSync(src).mtimeMs > statSync(dst).mtimeMs;
}

function sh(cmd) {
  execSync(cmd, { stdio: ["ignore", "pipe", "pipe"] });
}

function encodeOne({ src, outBase, preset }) {
  const p = PRESETS[preset];
  const scale = `scale='min(iw,${p.w})':'-2'`;
  const webm = join(PUB, `${outBase}.webm`);
  const mp4 = join(PUB, `${outBase}.mp4`);
  const jpg = join(PUB, `${outBase}.jpg`);
  mkdirSync(join(PUB, outBase.split("/").slice(0, -1).join("/")), { recursive: true });

  const commonIn = `-y -ss 0 -t ${p.dur} -i ${JSON.stringify(src)}`;

  if (needsEncode(webm, src)) {
    console.log(`[webm] ${outBase}`);
    sh(`ffmpeg ${commonIn} -vf ${JSON.stringify(scale)} -an -c:v libvpx-vp9 -crf 34 -b:v 0 -deadline good -cpu-used 4 ${JSON.stringify(webm)} -loglevel error`);
  }
  if (needsEncode(mp4, src)) {
    console.log(`[mp4]  ${outBase}`);
    sh(`ffmpeg ${commonIn} -vf ${JSON.stringify(scale)} -an -c:v libx264 -crf 22 -preset medium -pix_fmt yuv420p -movflags +faststart ${JSON.stringify(mp4)} -loglevel error`);
  }
  if (needsEncode(jpg, src)) {
    console.log(`[jpg]  ${outBase}`);
    sh(`ffmpeg -y -ss 1 -i ${JSON.stringify(src)} -vframes 1 -vf ${JSON.stringify(scale)} -q:v 4 ${JSON.stringify(jpg)} -loglevel error`);
  }
  return { webm, mp4, jpg };
}

const manifest = { generatedAt: new Date().toISOString(), items: [] };

for (const job of JOBS) {
  if (ONLY && !ONLY.some((o) => job.slot.includes(o) || job.outputs[0].path.includes(o))) continue;
  const src = pickSource(job.slot);
  if (!src) {
    console.warn(`SKIP: no source for slot "${job.slot}" — drop not yet on disk.`);
    manifest.items.push({ slot: job.slot, status: "pending", src: null, outputs: job.outputs });
    continue;
  }
  console.log(`\n== ${job.slot} → ${src} ==`);
  for (const out of job.outputs) {
    try {
      const files = encodeOne({ src, outBase: out.path, preset: out.preset });
      manifest.items.push({ slot: job.slot, status: "ok", src, preset: out.preset, outBase: out.path, files: {
        webm: `/${out.path}.webm`, mp4: `/${out.path}.mp4`, jpg: `/${out.path}.jpg`,
      }});
    } catch (e) {
      console.error(`FAIL ${job.slot} → ${out.path}: ${e.message}`);
      manifest.items.push({ slot: job.slot, status: "error", src, error: String(e.message) });
    }
  }
}

const manifestPath = join(ROOT, "scripts/ops-content-manifest.json");
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nmanifest → ${manifestPath}`);
