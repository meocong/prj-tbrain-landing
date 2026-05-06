-- ──────────────────────────────────────────────────────────────────────────
-- 015_case_study_extended.sql
--
-- Adds long-form HTML content for printable case study brochures.
-- Stored as HTML (TipTap output) so the same payload can render on the web
-- and into Puppeteer-generated PDFs without a markdown round-trip.
--
-- Rollback: 015_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

ALTER TABLE tbrain_landing.case_studies
  ADD COLUMN IF NOT EXISTS extended_content text,
  ADD COLUMN IF NOT EXISTS client_name text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS engagement_length text;

COMMIT;
