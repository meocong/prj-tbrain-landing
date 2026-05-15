-- Rollback for 012_domains_and_pdf.sql

BEGIN;

DROP TRIGGER IF EXISTS expert_os_features_updated_at ON tbrain_landing.expert_os_features;
DROP TABLE IF EXISTS tbrain_landing.expert_os_features CASCADE;

DROP TABLE IF EXISTS tbrain_landing.case_study_downloads CASCADE;

ALTER TABLE tbrain_landing.case_studies
  DROP COLUMN IF EXISTS pdf_gcs_object,
  DROP COLUMN IF EXISTS pdf_filename;

DROP INDEX IF EXISTS tbrain_landing.services_category_active_idx;
ALTER TABLE tbrain_landing.services
  DROP COLUMN IF EXISTS category;

-- Note: seeded service/domain rows from migration are NOT removed automatically
-- (they have no marker to identify). Manually delete via /admin/services if needed.

COMMIT;
