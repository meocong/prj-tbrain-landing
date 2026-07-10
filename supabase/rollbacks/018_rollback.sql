BEGIN;

DROP TRIGGER IF EXISTS about_sections_updated_at ON tbrain_landing.about_sections;
DROP INDEX IF EXISTS tbrain_landing.about_sections_active_order_idx;
DROP TABLE IF EXISTS tbrain_landing.about_sections;

COMMIT;
