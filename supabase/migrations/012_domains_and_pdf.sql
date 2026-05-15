-- ──────────────────────────────────────────────────────────────────────────
-- 012_domains_and_pdf.sql
--
-- Three additions for landing v2:
--   1. `services.category` enum to split "service" vs "domain" cards on /services
--   2. New `expert_os_features` table for the upcoming /platform page
--   3. PDF download capture for case studies (cols on case_studies + downloads table)
--
-- Idempotent. Rollback: 012_rollback.sql.
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── 1. services.category ─────────────────────────────────────────────────
ALTER TABLE tbrain_landing.services
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'service'
    CHECK (category IN ('service', 'domain'));

CREATE INDEX IF NOT EXISTS services_category_active_idx
  ON tbrain_landing.services (category, is_active, display_order)
  WHERE is_active = true;

-- ── 2. expert_os_features (CMS-able showcase for /platform) ──────────────
CREATE TABLE IF NOT EXISTS tbrain_landing.expert_os_features (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  description   text,
  icon          text NOT NULL DEFAULT 'Brain',
  display_order int NOT NULL DEFAULT 100,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS expert_os_features_active_order_idx
  ON tbrain_landing.expert_os_features (is_active, display_order)
  WHERE is_active = true;

ALTER TABLE tbrain_landing.expert_os_features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS expert_os_features_select ON tbrain_landing.expert_os_features;
CREATE POLICY expert_os_features_select ON tbrain_landing.expert_os_features
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS expert_os_features_insert ON tbrain_landing.expert_os_features;
CREATE POLICY expert_os_features_insert ON tbrain_landing.expert_os_features
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS expert_os_features_update ON tbrain_landing.expert_os_features;
CREATE POLICY expert_os_features_update ON tbrain_landing.expert_os_features
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS expert_os_features_delete ON tbrain_landing.expert_os_features;
CREATE POLICY expert_os_features_delete ON tbrain_landing.expert_os_features
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

DROP TRIGGER IF EXISTS expert_os_features_updated_at ON tbrain_landing.expert_os_features;
CREATE TRIGGER expert_os_features_updated_at
  BEFORE UPDATE ON tbrain_landing.expert_os_features
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

-- ── 3. case_studies PDF + downloads CRM ──────────────────────────────────
ALTER TABLE tbrain_landing.case_studies
  ADD COLUMN IF NOT EXISTS pdf_gcs_object text,
  ADD COLUMN IF NOT EXISTS pdf_filename text;

CREATE TABLE IF NOT EXISTS tbrain_landing.case_study_downloads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_study_id   uuid REFERENCES tbrain_landing.case_studies(id) ON DELETE CASCADE,
  email           text NOT NULL,
  full_name       text,
  company         text,
  ip              inet,
  user_agent      text,
  downloaded_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_study_downloads_case_idx
  ON tbrain_landing.case_study_downloads (case_study_id, downloaded_at DESC);
CREATE INDEX IF NOT EXISTS case_study_downloads_email_idx
  ON tbrain_landing.case_study_downloads (email, downloaded_at DESC);

ALTER TABLE tbrain_landing.case_study_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS case_study_downloads_select ON tbrain_landing.case_study_downloads;
CREATE POLICY case_study_downloads_select ON tbrain_landing.case_study_downloads
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('contacts.view'));

-- Service-role inserts via API; no public policy needed (service-role bypasses RLS)

-- ── 4. Reorganize seed data ──────────────────────────────────────────────

-- 4a. Demote existing 6 services to "domain" placeholders if they collide with
-- new product names. Easier: just insert 3 new ones with category='service'
-- and let media decide what to do with old rows via /admin/services.
INSERT INTO tbrain_landing.services (slug, title, description, icon, display_order, is_active, category) VALUES
  ('custom-expert-data',  'Custom Expert Data Collection', 'RLHF, SFT, and other data for pre-training, post-training, and fine-tuning.', 'Brain',     10, true, 'service'),
  ('benchmark-creation',  'Benchmark Creation',            'Multi-step reasoning benchmarks built and validated by domain experts.',     'BarChart3', 20, true, 'service'),
  ('agent-evaluation',    'Agent Evaluation and Analysis', 'Evaluation harnesses and analysis dashboards for frontier AI agents.',      'Bot',       30, true, 'service')
ON CONFLICT (slug) DO NOTHING;

-- 4b. Domain placeholders (Coding + Medical first per Sếp ranking)
INSERT INTO tbrain_landing.services (slug, title, description, icon, display_order, is_active, category) VALUES
  ('domain-coding',         'Coding',                'Software engineering, debugging, and DevOps tasks across modern stacks.', 'Code',         10, true, 'domain'),
  ('domain-medical',        'Medical',               'Clinical, imaging, and diagnostics annotation by qualified medical experts.', 'Stethoscope', 20, true, 'domain'),
  ('domain-manufacturing',  'Manufacturing',         'Industrial operations, robotics-in-factory, and supply-chain workflows.', 'Wrench',       30, true, 'domain'),
  ('domain-languages',      'Languages',             'Multilingual coverage including Asian, Spanish, Portuguese, and Baltic regions.', 'Globe', 40, true, 'domain'),
  ('domain-physical-ai',    'Physical AI / Robotics','Ground-truth motion capture and humanoid control data.',                  'Bot',          50, true, 'domain'),
  ('domain-rl',             'RL Environments',       'Sandbox environments and reward signals for reinforcement learning.',     'Cpu',          60, true, 'domain')
ON CONFLICT (slug) DO NOTHING;

-- 4c. Expert OS feature placeholders (media fills via /admin/expert-os)
INSERT INTO tbrain_landing.expert_os_features (slug, title, description, icon, display_order) VALUES
  ('agent-knowledge-base',  'Agent Knowledge Base',   'Custom one-to-one training and instant reference guides for agents.',                'Brain',     10),
  ('llm-as-a-judge',        'LLM-as-a-Judge',         'Automated evaluation before final human judgment, ensuring high quality at scale.',  'Scale',     20),
  ('agentic-workflows',     'Agentic Workflows',      'Workflow automation that lets agents collaborate and improve agents.',               'Workflow',  30),
  ('agent-identity-soul',   'Agent Identity & Soul',  'Persistent identity, beliefs, and goals that make agent behavior coherent over time.', 'Sparkles', 40)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
