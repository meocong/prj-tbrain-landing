/**
 * Build-time switches for the samples area. Decided in `next.config.ts` and
 * inlined into both bundles; read with a literal `process.env.X` member access
 * or Next will not inline it.
 */

/** /samples/hand-pose and everything that points at it. Staging yes, production no. */
export const HAND_POSE_ON = process.env.HAND_POSE_ON === "1";
