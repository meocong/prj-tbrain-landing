-- Rollback for 015_case_study_extended.sql

BEGIN;

ALTER TABLE tbrain_landing.case_studies
  DROP COLUMN IF EXISTS extended_content,
  DROP COLUMN IF EXISTS client_name,
  DROP COLUMN IF EXISTS industry,
  DROP COLUMN IF EXISTS engagement_length;

COMMIT;
