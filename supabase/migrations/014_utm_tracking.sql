-- ──────────────────────────────────────────────────────────────────────────
-- 014_utm_tracking.sql
--
-- Lead attribution: capture utm_source / utm_medium / utm_campaign / utm_term
-- / utm_content / referrer on every lead row so marketing can see which
-- channels drive pipeline. Mirrors columns across all lead-capture tables.
--
-- Rollback: 014_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'clients',
    'contact_submissions',
    'newsletter_subscribers',
    'access_requests',
    'case_study_downloads'
  ]
  LOOP
    EXECUTE format(
      'ALTER TABLE tbrain_landing.%I
         ADD COLUMN IF NOT EXISTS utm_source text,
         ADD COLUMN IF NOT EXISTS utm_medium text,
         ADD COLUMN IF NOT EXISTS utm_campaign text,
         ADD COLUMN IF NOT EXISTS utm_term text,
         ADD COLUMN IF NOT EXISTS utm_content text,
         ADD COLUMN IF NOT EXISTS referrer text',
      t
    );

    EXECUTE format(
      'CREATE INDEX IF NOT EXISTS %I_utm_source_idx ON tbrain_landing.%I (utm_source) WHERE utm_source IS NOT NULL',
      t, t
    );
  END LOOP;
END $$;

COMMIT;
