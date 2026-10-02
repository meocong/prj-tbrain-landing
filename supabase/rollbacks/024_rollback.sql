-- Rollback for 024_agent_requests.sql: drops the agent queue and restores the
-- 023 review guard (agent-reviewer check only, no publish-permission check).

BEGIN;

DROP FUNCTION IF EXISTS tbrain_landing.claim_agent_request();
DROP TRIGGER IF EXISTS cms_agent_requests_updated_at ON tbrain_landing.cms_agent_requests;
DROP TABLE IF EXISTS tbrain_landing.cms_agent_requests;

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

COMMIT;
