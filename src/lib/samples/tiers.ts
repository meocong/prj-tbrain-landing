/**
 * Which camera configurations a record can be bought as.
 *
 * A record used to belong to exactly one tier. The approved egocentric set
 * does not fit that: every clip in it is a stereo capture — the product sales
 * leads with — recorded on a six-camera head rig that delivered four lenses,
 * so the same capture also shows what the 4- and 6-camera option adds. Thạch,
 * 2026-09-24: "cái stereo là cái chính của mình… cứ để 2 thôi, xong sẽ có
 * option 4 và 6."
 *
 * Filing each clip twice would double every count on the page. Instead a
 * record names its primary tier in `tier` and any others it also serves in
 * `alsoTiers`, and every place that asks "is this record in that tier" asks
 * here.
 */
export interface TierMember {
  tier: string;
  alsoTiers?: string[];
}

export const inTier = (r: TierMember, key: string): boolean =>
  r.tier === key || (r.alsoTiers?.includes(key) ?? false);

/** True when the record's place in this tier is borrowed from another one. */
export const sharedInto = (r: TierMember, key: string): boolean =>
  r.tier !== key && (r.alsoTiers?.includes(key) ?? false);
