-- Rollback for 011_services_expertise.sql

BEGIN;

DROP TRIGGER IF EXISTS services_updated_at ON tbrain_landing.services;
DROP TRIGGER IF EXISTS expertise_areas_updated_at ON tbrain_landing.expertise_areas;

DROP TABLE IF EXISTS tbrain_landing.services CASCADE;
DROP TABLE IF EXISTS tbrain_landing.expertise_areas CASCADE;

-- touch_updated_at() left in place — it's generic and may be used by 012+.

COMMIT;
