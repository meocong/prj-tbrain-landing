-- Allow case study detail pages to include editable image widgets.

BEGIN;

ALTER TABLE tbrain_landing.case_study_blocks
  DROP CONSTRAINT IF EXISTS case_study_blocks_type_check;

ALTER TABLE tbrain_landing.case_study_blocks
  ADD CONSTRAINT case_study_blocks_type_check
  CHECK (type IN (
    'metrics_grid',
    'text_card',
    'objective_grid',
    'challenge_cards',
    'qa_framework',
    'process_steps',
    'outcome',
    'image',
    'cta'
  ));

COMMIT;
