-- Rollback for 010_case_studies.sql
-- Drops the case_studies table, RLS policies, trigger, and updated_at fn.

BEGIN;

DROP TRIGGER IF EXISTS case_studies_updated_at ON tbrain_landing.case_studies;
DROP FUNCTION IF EXISTS tbrain_landing.case_studies_set_updated_at();
DROP TABLE IF EXISTS tbrain_landing.case_studies CASCADE;

COMMIT;
