import records from "@/lib/samples/handpose-records.json";
import type { Sample } from "../tokens";

/**
 * The sixteen hand-pose catalogue records, typed. Built by
 * `scripts/samples/handpose/build-handpose-records.mjs` from the metrics; kept
 * out of `samples.json` so no site-wide count moves. Import only from code that
 * renders under HAND_POSE_ON.
 */
export const HP_RECORDS = records as unknown as Sample[];
