-- Rollback for 026_agent_knowledge.sql
BEGIN;

ALTER TABLE tbrain_landing.cms_topic_ideas
  DROP CONSTRAINT IF EXISTS cms_topic_ideas_post_type_check,
  DROP CONSTRAINT IF EXISTS cms_topic_ideas_funnel_check,
  DROP COLUMN IF EXISTS post_type,
  DROP COLUMN IF EXISTS funnel;

DROP FUNCTION IF EXISTS tbrain_landing.review_agent_outline(uuid, text, text, text);

-- Jobs parked for approval go back to the queue before the status is removed.
UPDATE tbrain_landing.cms_agent_requests SET status = 'queued' WHERE status = 'awaiting_approval';
ALTER TABLE tbrain_landing.cms_agent_requests DROP CONSTRAINT IF EXISTS cms_agent_requests_status_check;
ALTER TABLE tbrain_landing.cms_agent_requests
  ADD CONSTRAINT cms_agent_requests_status_check
  CHECK (status IN ('queued', 'running', 'done', 'failed', 'cancelled'));
DROP INDEX IF EXISTS tbrain_landing.cms_agent_requests_active_topic;
CREATE UNIQUE INDEX cms_agent_requests_active_topic
  ON tbrain_landing.cms_agent_requests (topic_id)
  WHERE topic_id IS NOT NULL AND status IN ('queued', 'running');
-- cms_agent_requests_sync_topic keeps working (it only also matches the removed status).

DROP TABLE IF EXISTS tbrain_landing.cms_agent_knowledge;
DROP FUNCTION IF EXISTS tbrain_landing.cms_agent_knowledge_guard();

COMMIT;
