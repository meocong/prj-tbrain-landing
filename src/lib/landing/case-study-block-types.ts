export const CASE_STUDY_BLOCK_TYPES = [
  "metrics_grid",
  "text_card",
  "objective_grid",
  "challenge_cards",
  "qa_framework",
  "process_steps",
  "outcome",
  "cta",
] as const;

export type CaseStudyBlockType = (typeof CASE_STUDY_BLOCK_TYPES)[number];
