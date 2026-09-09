import fs from "node:fs";
import path from "node:path";
import samples from "./samples.json";

/**
 * What a game session carries, read off the telemetry we already ship.
 *
 * Gaming's product is not the footage. Every other category sells what the
 * camera saw; this one sells the input stream and the camera pose aligned to
 * the frame they happened on, and the page said so in a facet rail and nowhere
 * else. R8 asks for how many games, the keystrokes and the camera matrices;
 * R16 asks for the category to have its own context rather than borrowing
 * robotics'.
 *
 * All of it is in `public/samples/telemetry/<slug>.json`, which `LiveTelemetry`
 * already streams per record inside the modal. This reads the same files at
 * build time for the summary a category page needs — the modal answers "what is
 * in this clip", and the category has to answer "what is in this kind of data".
 */

export interface GamingTitle {
  slug: string;
  /** The game, from the record's `Title` spec field. */
  title: string;
  frames: string;
  size: string;
  sessionType: string;
  /** Distinct keys and semantic actions in the shipped window. */
  keys: number;
  actions: number;
  /**
   * The camera path, already projected to the ground plane and normalised into
   * a 0-100 box. Empty where the capture recorded no pose.
   */
  path: [number, number][];
  /**
   * `RUB`, `RFU`, or null where no pose was recorded.
   *
   * Not decoration. The two conventions put the ground plane on different pairs
   * of axes — right-up-back means the floor is x and z, right-forward-up means
   * it is x and y — so a viewer that picks one and applies it to both plots the
   * second title's trajectory against its own height. Four titles are RFU and
   * one is RUB, so this is a live case and not a hypothetical.
   */
  axis: string | null;
  /**
   * The input track: one span per stretch where the same action was held.
   *
   * R8 asks for the keystrokes and the page had them only as a count. The rows
   * carry `k` and `a` at roughly 20 ms — `Down|Right` mapping to
   * `Brake|SteerRight` — and collapsing consecutive identical rows into spans
   * turns 480 samples into something a person can read: which action, when, for
   * how long. Times are seconds from the start of the shipped window.
   */
  track: { action: string; from: number; to: number }[];
  /** Seconds covered by the rows, so the track can be drawn to scale. */
  span: number;
}

interface Row {
  t: number;
  p: [number, number, number] | null;
  k: string | null;
  a: string | null;
}

/** Spans shorter than this are a keypress bounce, not an action worth drawing. */
const MIN_SPAN_SEC = 0.06;

/**
 * Consecutive rows with the same action become one span.
 *
 * Drawing 480 marks says "there was input"; drawing the eleven stretches a
 * driver actually held the brake says what they did.
 */
function inputTrack(rows: Row[]) {
  const out: { action: string; from: number; to: number }[] = [];
  for (const r of rows) {
    // `justcause3` stores the STRING "null" where no action was mapped, not a
    // JSON null. Rendered as-is it draws a span labelled "null" between two
    // real ones, which reads as a bug in our viewer rather than as a gap in
    // the capture.
    const action = r.a && r.a !== "null" ? r.a : null;
    if (!action) continue;
    const last = out[out.length - 1];
    if (last && last.action === action && r.t - last.to < 0.15) last.to = r.t;
    else out.push({ action, from: r.t, to: r.t });
  }
  return out.filter((s) => s.to - s.from >= MIN_SPAN_SEC);
}

type Sample = { slug: string; modality: string; spec: [string, string][] };
const ALL = samples as unknown as Sample[];
const cell = (s: Sample, k: string) => s.spec?.find((p) => p[0] === k)?.[1] ?? null;

/** Points kept per path. 480 rows drawn at card size is a smear, not a route. */
const POINTS = 120;

function project(p: [number, number, number], axis: string | null): [number, number] {
  // RUB: x right, y up, z back — the floor is x/z.
  // RFU: x right, y forward, z up — the floor is x/y.
  return axis === "RUB" ? [p[0], p[2]] : [p[0], p[1]];
}

export function gamingTitles(): GamingTitle[] {
  const dir = path.join(process.cwd(), "public", "samples", "telemetry");

  return ALL.filter((s) => s.modality === "gaming").map((s) => {
    let rows: Row[] = [];
    let axis: string | null = null;
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, `${s.slug}.json`), "utf8"));
      rows = raw.rows ?? [];
      axis = raw.axisConvention ?? null;
    } catch {
      // A title with no payload is a title with no path. It still lists.
    }

    const pts = rows
      .map((r) => (r.p ? project(r.p, axis) : null))
      .filter(Boolean) as [number, number][];

    const step = Math.max(1, Math.floor(pts.length / POINTS));
    const kept = pts.filter((_, i) => i % step === 0);

    // Normalised per title, not across the set: these are different game worlds
    // in different units, and a shared extent would draw four of them as dots.
    const xs = kept.map((q) => q[0]);
    const ys = kept.map((q) => q[1]);
    const spanX = Math.max(...xs) - Math.min(...xs) || 1;
    const spanY = Math.max(...ys) - Math.min(...ys) || 1;
    const span = Math.max(spanX, spanY); // one scale for both axes, so the
    // shape of the route is preserved rather than stretched to fill the box
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);

    return {
      slug: s.slug,
      title: cell(s, "Title") ?? s.slug,
      frames: cell(s, "Frames") ?? "—",
      size: cell(s, "Delivered size") ?? "—",
      sessionType: cell(s, "Session type") ?? "—",
      keys: new Set(rows.map((r) => r.k).filter(Boolean)).size,
      actions: new Set(rows.map((r) => r.a).filter(Boolean)).size,
      path: kept.map(([x, y]) => [
        ((x - minX) / span) * 100,
        ((y - minY) / span) * 100,
      ]) as [number, number][],
      axis,
      track: inputTrack(rows),
      span: rows.length ? rows[rows.length - 1].t : 0,
    };
  });
}
