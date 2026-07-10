BEGIN;

DROP TRIGGER IF EXISTS about_cards_updated_at ON tbrain_landing.about_cards;
DROP TABLE IF EXISTS tbrain_landing.about_cards;

COMMIT;
