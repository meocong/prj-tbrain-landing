-- Rollback for 023_content_agent.sql

BEGIN;

DROP TRIGGER IF EXISTS cms_post_social_updated_at ON tbrain_landing.cms_post_social;
DROP TABLE IF EXISTS tbrain_landing.cms_post_social;

DROP TRIGGER IF EXISTS cms_posts_review_guard ON tbrain_landing.cms_posts;
DROP FUNCTION IF EXISTS tbrain_landing.cms_posts_review_guard();
DROP TRIGGER IF EXISTS cms_posts_updated_at ON tbrain_landing.cms_posts;
DROP INDEX IF EXISTS tbrain_landing.cms_posts_source_idx;

ALTER TABLE tbrain_landing.cms_posts
  DROP COLUMN IF EXISTS agent_meta,
  DROP COLUMN IF EXISTS reviewed_at,
  DROP COLUMN IF EXISTS reviewed_by,
  DROP COLUMN IF EXISTS ai_assisted,
  DROP COLUMN IF EXISTS source;

COMMIT;
