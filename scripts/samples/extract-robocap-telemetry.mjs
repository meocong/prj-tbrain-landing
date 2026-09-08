/**
 * Build the live-record track for one Robocap sample.
 *
 * A Robocap segment ships `imu_left.db` and `imu_right.db`: two SQLite files,
 * each with `acc_data` and `gyro_data` in raw sensor counts against a
 * nanosecond clock. The two units share that clock but start about 120 ms
 * apart, so the zero for the whole segment is the earliest sample across all
 * four streams — using each file's own start would slide the two hands out of
 * sync by exactly that gap.
 *
 * The catalogue plays an 8 second preview cut from a known offset into the
 * segment (the `Shown` row of each record says where). This writes the same
 * window, downsampled to 30 Hz so the readout has one row per displayed frame,
 * and keeps each sample's real timestamp rather than snapping it to the grid —
 * the panel prints what was recorded and never interpolates.
 *
 * Usage:
 *   node scripts/samples/extract-robocap-telemetry.mjs \
 *     --slug robocap-street --dir /tmp/rc19 --prefix robocap_segment1 --offset 300
 */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "../..");

const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};

const slug = arg("slug");
const dir = arg("dir");
const prefix = arg("prefix", "robocap_segment1");
const offsetSec = Number(arg("offset"));
const windowSec = Number(arg("window", "8"));
const outHz = Number(arg("hz", "30"));

if (!slug || !dir || !Number.isFinite(offsetSec)) {
  console.error("Usage: --slug <slug> --dir <dir with imu dbs> [--prefix p] --offset <sec> [--window 8] [--hz 30]");
  process.exit(1);
}

function query(db, sql) {
  const out = execFileSync("sqlite3", [db, sql], { encoding: "utf8", maxBuffer: 1 << 28 });
  return out.trim() ? out.trim().split("\n") : [];
}

function rows(db, table) {
  return query(db, `select timestamp, x, y, z from ${table} order by timestamp;`).map((line) => {
    const [t, x, y, z] = line.split("|");
    return { ts: Number(t), x: Number(x), y: Number(y), z: Number(z) };
  });
}

function meta(db) {
  const out = {};
  for (const line of query(db, "select key, value from metadata;")) {
    const [k, v] = line.split("|");
    out[k] = v;
  }
  return out;
}

const dbLeft = join(dir, `${prefix}_imu_left.db`);
const dbRight = join(dir, `${prefix}_imu_right.db`);

const streams = {
  accLeft: rows(dbLeft, "acc_data"),
  gyroLeft: rows(dbLeft, "gyro_data"),
  accRight: rows(dbRight, "acc_data"),
  gyroRight: rows(dbRight, "gyro_data"),
};

// One zero for the whole segment, or the two units drift apart on screen.
const t0 = Math.min(...Object.values(streams).map((s) => s[0].ts));
const spanSec = (Math.max(...Object.values(streams).map((s) => s[s.length - 1].ts)) - t0) / 1e9;

/** Nearest recorded sample to each output tick. Never interpolated. */
function window(list) {
  const out = [];
  const count = Math.round(windowSec * outHz);
  let cursor = 0;
  for (let k = 0; k < count; k++) {
    const target = t0 + (offsetSec + k / outHz) * 1e9;
    while (cursor + 1 < list.length && Math.abs(list[cursor + 1].ts - target) <= Math.abs(list[cursor].ts - target)) {
      cursor += 1;
    }
    const s = list[cursor];
    const m = Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z);
    out.push({
      t: Number(((s.ts - t0) / 1e9 - offsetSec).toFixed(3)),
      m: Number(m.toFixed(1)),
      x: s.x,
      y: s.y,
      z: s.z,
    });
  }
  return out;
}

const m = meta(dbLeft);
const rateHz = Math.round(
  Object.values(streams).reduce((a, s) => a + s.length / spanSec, 0) / Object.keys(streams).length
);

const payload = {
  slug,
  offsetSec,
  device: {
    product: m.product,
    version: m.version,
    imu: m.imu,
    camera: m.camera,
    mag: m.mag,
    deviceId: m.deviceid,
  },
  rateHz,
  accLeft: window(streams.accLeft),
  gyroLeft: window(streams.gyroLeft),
  accRight: window(streams.accRight),
  gyroRight: window(streams.gyroRight),
};

const out = join(ROOT, "public/samples/telemetry", `${slug}.json`);
writeFileSync(out, JSON.stringify(payload) + "\n");

console.log(`${slug}: ${payload.accLeft.length} rows per stream at ${outHz} Hz`);
console.log(`  source ${spanSec.toFixed(1)} s at ~${rateHz} Hz, window from ${offsetSec} s`);
console.log(`  device ${payload.device.product} ${payload.device.version} · ${payload.device.deviceId}`);
console.log(`  -> public/samples/telemetry/${slug}.json`);
