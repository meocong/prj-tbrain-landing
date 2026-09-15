BEGIN;

DROP TRIGGER IF EXISTS case_study_blocks_updated_at ON tbrain_landing.case_study_blocks;
DROP TABLE IF EXISTS tbrain_landing.case_study_blocks;

COMMIT;
