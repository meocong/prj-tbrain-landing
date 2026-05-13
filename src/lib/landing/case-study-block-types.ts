export const CASE_STUDY_BLOCK_TYPES = [
  "metrics_grid",
  "text_card",
  "objective_grid",
  "challenge_cards",
  "qa_framework",
  "process_steps",
  "outcome",
  "image",
  "cta",
] as const;

export type CaseStudyBlockType = (typeof CASE_STUDY_BLOCK_TYPES)[number];

export type CaseStudyBlock = {
  id: string;
  caseStudyId: string;
  type: CaseStudyBlockType;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  config: Record<string, unknown>;
  displayOrder: number;
  isActive: boolean;
};
