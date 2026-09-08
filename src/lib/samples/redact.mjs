/**
 * Strip the internal identifiers out of a public sample record.
 *
 * `samples.json` is generated from the internal pipeline, so its `spec` rows
 * carry the pipeline's own join keys alongside the fields a buyer actually
 * reads. The keys are filtered on the way out rather than deleted from the
 * record, because the generator would put them straight back on the next run.
 *
 * Only identifiers are removed. Everything descriptive — the business, the
 * site, the geohash, the operator's trade and age band — is published as is.
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
  "Environment id",
  "Business id",
  "Device id",
  "Episode uuid",
];

/**
 * `op-3fdc7901 / Motorcycle mechanic, 25–30, Right-handed` keeps everything
 * after the handle. The trade, age band and handedness describe the capture and
 * stay; the id in front of them is an id like any other.
 */
function redactOperator(value) {
  return value.replace(/^op-[0-9a-f]+\s*\/\s*/i, "");
}

/** Label -> transform, for rows kept but carrying an id inside the value. */
const REDACTORS = {
  Operator: redactOperator,
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
