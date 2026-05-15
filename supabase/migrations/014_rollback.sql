-- Rollback for 014_utm_tracking.sql

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
         DROP COLUMN IF EXISTS utm_source,
         DROP COLUMN IF EXISTS utm_medium,
         DROP COLUMN IF EXISTS utm_campaign,
         DROP COLUMN IF EXISTS utm_term,
         DROP COLUMN IF EXISTS utm_content,
         DROP COLUMN IF EXISTS referrer',
      t
    );
  END LOOP;
END $$;

COMMIT;
