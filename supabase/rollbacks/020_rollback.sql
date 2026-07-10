BEGIN;

DROP TRIGGER IF EXISTS about_hero_settings_updated_at ON tbrain_landing.about_hero_settings;
DROP TABLE IF EXISTS tbrain_landing.about_hero_settings;

COMMIT;
