-- ──────────────────────────────────────────────────────────────────────────
-- 018_about_sections.sql
--
-- CMS-ify editable section widgets on /about. Cards remain child widgets in
-- about_cards; section headings, descriptions, layout, accent, and active state
-- move into about_sections.
--
-- Rollback: 018_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE IF NOT EXISTS tbrain_landing.about_sections (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key         text NOT NULL UNIQUE CHECK (group_key IN ('company', 'value', 'sample_projects', 'expertise', 'team', 'experts')),
  eyebrow           text,
  title_before      text,
  title_highlight   text,
  title_after       text,
  description       text,
  child_widget_type text NOT NULL DEFAULT 'icon-card' CHECK (child_widget_type IN ('icon-card', 'profile-card', 'avatar-card')),
  layout            text NOT NULL DEFAULT 'three' CHECK (layout IN ('two', 'three', 'four')),
  accent            text NOT NULL DEFAULT '#6C3CF4',
  display_order     int NOT NULL DEFAULT 100,
  is_active         boolean NOT NULL DEFAULT true,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS about_sections_active_order_idx
  ON tbrain_landing.about_sections (is_active, display_order)
  WHERE is_active = true;

ALTER TABLE tbrain_landing.about_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS about_sections_select ON tbrain_landing.about_sections;
CREATE POLICY about_sections_select ON tbrain_landing.about_sections
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS about_sections_insert ON tbrain_landing.about_sections;
CREATE POLICY about_sections_insert ON tbrain_landing.about_sections
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS about_sections_update ON tbrain_landing.about_sections;
CREATE POLICY about_sections_update ON tbrain_landing.about_sections
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS about_sections_delete ON tbrain_landing.about_sections;
CREATE POLICY about_sections_delete ON tbrain_landing.about_sections
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

DROP TRIGGER IF EXISTS about_sections_updated_at ON tbrain_landing.about_sections;
CREATE TRIGGER about_sections_updated_at
  BEFORE UPDATE ON tbrain_landing.about_sections
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

INSERT INTO tbrain_landing.about_sections
  (group_key, eyebrow, title_before, title_highlight, title_after, description, child_widget_type, layout, accent, display_order, is_active)
VALUES
  ('company', '/ company', 'Built for the messy middle between', 'models and ground truth', '', 'Tbrain is a data and evaluation partner for teams that need more than generic annotation: expert judgment, managed workflows, and measurable quality.', 'icon-card', 'three', '#6C3CF4', 10, true),
  ('value', '/ how we deliver value', 'Optimized for', 'scaling complexity', '', 'Legacy marketplaces break on high-stakes AI work. Tbrain provides verifiable software systems and expert-led loops required for agents to self-improve.', 'icon-card', 'three', '#6C3CF4', 20, true),
  ('sample_projects', '/ sample projects', 'Programs that turn expertise into', 'model signal', '', NULL, 'icon-card', 'three', '#10B981', 30, true),
  ('expertise', '/ technical expertise', 'Deep technical expertise across', 'hard domains', '', NULL, 'icon-card', 'two', '#6C3CF4', 40, true),
  ('team', '/ team', 'The operators behind', 'Tbrain programs', '', 'Tbrain combines AI training data operators, engineering delivery leaders, and domain experts to build evaluation, annotation, and human-feedback programs for high-stakes AI work.', 'profile-card', 'two', '#6C3CF4', 50, true),
  ('experts', '/ expert network', 'Domain experts when accuracy depends on depth', '', '', 'Tbrain works with specialized contributors across STEM, medical, coding, data science, robotics, and other technical domains where generic labeling teams are not enough.', 'avatar-card', 'four', '#6C3CF4', 60, true)
ON CONFLICT (group_key) DO UPDATE SET
  eyebrow = EXCLUDED.eyebrow,
  title_before = EXCLUDED.title_before,
  title_highlight = EXCLUDED.title_highlight,
  title_after = EXCLUDED.title_after,
  description = EXCLUDED.description,
  child_widget_type = EXCLUDED.child_widget_type,
  layout = EXCLUDED.layout,
  accent = EXCLUDED.accent,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

NOTIFY pgrst, 'reload schema';

COMMIT;
