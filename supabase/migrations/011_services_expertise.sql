-- ──────────────────────────────────────────────────────────────────────────
-- 011_services_expertise.sql
--
-- CMS-ify /services. Two simple tables: `services` (the 6 service cards) and
-- `expertise_areas` (the bullet list inside the Deep Technical Expertise
-- card). Reuses content.* permissions.
--
-- Rollback: 011_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. services ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tbrain_landing.services (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  description   text,
  icon          text NOT NULL DEFAULT 'Database',  -- lucide-react icon name
  display_order int NOT NULL DEFAULT 100,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_active_order_idx
  ON tbrain_landing.services (is_active, display_order)
  WHERE is_active = true;

ALTER TABLE tbrain_landing.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS services_select ON tbrain_landing.services;
CREATE POLICY services_select ON tbrain_landing.services
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS services_insert ON tbrain_landing.services;
CREATE POLICY services_insert ON tbrain_landing.services
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS services_update ON tbrain_landing.services;
CREATE POLICY services_update ON tbrain_landing.services
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS services_delete ON tbrain_landing.services;
CREATE POLICY services_delete ON tbrain_landing.services
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

-- 2. expertise_areas ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS tbrain_landing.expertise_areas (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label         text NOT NULL,
  detail        text NOT NULL,
  display_order int NOT NULL DEFAULT 100,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expertise_areas_active_order_idx
  ON tbrain_landing.expertise_areas (is_active, display_order)
  WHERE is_active = true;

ALTER TABLE tbrain_landing.expertise_areas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expertise_areas_select ON tbrain_landing.expertise_areas;
CREATE POLICY expertise_areas_select ON tbrain_landing.expertise_areas
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS expertise_areas_insert ON tbrain_landing.expertise_areas;
CREATE POLICY expertise_areas_insert ON tbrain_landing.expertise_areas
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS expertise_areas_update ON tbrain_landing.expertise_areas;
CREATE POLICY expertise_areas_update ON tbrain_landing.expertise_areas
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS expertise_areas_delete ON tbrain_landing.expertise_areas;
CREATE POLICY expertise_areas_delete ON tbrain_landing.expertise_areas
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

-- 3. updated_at triggers -----------------------------------------------------
CREATE OR REPLACE FUNCTION tbrain_landing.touch_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS services_updated_at ON tbrain_landing.services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON tbrain_landing.services
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

DROP TRIGGER IF EXISTS expertise_areas_updated_at ON tbrain_landing.expertise_areas;
CREATE TRIGGER expertise_areas_updated_at
  BEFORE UPDATE ON tbrain_landing.expertise_areas
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

-- 4. Seed services (mirrors marketing.ts SERVICES) ---------------------------
INSERT INTO tbrain_landing.services (slug, title, description, icon, display_order) VALUES
  ('rlhf-sft',         'RLHF & SFT',           'Expert-driven reinforcement learning from human feedback and supervised fine-tuning.', 'Brain',       10),
  ('data-annotation',  'Data Annotation',      'Multi-modal annotation across text, image, video, and audio.',                          'Tags',        20),
  ('agent-evaluation', 'AI Agent Evaluation',  'Multi-step benchmark tasks for frontier AI agents.',                                     'BarChart3',   30),
  ('robotics-data',    'Robotics Data',        'Ground-truth motion and hand pose data with lab-grade precision.',                       'Bot',         40),
  ('quality-assurance','Quality Assurance',    'AI-native QC with automated pre-screening and expert review.',                           'ShieldCheck', 50),
  ('expert-teams',     'Expert Teams',         'On-demand domain expert pods across 17+ countries.',                                     'Users',       60)
ON CONFLICT (slug) DO NOTHING;

-- 5. Seed expertise_areas (mirrors marketing.ts EXPERTISE_AREAS) -------------
INSERT INTO tbrain_landing.expertise_areas (label, detail, display_order) VALUES
  ('Coding & DevOps:', 'Python, C++, Java, Linux sysadmin, full stack',                  10),
  ('Mathematics:',     'Real analysis, linear algebra, topology',                        20),
  ('Science:',         'Physics, chemistry, biology',                                    30),
  ('Robotics:',        'Egocentric video, hand pose, motion capture, teleoperation',     40),
  ('Data Science:',    'Python, SQL, machine learning, LLM fine-tuning',                 50),
  ('Finance:',         'Macroeconomics, financial reporting',                            60),
  ('Medical:',         'Clinical, imaging, diagnostics',                                 70)
ON CONFLICT DO NOTHING;

COMMIT;
