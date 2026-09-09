import samples from "./samples.json";
import { CAPABILITY } from "./capability";
import type { Category } from "./categories";

/**
 * What actually records a category, and what rides with every frame.
 *
 * The category pages were interchangeable: swap the h1 and the clips and
 * nothing else on `/samples/egocentric` said it was egocentric rather than
 * gaming. That is the opposite of what the records hold. Read off
 * `samples.json`, the two published categories share no signal at all:
 *
 *   egocentric  RGB stereo · IMU ~200 Hz · VIO · camera info · task and
 *               environment annotation · 30 fps · .mcap + .metadata.json
 *   gaming      screen capture 1920x1080 at 60 fps · per-frame keystrokes ·
 *               semantic actions · mouse delta · camera-to-world 4x4 ·
 *               pinhole intrinsics · .mp4 + .csv + session.json
 *
 * That is R1 (the rig split), R5 (annotation depth, "like tbrain-dashboard")
 * and R8/R16 (gaming states its games, keystrokes and camera matrices) in one
 * block, and all of it was already in the data.
 *
 * Derived wherever there are records, so it cannot drift from what ships. The
 * three categories with nothing published carry a hand-written list instead,
 * each line traceable to `IN_FLIGHT` or `CAPABILITY` for the same modality.
 */

export interface CaptureRow {
  label: string;
  value: string;
}

type Row = {
  modality: string;
  rig: string;
  resolution: string;
  fps: number;
  streams: string[];
  formats: string[];
  spec: [string, string][];
};
const ALL = samples as unknown as Row[];

const cell = (r: Row, k: string) => r.spec?.find((p) => p[0] === k)?.[1] ?? null;

/**
 * A stream label without its per-record measurement.
 *
 * The field carries the reading, not the name: 21 distinct strings for 118
 * egocentric records because each one prints its own IMU rate to a decimal, and
 * one prints `IMU null Hz`. The rate belongs in its own row where the spread
 * can be stated honestly; here we want the signal list.
 */
function signalName(s: string) {
  return s
    .replace(/\s+(null|[\d.]+)\s*Hz$/i, "")
    .replace(/\s+[\d.]+\s*fps$/i, "")
    .replace(/\s*\([^)]*\)$/, "")
    .trim();
}

/**
 * Numeric span of a spec field, printed as one figure or a range.
 *
 * A plain min-to-max lies when one record sits far off the rest. Egocentric IMU
 * rate is the live case: 116 records between 197.3 and 203 Hz, and `bed-making`
 * at 1000.3 Hz. "197.3-1000.3 Hz" reads as a rig that cannot hold a rate, which
 * is the opposite of what the data says. So the band is the bulk, and anything
 * outside it is counted rather than averaged away — an outlier that is real
 * stays visible, and one that is a metadata error stays findable.
 */
function span(rows: Row[], key: string, unit: string): string | null {
  const nums = rows
    .map((r) => parseFloat(String(cell(r, key) ?? "").replace(/[^0-9.]/g, "")))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (nums.length === 0) return null;

  const median = nums[Math.floor(nums.length / 2)];
  const inliers = nums.filter((n) => n >= median * 0.8 && n <= median * 1.25);
  const outside = nums.length - inliers.length;
  const band = inliers.length > 0 ? inliers : nums;

  const lo = band[0];
  const hi = band[band.length - 1];
  const r = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
  const base = lo === hi ? `${r(lo)} ${unit}` : `${r(lo)}-${r(hi)} ${unit}`;
  return outside === 0
    ? base
    : `${base} · ${outside} record${outside === 1 ? "" : "s"} outside this band`;
}

export function captureFor(c: Category): CaptureRow[] {
  const rows = c.modality ? ALL.filter((r) => r.modality === c.modality) : [];
  if (rows.length === 0) return c.capture ?? fromCapability(c);

  const uniq = (xs: string[]) => [...new Set(xs.filter(Boolean))];
  const signals = uniq(rows.flatMap((r) => r.streams.map(signalName)));

  /* Signals that only some sessions carry are worth separating: printed in the
     same list they would read as a promise about every record. */
  const universal = signals.filter((s) =>
    rows.every((r) => r.streams.some((x) => signalName(x) === s)),
  );
  const sometimes = signals.filter((s) => !universal.includes(s));

  const out: CaptureRow[] = [
    { label: "Recorded on", value: uniq(rows.map((r) => r.rig)).sort().join(" · ") },
    {
      label: "Video",
      value: `${uniq(rows.map((r) => r.resolution)).join(" · ")} at ${uniq(
        rows.map((r) => String(r.fps)),
      ).join("/")} fps`,
    },
    { label: "On every frame", value: universal.join(" · ") },
  ];

  const imu = span(rows, "IMU rate", "Hz");
  if (imu) out.push({ label: "IMU", value: imu });

  const cols = span(rows, "Telemetry columns", "columns per frame");
  if (cols) out.push({ label: "Telemetry", value: cols });

  if (sometimes.length > 0) {
    out.push({ label: "On some sessions", value: sometimes.join(" · ") });
  }

  /* Formats split the same way signals do. Gaming ships two shapes - five
     sessions with `key_bindings.json` and no Rerun recording, three with
     `key_binding.json` and a `.rrd` - and listing the union as one "Ships as"
     line promises every buyer a file three fifths of the records do not carry.
     The singular/plural pair is almost certainly a typo in the source, but it
     is not this function's job to guess which spelling is the real one. */
  const formats = uniq(rows.flatMap((r) => r.formats));
  const always = formats.filter((f) => rows.every((r) => r.formats.includes(f)));
  const varies = formats.filter((f) => !always.includes(f));

  out.push({ label: "Ships as", value: always.join(" · ") });
  if (varies.length > 0) {
    out.push({ label: "Also on some sessions", value: varies.join(" · ") });
  }
  return out;
}

/**
 * Fallback for a category with no records and no hand-written list: the rig and
 * sensors already transcribed in the tier sheet. Better than an empty block,
 * and it cannot say anything the sheet does not.
 */
function fromCapability(c: Category): CaptureRow[] {
  const tiers = (c.modality && CAPABILITY[c.modality]) || [];
  return tiers.flatMap((t) =>
    [
      { label: "Rig", value: t.rig },
      t.sensors ? { label: "Sensors", value: t.sensors } : null,
    ].filter(Boolean as unknown as (x: CaptureRow | null) => x is CaptureRow),
  );
}
