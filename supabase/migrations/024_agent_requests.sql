-- ──────────────────────────────────────────────────────────────────────────
-- 024_agent_requests.sql
--
-- 1. Publish permission in the database. Admin writes go straight from the
--    browser through RLS, which only checks content.edit, so any editor could
--    publish. The review guard now also requires content.publish or
--    approvals.approve for a signed-in admin to move a post to 'published'.
--    service_role (scripts, agent API) is unaffected; agent posts still need
--    a human reviewer (023).
-- 2. cms_agent_requests: work queue the admin editor uses to hand tasks to the
--    content agent (write a draft, revise a post, scout topics). The agent
--    polls it and claims jobs atomically via claim_agent_request().
--
-- Rollback: 024_rollback.sql
-- ──────────────────────────────────────────────────────────────────────────

BEGIN;

-- 1. Review guard + publish permission ---------------------------------------
CREATE OR REPLACE FUNCTION tbrain_landing.cms_posts_review_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
DECLARE
  v_admin uuid := tbrain_landing.current_admin_id();
BEGIN
  IF NEW.status = 'published'
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    IF v_admin IS NOT NULL
       AND NOT (tbrain_landing.admin_has_permission('content.publish')
                OR tbrain_landing.admin_has_permission('approvals.approve')) THEN
      RAISE EXCEPTION 'publishing needs the content.publish permission — submit for review instead'
        USING ERRCODE = 'insufficient_privilege';
    END IF;
    -- A signed-in publisher is always the recorded reviewer (no attributing it
    -- to someone else); only service_role writes may set it explicitly.
    NEW.reviewed_by := COALESCE(v_admin, NEW.reviewed_by);
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

-- 2. Agent work queue ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tbrain_landing.cms_agent_requests (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('draft', 'revise', 'scout')),
  post_id      uuid REFERENCES tbrain_landing.cms_posts(id) ON DELETE CASCADE,
  brief        jsonb NOT NULL DEFAULT '{}'::jsonb,
  status       text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'done', 'failed', 'cancelled')),
  result       jsonb NOT NULL DEFAULT '{}'::jsonb,
  attempts     int NOT NULL DEFAULT 0,
  requested_by uuid REFERENCES tbrain_landing.admin_users(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  started_at   timestamptz,
  finished_at  timestamptz,
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CHECK (type <> 'revise' OR post_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS cms_agent_requests_status_idx
  ON tbrain_landing.cms_agent_requests (status, created_at);
CREATE INDEX IF NOT EXISTS cms_agent_requests_post_idx
  ON tbrain_landing.cms_agent_requests (post_id, created_at DESC);

ALTER TABLE tbrain_landing.cms_agent_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cms_agent_requests_select ON tbrain_landing.cms_agent_requests;
CREATE POLICY cms_agent_requests_select ON tbrain_landing.cms_agent_requests
  FOR SELECT TO authenticated
  USING (tbrain_landing.admin_has_permission('content.view'));

-- Admins may only queue new work as themselves; status/result are the agent's.
DROP POLICY IF EXISTS cms_agent_requests_insert ON tbrain_landing.cms_agent_requests;
CREATE POLICY cms_agent_requests_insert ON tbrain_landing.cms_agent_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    tbrain_landing.admin_has_permission('content.edit')
    AND status = 'queued'
    AND requested_by = tbrain_landing.current_admin_id()
  );

-- ...and cancel their own work that hasn't started. Column grants below limit
-- admin updates to `status`, so a queued brief can't be rewritten.
DROP POLICY IF EXISTS cms_agent_requests_update ON tbrain_landing.cms_agent_requests;
CREATE POLICY cms_agent_requests_update ON tbrain_landing.cms_agent_requests
  FOR UPDATE TO authenticated
  USING (
    tbrain_landing.admin_has_permission('content.edit')
    AND status = 'queued'
    AND requested_by = tbrain_landing.current_admin_id()
  )
  WITH CHECK (status = 'cancelled' AND requested_by = tbrain_landing.current_admin_id());

DROP TRIGGER IF EXISTS cms_agent_requests_updated_at ON tbrain_landing.cms_agent_requests;
CREATE TRIGGER cms_agent_requests_updated_at
  BEFORE UPDATE ON tbrain_landing.cms_agent_requests
  FOR EACH ROW EXECUTE FUNCTION tbrain_landing.touch_updated_at();

REVOKE ALL ON tbrain_landing.cms_agent_requests FROM authenticated;
GRANT SELECT, INSERT ON tbrain_landing.cms_agent_requests TO authenticated;
GRANT UPDATE (status) ON tbrain_landing.cms_agent_requests TO authenticated;
GRANT ALL ON tbrain_landing.cms_agent_requests TO service_role;

-- Claim the oldest queued job (or one whose run went stale) for the agent.
-- SKIP LOCKED makes concurrent pollers safe; three failed attempts park it.
CREATE OR REPLACE FUNCTION tbrain_landing.claim_agent_request()
RETURNS SETOF tbrain_landing.cms_agent_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = tbrain_landing, public
AS $$
BEGIN
  UPDATE tbrain_landing.cms_agent_requests
     SET status = 'failed', finished_at = now(),
         result = result || '{"message":"gave up after 3 attempts"}'::jsonb
   WHERE status = 'running' AND started_at < now() - interval '90 minutes' AND attempts >= 3;

  RETURN QUERY
  UPDATE tbrain_landing.cms_agent_requests r
     SET status = 'running', started_at = now(), attempts = r.attempts + 1
   WHERE r.id = (
     SELECT id FROM tbrain_landing.cms_agent_requests
      WHERE status = 'queued'
         OR (status = 'running' AND started_at < now() - interval '90 minutes')
      ORDER BY created_at
      LIMIT 1
      FOR UPDATE SKIP LOCKED
   )
  RETURNING r.*;
END;
$$;

REVOKE ALL ON FUNCTION tbrain_landing.claim_agent_request() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION tbrain_landing.claim_agent_request() TO service_role;

COMMIT;
