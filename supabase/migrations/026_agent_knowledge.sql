-- ──────────────────────────────────────────────────────────────────────────
-- 026_agent_knowledge.sql
--
-- 1. cms_agent_knowledge: what the content agent may draw on beyond public
--    sources — field stories, Tbrain facts, uploaded documents (text is
--    extracted at upload) and the image library (each image with a written
--    description of what it shows). Editors add items as drafts; only someone
--    with content.publish (or approvals.approve) can approve one, and the agent
--    API only ever returns approved items.
-- 2. Outline approval for draft jobs: the agent researches and proposes an
--    outline, the job waits in `awaiting_approval`, and a human approves it
--    (admin or Telegram) before the full draft is written.
-- 3. cms_topic_ideas.post_type / funnel: the scout labels each idea with the
--    kind of post it should become.
--
-- Rollback: supabase/rollbacks/026_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Knowledge ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tbrain_landing.cms_agent_knowledge (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind              text NOT NULL CHECK (kind IN ('story', 'fact', 'doc', 'image')),
  title             text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  body              text NOT NULL DEFAULT '' CHECK (char_length(body) <= 20000),
  file_path         text,           -- private GCS object (agent-knowledge/...) for docs
  file_name         text,
  file_text         text CHECK (char_length(file_text) <= 200000),
  image_url         text,           -- /images/... or /api/asset/cms/...
  image_description text CHECK (char_length(image_description) <= 1000),
  data_line         text,
  tags              text[] NOT NULL DEFAULT '{}',
  status            text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'archived')),
  created_by        uuid REFERENCES tbrain_landing.admin_users(id),
  reviewed_by       uuid REFERENCES tbrain_landing.admin_users(id),
  reviewed_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CHECK (kind <> 'image' OR (image_url IS NOT NULL AND char_length(coalesce(image_description, '')) >= 20)),
  CHECK (image_url IS NULL OR (image_url ~ '^(/images/|/samples/posters/|/api/asset/cms/)[A-Za-z0-9_./-]+$'
                               AND position('..' in image_url) = 0))
);

CREATE INDEX IF NOT EXISTS cms_agent_knowledge_status_idx
  ON tbrain_landing.cms_agent_knowledge (status, kind, updated_at DESC);

ALTER TABLE tbrain_landing.cms_agent_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cms_agent_knowledge_select ON tbrain_landing.cms_agent_knowledge;
CREATE POLICY cms_agent_knowledge_select ON tbrain_landing.cms_agent_knowledge
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

DROP POLICY IF EXISTS cms_agent_knowledge_insert ON tbrain_landing.cms_agent_knowledge;
CREATE POLICY cms_agent_knowledge_insert ON tbrain_landing.cms_agent_knowledge
  FOR INSERT TO authenticated
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

DROP POLICY IF EXISTS cms_agent_knowledge_update ON tbrain_landing.cms_agent_knowledge;
CREATE POLICY cms_agent_knowledge_update ON tbrain_landing.cms_agent_knowledge
  FOR UPDATE TO authenticated
  USING (tbrain_landing.admin_has_permission('content.edit'))
  WITH CHECK (tbrain_landing.admin_has_permission('content.edit'));

-- Approval is a reviewer's call: only content.publish / approvals.approve may
-- set `approved`, and an editor changing an approved item sends it back to
-- draft. Provenance columns are always set here, never by the client.
CREATE OR REPLACE FUNCTION tbrain_landing.cms_agent_knowledge_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
DECLARE
  v_admin uuid := tbrain_landing.current_admin_id();
  v_reviewer boolean := v_admin IS NULL  -- service_role (seeding, scripts)
    OR tbrain_landing.admin_has_permission('content.publish')
    OR tbrain_landing.admin_has_permission('approvals.approve');
  v_changed boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.created_by := COALESCE(v_admin, NEW.created_by);
    v_changed := true;
  ELSE
    NEW.created_by := OLD.created_by;
    v_changed := (NEW.title, NEW.body, NEW.file_text, NEW.image_url, NEW.image_description, NEW.kind)
      IS DISTINCT FROM (OLD.title, OLD.body, OLD.file_text, OLD.image_url, OLD.image_description, OLD.kind);
  END IF;

  IF NEW.status = 'approved' AND NOT v_reviewer THEN
    IF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND v_changed THEN
      NEW.status := 'draft';          -- edited by a non-reviewer: needs review again
    ELSIF TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved' THEN
      RAISE EXCEPTION 'approving knowledge needs the content.publish permission'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
  END IF;

  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved' OR v_changed) THEN
    NEW.reviewed_by := COALESCE(v_admin, NEW.reviewed_by);
    NEW.reviewed_at := now();
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.reviewed_by := CASE WHEN NEW.status = 'approved' THEN OLD.reviewed_by END;
    NEW.reviewed_at := CASE WHEN NEW.status = 'approved' THEN OLD.reviewed_at END;
  ELSE
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_agent_knowledge_guard ON tbrain_landing.cms_agent_knowledge;
CREATE TRIGGER cms_agent_knowledge_guard
  BEFORE INSERT OR UPDATE ON tbrain_landing.cms_agent_knowledge
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.cms_agent_knowledge_guard();

DROP TRIGGER IF EXISTS cms_agent_knowledge_updated_at ON tbrain_landing.cms_agent_knowledge;
CREATE TRIGGER cms_agent_knowledge_updated_at
  BEFORE UPDATE ON tbrain_landing.cms_agent_knowledge
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

