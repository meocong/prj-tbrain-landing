import sharp from "sharp";
import path from "node:path";
import { promises as fs } from "node:fs";

const SRC_DIR = "/root/tbrain/prj-tbrain-management/docs";
const DST_DIR = "/root/tbrain/prj-tbrain-landing/public/images/platform";

// odyssey-batches: list rows start ~y=395; sensitive text on right of x=200.
// We blur a single big rectangle covering the project pills + assignee names.
async function anonymizeBatches() {
  const src = path.join(SRC_DIR, "odyssey-batches.png");
  const dst = path.join(DST_DIR, "batches-list.png");
  const meta = await sharp(src).metadata();
  const x = 200, y = 395, w = (meta.width ?? 1200) - x - 20, h = (meta.height ?? 947) - y - 10;
  const blurred = await sharp(src).extract({ left: x, top: y, width: w, height: h }).blur(14).toBuffer();
  await sharp(src)
    .composite([{ input: blurred, left: x, top: y }])
    .toFile(dst);
  console.log("wrote", dst);
}

// ctv-dashboard: blur task IDs column (left of each task row) + sidebar bottom + top-right location.
async function anonymizeCtv() {
  const src = path.join(SRC_DIR, "ctv-dashboard.png");
  const dst = path.join(DST_DIR, "ctv-active-tasks.png");

  const ops = [];

  // Active tasks rows region: y 290..930, x 290..1180 (whole table area).
  // We blur a vertical strip of 220px on the LEFT of the data area
  // (where green "CP2077-B02-S*" code labels live).
  const meta = await sharp(src).metadata();
  const W = meta.width ?? 1200, H = meta.height ?? 947;

  const taskCol = await sharp(src)
    .extract({ left: 290, top: 290, width: 220, height: Math.min(640, H - 290) })
    .blur(12).toBuffer();
  ops.push({ input: taskCol, left: 290, top: 290 });

  // Top-right location label "Tân Bình" — small region
  const topRight = await sharp(src).extract({ left: 1080, top: 50, width: 110, height: 50 }).blur(10).toBuffer();
  ops.push({ input: topRight, left: 1080, top: 50 });

  // Sidebar bottom username "Drake"
  const sidebar = await sharp(src).extract({ left: 0, top: 830, width: 240, height: 50 }).blur(10).toBuffer();
  ops.push({ input: sidebar, left: 0, top: 830 });

  // Hero greeting "CHÀO BUỔI SÁNG, DRAKE!" — blur the whole top band right of sidebar.
  const greeting = await sharp(src).extract({ left: 240, top: 0, width: W - 240, height: 90 }).blur(14).toBuffer();
  ops.push({ input: greeting, left: 240, top: 0 });

  await sharp(src).composite(ops).toFile(dst);
  console.log("wrote", dst);
}

await anonymizeBatches();
await anonymizeCtv();
