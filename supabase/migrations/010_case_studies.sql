-- ──────────────────────────────────────────────────────────────────────────
-- 010_case_studies.sql
--
-- CMS-ify the /casestudy page. Moves content out of src/lib/constants and
-- into the database so admins can edit without a deploy. Reuses the existing
-- `content.*` permissions (case studies are still "content").
--
-- Rollback: 010_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Table -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tbrain_landing.case_studies (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  short_description text,
  description     text,
  image_url       text,                       -- /images/foo.jpg or full URL
  metrics         jsonb NOT NULL DEFAULT '[]'::jsonb,  -- [{value,label}, ...]
  display_order   int NOT NULL DEFAULT 100,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS case_studies_active_order_idx
  ON tbrain_landing.case_studies (is_active, display_order)
  WHERE is_active = true;

-- 2. RLS ---------------------------------------------------------------------
ALTER TABLE tbrain_landing.case_studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS case_studies_select ON tbrain_landing.case_studies;
CREATE POLICY case_studies_select ON tbrain_landing.case_studies
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS case_studies_insert ON tbrain_landing.case_studies;
CREATE POLICY case_studies_insert ON tbrain_landing.case_studies
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.create'));

DROP POLICY IF EXISTS case_studies_update ON tbrain_landing.case_studies;
CREATE POLICY case_studies_update ON tbrain_landing.case_studies
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS case_studies_delete ON tbrain_landing.case_studies;
CREATE POLICY case_studies_delete ON tbrain_landing.case_studies
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION tbrain_landing.case_studies_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS case_studies_updated_at ON tbrain_landing.case_studies;
CREATE TRIGGER case_studies_updated_at
  BEFORE UPDATE ON tbrain_landing.case_studies
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.case_studies_set_updated_at();

-- 3. Seed (mirrors src/lib/constants/marketing.ts FEATURED_CASE_STUDIES) -----
INSERT INTO tbrain_landing.case_studies
  (slug, title, short_description, description, image_url, metrics, display_order)
VALUES
  (
    'terminal-bench',
    'Terminal Bench: Agent Evaluation Platform',
    '500+ multi-step reasoning tasks with 4-layer validation',
    'Built a comprehensive benchmark for AI terminal agents. Each task requires multi-step reasoning across Linux, DevOps, Security, and Database. 4-layer validation ensures tasks are genuinely hard — GPT-5 passes ≤20% of them.',
    '/images/code-screen.jpg',
    '[{"value":"500+","label":"Tasks"},{"value":"≤20%","label":"GPT-5 Pass"},{"value":"4","label":"Validation Layers"},{"value":"8+","label":"Domains"}]'::jsonb,
    10
  ),
  (
    'robotics-mocap',
    'Robotics: Ground-Truth Motion Capture',
    'Multi-modal datasets for humanoid and manipulation training',
    'Producing egocentric video, MOCAP, and 3D hand pose data across household and commercial robotics use cases. Lab-grade capture validated against peer-reviewed benchmarks.',
    '/images/robotics-hero.jpg',
    '[{"value":"Sub-mm","label":"Precision"},{"value":"12+","label":"Data Modalities"},{"value":"829h","label":"Reference Data"},{"value":"6+","label":"Use Cases"}]'::jsonb,
    20
  ),
  (
    'multimodal-annotation',
    'Multimodal Annotation at Scale',
    '48K annotations in 4 months across 3 modalities',
    'Scaled from zero to 48,000 high-quality annotations in 4 months. Production-ready labeled data across text, image, and audio for enterprise AI training programs.',
    '/images/team-collab.jpg',
    '[{"value":"48K","label":"Annotations"},{"value":"4","label":"Months"},{"value":"3","label":"Modalities"},{"value":"90%+","label":"Accuracy"}]'::jsonb,
    30
  ),
  (
    'enterprise-ai-agents',
    'Enterprise AI Agents',
    '6 domain-specific Q&A agents in 1 month',
    'Stood up 6 production-grade Q&A agents with a practical evaluation framework for a global enterprise. Grounded in curated, approved knowledge — delivered from kickoff to handoff in 30 days.',
    '/images/ai-brain.jpg',
    '[{"value":"6","label":"Agents"},{"value":"1","label":"Month"},{"value":"720","label":"Test Queries"},{"value":"270","label":"Knowledge Files"}]'::jsonb,
    40
  ),
  (
    'video-game-pipeline',
    'Video Game Data Pipeline',
    'Automated QC and delivery for game recording annotation',
    'Built an end-to-end annotation pipeline for video game data collection with 4 agentic workflows: automated QC validation, delivery preparation, cloud sync (GCS/R2), and real-time notifications.',
    '/images/data-dashboard.jpg',
    '[{"value":"4","label":"AI Agents"},{"value":"Auto","label":"QC Pipeline"},{"value":"OAuth","label":"Cloud Sync"},{"value":"Real-time","label":"Tracking"}]'::jsonb,
    50
  )
ON CONFLICT (slug) DO NOTHING;

COMMIT;