REVOKE ALL ON tbrain_landing.cms_agent_knowledge FROM authenticated;
GRANT SELECT ON tbrain_landing.cms_agent_knowledge TO authenticated;
-- file_path/file_name/file_text are written by the server upload route only.
GRANT INSERT (kind, title, body, image_url, image_description, data_line, tags, status)
  ON tbrain_landing.cms_agent_knowledge TO authenticated;
GRANT UPDATE (title, body, image_url, image_description, data_line, tags, status)
  ON tbrain_landing.cms_agent_knowledge TO authenticated;
GRANT ALL ON tbrain_landing.cms_agent_knowledge TO service_role;

-- 2. Outline approval ------------------------------------------------------------
ALTER TABLE tbrain_landing.cms_agent_requests DROP CONSTRAINT IF EXISTS cms_agent_requests_status_check;
ALTER TABLE tbrain_landing.cms_agent_requests
  ADD CONSTRAINT cms_agent_requests_status_check
  CHECK (status IN ('queued', 'running', 'awaiting_approval', 'done', 'failed', 'cancelled'));

DROP INDEX IF EXISTS tbrain_landing.cms_agent_requests_active_topic;
CREATE UNIQUE INDEX cms_agent_requests_active_topic
  ON tbrain_landing.cms_agent_requests (topic_id)
  WHERE topic_id IS NOT NULL AND status IN ('queued', 'running', 'awaiting_approval');

CREATE OR REPLACE FUNCTION tbrain_landing.cms_agent_requests_sync_topic()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
BEGIN
  IF NEW.topic_id IS NULL OR NEW.type <> 'draft' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('queued', 'running', 'awaiting_approval') THEN
      UPDATE cms_topic_ideas SET status = 'queued' WHERE id = NEW.topic_id AND status <> 'drafted';
    ELSIF NEW.status = 'done' THEN
      UPDATE cms_topic_ideas
         SET status = 'drafted',
             -- Only link a post that exists; a bad id must not fail the job update.
             post_id = COALESCE(
               (SELECT p.id FROM cms_posts p
                 WHERE p.id::text = NEW.result->>'post_id'),
               post_id)
       WHERE id = NEW.topic_id;
    ELSE -- failed / cancelled: the idea is available again
      UPDATE cms_topic_ideas SET status = 'new'
       WHERE id = NEW.topic_id AND status = 'queued'
         AND NOT EXISTS (SELECT 1 FROM cms_agent_requests r
                          WHERE r.topic_id = NEW.topic_id AND r.id <> NEW.id
                            AND r.status IN ('queued', 'running', 'awaiting_approval'));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- A reviewer acts on a proposed outline: approve (write the full draft),
-- revise (propose a new outline from these notes) or cancel the job.
-- `p_by` labels a chat reviewer when called by the agent API (service_role);
-- signed-in admins are always recorded as themselves.
CREATE OR REPLACE FUNCTION tbrain_landing.review_agent_outline(
  p_id uuid, p_action text, p_notes text DEFAULT NULL, p_by text DEFAULT NULL)
RETURNS tbrain_landing.cms_agent_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
DECLARE
  v_admin uuid := tbrain_landing.current_admin_id();
  v_by text;
  v_row cms_agent_requests;
BEGIN
  IF v_admin IS NULL AND coalesce(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'not allowed' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_admin IS NOT NULL AND NOT tbrain_landing.admin_has_permission('content.edit') THEN
    RAISE EXCEPTION 'reviewing an outline needs content.edit' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF p_action NOT IN ('approve', 'revise', 'cancel') THEN
    RAISE EXCEPTION 'action must be approve, revise or cancel' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF p_action = 'revise' AND coalesce(btrim(p_notes), '') = '' THEN
    RAISE EXCEPTION 'say what to change in the outline' USING ERRCODE = 'invalid_parameter_value';
  END IF;

  IF v_admin IS NOT NULL THEN
    SELECT coalesce(full_name, email) INTO v_by FROM admin_users WHERE id = v_admin;
  ELSE
    v_by := left(coalesce(nullif(btrim(p_by), ''), 'Telegram'), 120);
  END IF;

  UPDATE cms_agent_requests r
     SET status = CASE WHEN p_action = 'cancel' THEN 'cancelled' ELSE 'queued' END,
         finished_at = CASE WHEN p_action = 'cancel' THEN now() END,
         brief = r.brief || jsonb_build_object(
           'outline_approved', p_action = 'approve',
           'outline_feedback', CASE WHEN p_action = 'cancel' THEN NULL ELSE left(p_notes, 4000) END,
           'outline_reviewed_by', v_by),
         result = r.result || jsonb_build_object('outline_reviewed_at', now())
   WHERE r.id = p_id AND r.status = 'awaiting_approval'
  RETURNING r.* INTO v_row;

  IF v_row.id IS NULL THEN
    RAISE EXCEPTION 'this job is not waiting for outline approval' USING ERRCODE = 'check_violation';
  END IF;
  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION tbrain_landing.review_agent_outline(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION tbrain_landing.review_agent_outline(uuid, text, text, text) TO authenticated, service_role;

-- 3. Topic labels -----------------------------------------------------------------
ALTER TABLE tbrain_landing.cms_topic_ideas
  ADD COLUMN IF NOT EXISTS post_type text,
  ADD COLUMN IF NOT EXISTS funnel text;

DO $$ BEGIN
  ALTER TABLE tbrain_landing.cms_topic_ideas
    ADD CONSTRAINT cms_topic_ideas_post_type_check
    CHECK (post_type IS NULL OR post_type IN ('news_hook', 'field_story', 'trend_pov', 'buyer_guide', 'proof')),
    ADD CONSTRAINT cms_topic_ideas_funnel_check
    CHECK (funnel IS NULL OR funnel IN ('top', 'middle', 'bottom'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
