-- ──────────────────────────────────────────────────────────────────────────
-- 008_samples_polymorphic.sql
--
-- Phase 5: make samples polymorphic to support multiple product types.
--
-- New shape:
--   samples.sample_type : 'terminal_bench' | 'video_annotation'
--                       | 'image_labeling' | 'text_qc'
--   samples.payload     : jsonb — type-specific shape, rendered by a
--                          per-type component on the admin detail page
--
-- Legacy columns (spec_json, instruction_md, tests_json) are kept and
-- made nullable so existing TB code that reads them continues to work
-- during the transition. They are also mirrored into payload so the new
-- admin renderer can work from payload alone.
-- ──────────────────────────────────────────────────────────────────────────

ALTER TABLE tbrain_landing.samples
  ADD COLUMN IF NOT EXISTS sample_type text NOT NULL DEFAULT 'terminal_bench',
  ADD COLUMN IF NOT EXISTS payload     jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Relax NOT NULL constraints on legacy fields so non-TB rows can exist
-- without them. (IF EXISTS guards a re-run.)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'tbrain_landing' AND table_name = 'samples'
      AND column_name = 'spec_json' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tbrain_landing.samples ALTER COLUMN spec_json DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'tbrain_landing' AND table_name = 'samples'
      AND column_name = 'instruction_md' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tbrain_landing.samples ALTER COLUMN instruction_md DROP NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'tbrain_landing' AND table_name = 'samples'
      AND column_name = 'tests_json' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE tbrain_landing.samples ALTER COLUMN tests_json DROP NOT NULL;
  END IF;
END $$;

-- Backfill payload for existing TB rows
UPDATE tbrain_landing.samples
   SET payload = jsonb_build_object(
         'spec', coalesce(spec_json, '{}'::jsonb),
         'instruction_md', coalesce(instruction_md, ''),
         'tests', coalesce(tests_json, '[]'::jsonb)
       ),
       sample_type = 'terminal_bench'
 WHERE payload = '{}'::jsonb
    OR payload IS NULL;

-- Enforce the set of supported types
ALTER TABLE tbrain_landing.samples
  DROP CONSTRAINT IF EXISTS samples_sample_type_check;

ALTER TABLE tbrain_landing.samples
  ADD CONSTRAINT samples_sample_type_check
  CHECK (sample_type IN ('terminal_bench','video_annotation','image_labeling','text_qc'));

CREATE INDEX IF NOT EXISTS samples_type_batch_idx
  ON tbrain_landing.samples (sample_type, batch_id);
