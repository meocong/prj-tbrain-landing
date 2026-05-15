-- ──────────────────────────────────────────────────────────────────────────
-- 016_about_cards.sql
--
-- CMS-ify editable card groups on /about:
--   company, value, sample_projects, expertise, team, experts.
-- Section headings, office block, and final CTA remain hardcoded.
--
-- Rollback: 016_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE IF NOT EXISTS tbrain_landing.about_cards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_key     text NOT NULL CHECK (group_key IN ('company', 'value', 'sample_projects', 'expertise', 'team', 'experts')),
  slug          text NOT NULL,
  title         text NOT NULL,
  label         text,
  description   text,
  icon          text,
  image_url     text,
  meta          jsonb NOT NULL DEFAULT '{}'::jsonb,
  display_order int NOT NULL DEFAULT 100,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT about_cards_group_slug_key UNIQUE (group_key, slug)
);

CREATE INDEX IF NOT EXISTS about_cards_active_order_idx
  ON tbrain_landing.about_cards (group_key, is_active, display_order)
  WHERE is_active = true;

ALTER TABLE tbrain_landing.about_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS about_cards_select ON tbrain_landing.about_cards;
CREATE POLICY about_cards_select ON tbrain_landing.about_cards
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS about_cards_insert ON tbrain_landing.about_cards;
CREATE POLICY about_cards_insert ON tbrain_landing.about_cards
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS about_cards_update ON tbrain_landing.about_cards;
CREATE POLICY about_cards_update ON tbrain_landing.about_cards
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS about_cards_delete ON tbrain_landing.about_cards;
CREATE POLICY about_cards_delete ON tbrain_landing.about_cards
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

DROP TRIGGER IF EXISTS about_cards_updated_at ON tbrain_landing.about_cards;
CREATE TRIGGER about_cards_updated_at
  BEFORE UPDATE ON tbrain_landing.about_cards
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

INSERT INTO tbrain_landing.about_cards
  (group_key, slug, label, title, description, icon, image_url, meta, display_order, is_active)
VALUES
  ('company', 'company', 'Company', 'Tbrain builds managed data programs for frontier AI teams.', 'We combine expert operations, workflow software, and AI-native quality control so customers can ship complex datasets without building the whole delivery stack in-house.', 'Factory', NULL, '{}'::jsonb, 10, true),
  ('company', 'mission', 'Mission', 'Turn specialized human expertise into reliable model signal.', 'Our mission is to make agentic AI measurably better through auditable expert feedback, rigorous evaluation, and domain-specific data programs.', 'ShieldCheck', NULL, '{}'::jsonb, 20, true),
  ('company', 'team', 'Team', 'Operators, engineers, and domain experts working as one pod.', 'Tbrain brings together AI training data operators, engineering delivery leaders, and expert contributors across coding, medical, manufacturing, robotics, and data science.', 'Users', NULL, '{}'::jsonb, 30, true),

  ('value', 'domain-specific-expert-pods', NULL, 'Domain-Specific Expert Pods', 'Coding, STEM, medical, manufacturing, agent tool use, and other high-stakes domains.', 'Brain', NULL, '{}'::jsonb, 10, true),
  ('value', 'custom-software-tools', NULL, 'Custom software & tools', 'Purpose-built workflows that make expert review measurable, auditable, and fast to operate.', 'Workflow', NULL, '{}'::jsonb, 20, true),
  ('value', 'verifiable-loops', NULL, 'Verifiable loops', 'Closed-loop reinforcement learning systems for agents to self-improve from concrete outcomes.', 'CheckCircle', NULL, '{}'::jsonb, 30, true),

  ('sample_projects', 'chatbot-data-generation', NULL, 'Chatbot data generation', 'Q&A pairs for medical chatbot training.', 'MessageSquare', NULL, '{}'::jsonb, 10, true),
  ('sample_projects', 'training-data-generation', NULL, 'Training data generation', 'LLM response validation across domains.', 'LineChart', NULL, '{}'::jsonb, 20, true),
  ('sample_projects', 'audio-data-collection', NULL, 'Audio Data Collection', 'High-quality audio data for smart devices.', 'Mic', NULL, '{}'::jsonb, 30, true),

  ('expertise', 'coding-devops', NULL, 'Coding & DevOps', 'Python, C++, Java, Linux sysadmin, full stack', 'Database', NULL, '{}'::jsonb, 10, true),
  ('expertise', 'mathematics', NULL, 'Mathematics', 'Real analysis, linear algebra, topology', 'Brain', NULL, '{}'::jsonb, 20, true),
  ('expertise', 'science', NULL, 'Science', 'Physics, chemistry, biology', 'FlaskConical', NULL, '{}'::jsonb, 30, true),
  ('expertise', 'robotics', NULL, 'Robotics', 'Egocentric video, hand pose, motion capture, teleoperation', 'Bot', NULL, '{}'::jsonb, 40, true),
  ('expertise', 'data-science', NULL, 'Data Science', 'Python, SQL, machine learning, LLM fine-tuning', 'Code2', NULL, '{}'::jsonb, 50, true),
  ('expertise', 'finance', NULL, 'Finance', 'Macroeconomics, financial reporting', 'LineChart', NULL, '{}'::jsonb, 60, true),
  ('expertise', 'medical', NULL, 'Medical', 'Clinical, imaging, diagnostics', 'CheckCircle', NULL, '{}'::jsonb, 70, true),

  ('team', 'tam-le', 'AI training data strategy', 'Tam Le', 'Seasoned data science and analytics leader with 15+ years across Google, Adobe, and Asana. Tam brings deep AI training data expertise from close work with the AI trainer industry at Turing.', NULL, '/images/avt-tamle.png', '{"projects":["Expert-led data programs","Model evaluation","Global expert network"]}'::jsonb, 10, true),
  ('team', 'david-do', 'Engineering delivery leadership', 'David Do', 'Senior software engineering leader with 20 years of experience managing outsourced engineering teams, including a 500+ person engineering organization and multi-million-dollar delivery contracts.', NULL, '/images/avt-daviddo.png', '{"projects":["Engineering operations","Enterprise delivery","Managed expert teams"]}'::jsonb, 20, true),

  ('experts', 'nguyen-minh-t', 'Medical', 'Nguyen Minh T.', 'Radiologist, 9+ years', NULL, '/images/avt-1.png', '{"detail":"Top international hospital. Diagnostic imaging."}'::jsonb, 10, true),
  ('experts', 'trang-m', 'Coding / AI', 'Trang M.', 'Ph.D., Co-founder PowerGate', NULL, '/images/avt-2.png', '{"detail":"Head of AI. Software Engineering."}'::jsonb, 20, true),
  ('experts', 'huy-l', 'Coding / AI', 'Huy L.', 'Ph.D., AI Researcher', NULL, '/images/avt-3.png', '{"detail":"Deep learning at Phenikaa University."}'::jsonb, 30, true),
  ('experts', 'tu-ng', 'Data Science', 'Tu Ng.', 'Head of AI, 10+ years', NULL, '/images/avt-4.png', '{"detail":"Data Science lead. Python, SQL, ML."}'::jsonb, 40, true)
ON CONFLICT (group_key, slug) DO UPDATE SET
  label = EXCLUDED.label,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  image_url = EXCLUDED.image_url,
  meta = EXCLUDED.meta,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

COMMIT;
