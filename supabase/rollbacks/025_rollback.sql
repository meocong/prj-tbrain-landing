-- Rollback for 025_agent_topics.sql
BEGIN;

DROP TRIGGER IF EXISTS cms_agent_requests_sync_topic ON tbrain_landing.cms_agent_requests;
DROP FUNCTION IF EXISTS tbrain_landing.cms_agent_requests_sync_topic();
DROP TRIGGER IF EXISTS cms_agent_requests_validate ON tbrain_landing.cms_agent_requests;
DROP FUNCTION IF EXISTS tbrain_landing.cms_agent_requests_validate();
DROP INDEX IF EXISTS tbrain_landing.cms_agent_requests_active_topic;

DROP POLICY IF EXISTS cms_agent_requests_insert ON tbrain_landing.cms_agent_requests;
CREATE POLICY cms_agent_requests_insert ON tbrain_landing.cms_agent_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    tbrain_landing.admin_has_permission('content.edit')
    AND status = 'queued'
    AND requested_by = tbrain_landing.current_admin_id()
  );

ALTER TABLE tbrain_landing.cms_agent_requests
  DROP CONSTRAINT IF EXISTS cms_agent_requests_via_check,
  DROP COLUMN IF EXISTS requested_by_label,
  DROP COLUMN IF EXISTS via,
  DROP COLUMN IF EXISTS topic_id;

DROP TABLE IF EXISTS tbrain_landing.cms_topic_ideas;

COMMIT;
