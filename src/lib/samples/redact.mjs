/**
 * Strip the internal identifiers out of a public sample record.
 *
 * `samples.json` is generated from the internal pipeline, so its `spec` rows
 * carry the pipeline's own join keys alongside the fields a buyer actually
 * reads. The keys are filtered on the way out rather than deleted from the
 * record, because the generator would put them straight back on the next run.
 *
 * Identifiers are removed, and so is anything that LOCATES the capture. Those
 * are two different jobs and this file only did the first: it stripped
 * `env-4370ad87` and published `Motorcycle repair shop 3 (Vinh Quynh) — Vĩnh
 * Quỳnh, Thanh Trì` beside `Geohash: w7er06` on a public page. A named business
 * with a district, and a geohash that resolves to about a kilometre, identify
 * the shop precisely — an opaque handle never could.
 *
 * The rule, from Tam on 2026-09-09: "cái gì có thể định vị nó là ai, người nào,
 * ở đâu thì cắt" — cut anything that can locate who or where. What survives is
 * what describes the CAPTURE: the kind of workplace, the station within it, the
 * operator's trade and age band. Never which workplace, and never where.
 *
 * Plain ESM, not TypeScript, because the catalogue (TS) and the staging script
 * (node ESM) both need it and a single source of truth is worth more here than
 * a type annotation.
 */

/**
 * Opaque pipeline handles. A reader gets nothing from `env-4370ad87`, and it
 * costs a row of the record to print it.
 *
 * `Task id` is deliberately not here: it is the readable slug a customer
 * quotes back when asking for a sample.
 */
export const DROPPED_LABELS = [
  // Opaque pipeline handles.
  "Environment id",
  "Business id",
  "Device id",
  "Episode uuid",

  /* Locators. Each of these on its own narrows the shop, and together they name
     it: `Business` carries the trading name and the commune, `Geohash` is a
     ~1.2 km cell, `NAICS` is the registered activity code, and `Session` is the
     capture handle an operator could be matched on. `Workplace` and `Station`
     stay — "Motorcycle Repair / Service Bay" describes the capture without
     pointing at anybody's premises. */
  "Business",
  "Geohash",
  "NAICS",
  "Session",
  /* The city. Coarser than the rest, and still a locator: a named workplace
     type in a named city is a short list. The aggregate — "4 cities" as a
     diversity figure — is a different claim and stays. */
  "Site",

  /* Rig names, on Tam's instruction: "Rig ko ghi tên". `DAS Ego V6 / fw
     2.1.18` and `kit-7cb9f1ee` tell a buyer nothing they can act on and tell a
     competitor what we buy. The configuration is the useful half and
     `CaptureSpec` already states it — six cameras in three stereo pairs, IMU at
     200 Hz — without naming the hardware. */
  "Device",
  "Kit",
];

/**
 * Rig names outside the spec table.
 *
 * `DROPPED_LABELS` covers the `Device` and `Kit` rows of the record modal, and
 * that is not where most readers saw the name: every card face carries a pill
 * reading `DAS Ego V6`, and the facet rail offers `Robocap`, `DAS Ego V6`,
 * `EgoSense E6` and `GameDataCollector` as filter chips.
 *
 * Worth stating what that facet is actually filtering, because it is not the
 * rig: all 118 egocentric records are `tier: stereo`, `resolution: stereo
 * pair`, first-person, RGB stereo + IMU + VIO, previewed as the left eye. Three
 * names, one published configuration. So there is nothing to rename the chips
 * TO — a "rig class" facet built from this data has one value and narrows
 * nothing — and the honest move is to drop the group rather than to relabel it.
 *
 * A rig facet becomes real again when the catalogue holds mono, six-camera and
 * wrist-cam captures that differ in the record. See Tam's note of 2026-09-09.
 */
export const PILL_KINDS_DROPPED = ["device"];

/**
 * `op-3fdc7901 / Motorcycle mechanic, 25–30, Right-handed` keeps everything
 * after the handle. The trade, age band and handedness describe the capture and
 * stay; the id in front of them is an id like any other.
 */
function redactOperator(value) {
  return value.replace(/^op-[0-9a-f]+\s*\/\s*/i, "");
}

/**
 * `capture__20260822_003114__5444ef0a__seg_000.mcap` → `…__seg_000.mcap`.
 *
 * `Session` is in `DROPPED_LABELS` and this row republished it: the filename IS
 * the session handle, plus a capture timestamp to the second. Dropping the row
 * above and printing the same string here is not a redaction.
 *
 * The segment index and the extension stay, because they are what the row is
 * for — the reader learns this is one segment of an MCAP delivery and not the
 * whole session. `SHA-256` is the handle a buyer actually quotes back, it is
 * opaque, and it is unaffected. All 118 records match this one shape.
 */
function redactFile(value) {
  return value.replace(/^capture__\d{8}_\d{6}__[0-9a-f]+__/i, "…__");
}

/** Label -> transform, for rows kept but carrying an id inside the value. */
const REDACTORS = {
  Operator: redactOperator,
  File: redactFile,
};

/**
 * The rows a public surface may print, in the original order.
 *
 * @param {[string, string][]} spec
 * @returns {[string, string][]}
 */
export function publicSpec(spec) {
  const out = [];
  for (const [label, value] of spec) {
    if (DROPPED_LABELS.includes(label)) continue;
    const redact = REDACTORS[label];
    out.push(redact ? [label, redact(value)] : [label, value]);
  }
  return out;
}
