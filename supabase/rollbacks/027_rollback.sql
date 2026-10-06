BEGIN;
UPDATE tbrain_landing.cms_topic_ideas SET post_type = NULL WHERE post_type IN ('deep_dive', 'synthesis');
ALTER TABLE tbrain_landing.cms_topic_ideas DROP CONSTRAINT IF EXISTS cms_topic_ideas_post_type_check;
ALTER TABLE tbrain_landing.cms_topic_ideas
  ADD CONSTRAINT cms_topic_ideas_post_type_check
  CHECK (post_type IS NULL OR post_type IN ('news_hook', 'field_story', 'trend_pov', 'buyer_guide', 'proof'));
COMMIT;
