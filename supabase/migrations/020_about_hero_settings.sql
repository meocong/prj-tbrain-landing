-- ──────────────────────────────────────────────────────────────────────────
-- 020_about_hero_settings.sql
--
-- CMS-ify the editable hero and stat cards at the top of /about.
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE IF NOT EXISTS tbrain_landing.about_hero_settings (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key             text NOT NULL UNIQUE DEFAULT 'about',
  title_before    text,
  title_highlight text,
  title_after     text,
  description     text,
  stats           jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tbrain_landing.about_hero_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS about_hero_settings_select ON tbrain_landing.about_hero_settings;
CREATE POLICY about_hero_settings_select ON tbrain_landing.about_hero_settings
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS about_hero_settings_insert ON tbrain_landing.about_hero_settings;
CREATE POLICY about_hero_settings_insert ON tbrain_landing.about_hero_settings
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS about_hero_settings_update ON tbrain_landing.about_hero_settings;
CREATE POLICY about_hero_settings_update ON tbrain_landing.about_hero_settings
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP TRIGGER IF EXISTS about_hero_settings_updated_at ON tbrain_landing.about_hero_settings;
CREATE TRIGGER about_hero_settings_updated_at
  BEFORE UPDATE ON tbrain_landing.about_hero_settings
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

INSERT INTO tbrain_landing.about_hero_settings
  (key, title_before, title_highlight, title_after, description, stats)
VALUES
  (
    'about',
    'The improvement layer for',
    'agentic AI',
    '',
    'Expert-validated environments, data, and evaluation programs that make agentic AI measurably better. Run by domain pods built for high-stakes work.',
    '[
      {"value":17,"suffix":"K+","label":"Expert Pipeline"},
      {"value":8,"suffix":"+","label":"Core Domains"},
      {"value":3,"suffix":"+","label":"Data Modalities"},
      {"value":100,"suffix":"%","label":"Verifiable Loops"}
    ]'::jsonb
  )
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';

COMMIT;
