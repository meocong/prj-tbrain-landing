/**
 * The one place a Drive file is turned into a slug.
 *
 * There were two, and they disagreed. `cut-drive-previews.mjs` numbered within
 * a key that dropped the operator segment; `build-exo-records.mjs` numbered
 * within one that kept it, and sorted by shot time rather than by name. Both
 * looked reasonable in isolation, and the result was 39 clips on disk against
 * 12 records that could find them — the slug is the only join between a file in
 * `public/samples/` and a row in `samples.json`, so the two have to derive it
 * from the same code, not from the same intention.
 */

const DATE = /^(\w{3}) (\d{1,2}) (\d{4})$/;
const MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");

/**
 * The activity a folder states, where the delivery bothered to state one. Most
 * of it is filed by operator instead, which says who shot it and not what it is.
 */
export function statedActivity(path = []) {
  const seg = [...path].reverse().find((p) => !/^operator-/.test(p) && !DATE.test(p));
  if (!seg) return null;
  const s = seg.toLowerCase();
  if (s.includes("cycl")) return { activity: "urban-cycling", label: "Urban cycling" };
  if (s.includes("walk")) return { activity: "urban-walking", label: "Urban walking" };
  if (s.includes("vehic") || s.includes("navigation"))
    return { activity: "vehicular-navigation", label: "Vehicular navigation" };
  if (s.includes("office") || s.includes("indoor"))
    return { activity: "office-indoor", label: "Office and indoor" };
  return null;
}

/**
 * The slug's stem: the activity where the tree names one, the shoot date
 * otherwise. Never the operator folder and never the camera's own filename —
 * `IMG_2889.MOV` under a person's name says who shot it, which is exactly what
 * the ingest step went out of its way not to record.
 */
function stemFor(path = []) {
  const activity = [...path].reverse().find((p) => !/^operator-/.test(p) && !DATE.test(p));
  if (activity) {
    return activity
      .toLowerCase()
      .replace(/\([^)]*\)/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  const d = path.map((p) => DATE.exec(p)).find(Boolean);
  if (!d) return "exo";
  const month = String(MONTHS.indexOf(d[1].toLowerCase()) + 1).padStart(2, "0");
  return `exo-${d[3]}${month}${d[2].padStart(2, "0")}`;
}

/**
 * Every usable file in the manifest, in a fixed order, each with its slug.
 *
 * Sorted by name and numbered within the stem. Name rather than shot time
 * because a third of the delivery carries no timestamp, and a sort key that is
 * absent for some rows renumbers everything around them the moment one more
 * file is measured — which would rename clips already written to disk.
 */
export function exoFiles(manifest) {
  const rows = Object.entries(manifest.files)
    .filter(([, f]) => !f.error && f.durationSec)
    .sort((a, b) => a[1].name.localeCompare(b[1].name));

  const counters = new Map();
  return rows.map(([id, file]) => {
    const stem = stemFor(file.path);
    const n = (counters.get(stem) ?? 0) + 1;
    counters.set(stem, n);
    return { id, file, slug: `${stem}-${String(n).padStart(3, "0")}` };
  });
}
