-- ──────────────────────────────────────────────────────────────────────────
-- 023_content_agent.sql
--
-- Support for the AI content agent (Hermes) that drafts blog posts:
--   * provenance + review columns on cms_posts (who approved an AI draft, when)
--   * cms_post_social: per-network share messages (LinkedIn / Facebook / X)
--   * a guard trigger: an agent-sourced post can only become 'published' when
--     a human admin is identified as reviewer. The agent API runs as
--     service_role (no JWT), so it can never publish on its own.
--
-- Rollback: 023_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. cms_posts provenance / review ------------------------------------------
ALTER TABLE tbrain_landing.cms_posts
  ADD COLUMN IF NOT EXISTS source      text NOT NULL DEFAULT 'human'
    CHECK (source IN ('human', 'agent')),
  ADD COLUMN IF NOT EXISTS ai_assisted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES tbrain_landing.admin_users(id),
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS agent_meta  jsonb NOT NULL DEFAULT '{}'::jsonb;

DROP TRIGGER IF EXISTS cms_posts_updated_at ON tbrain_landing.cms_posts;
CREATE TRIGGER cms_posts_updated_at
  BEFORE UPDATE ON tbrain_landing.cms_posts
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

-- 2. Publish guard for agent drafts -----------------------------------------
CREATE OR REPLACE FUNCTION tbrain_landing.cms_posts_review_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
BEGIN
  IF NEW.status = 'published'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    NEW.reviewed_by := COALESCE(NEW.reviewed_by, tbrain_landing.current_admin_id());
    IF NEW.reviewed_by IS NOT NULL THEN
      NEW.reviewed_at := COALESCE(NEW.reviewed_at, now());
    ELSIF NEW.source = 'agent' THEN
      RAISE EXCEPTION 'agent drafts need a human reviewer before publishing'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_posts_review_guard ON tbrain_landing.cms_posts;
CREATE TRIGGER cms_posts_review_guard
  BEFORE INSERT OR UPDATE ON tbrain_landing.cms_posts
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.cms_posts_review_guard();

CREATE INDEX IF NOT EXISTS cms_posts_source_idx
  ON tbrain_landing.cms_posts (source, status);

-- 3. Social share messages ----------------------------------------------------
CREATE TABLE IF NOT EXISTS tbrain_landing.cms_post_social (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id      uuid NOT NULL REFERENCES tbrain_landing.cms_posts(id) ON DELETE CASCADE,
  network      text NOT NULL CHECK (network IN ('linkedin', 'facebook', 'x')),
  message      text NOT NULL DEFAULT '',
  status       text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'shared', 'scheduled', 'posted')),
  shared_by    uuid REFERENCES tbrain_landing.admin_users(id),
  shared_at    timestamptz,
  external_url text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, network)
);

ALTER TABLE tbrain_landing.cms_post_social ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cms_post_social_select ON tbrain_landing.cms_post_social;
CREATE POLICY cms_post_social_select ON tbrain_landing.cms_post_social
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS cms_post_social_insert ON tbrain_landing.cms_post_social;
CREATE POLICY cms_post_social_insert ON tbrain_landing.cms_post_social
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS cms_post_social_update ON tbrain_landing.cms_post_social;
CREATE POLICY cms_post_social_update ON tbrain_landing.cms_post_social
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS cms_post_social_delete ON tbrain_landing.cms_post_social;
CREATE POLICY cms_post_social_delete ON tbrain_landing.cms_post_social
  FOR DELETE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.delete'));

DROP TRIGGER IF EXISTS cms_post_social_updated_at ON tbrain_landing.cms_post_social;
CREATE TRIGGER cms_post_social_updated_at
  BEFORE UPDATE ON tbrain_landing.cms_post_social
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON tbrain_landing.cms_post_social TO authenticated;
GRANT ALL ON tbrain_landing.cms_post_social TO service_role;

COMMIT;
