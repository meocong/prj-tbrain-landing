-- 027: two source-driven post types for the content agent.
--   deep_dive  — one paper/release/dataset taken apart: method, figures, numbers, what it means
--   synthesis  — several sources on one question, compared and remixed into a map
BEGIN;

ALTER TABLE tbrain_landing.cms_topic_ideas
  DROP CONSTRAINT IF EXISTS cms_topic_ideas_post_type_check;
ALTER TABLE tbrain_landing.cms_topic_ideas
  ADD CONSTRAINT cms_topic_ideas_post_type_check
  CHECK (post_type IS NULL OR post_type IN (
    'news_hook', 'field_story', 'trend_pov', 'buyer_guide', 'proof', 'deep_dive', 'synthesis'
  ));

COMMIT;
