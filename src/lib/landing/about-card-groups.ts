export const ABOUT_CARD_GROUPS = [
  "company",
  "value",
  "sample_projects",
  "expertise",
  "team",
  "experts",
] as const;

export type AboutCardGroupKey = (typeof ABOUT_CARD_GROUPS)[number];
