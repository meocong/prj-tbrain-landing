-- 028: by_the_numbers — original analysis of public data (HF Hub, arXiv counts).
BEGIN;
ALTER TABLE tbrain_landing.cms_topic_ideas DROP CONSTRAINT IF EXISTS cms_topic_ideas_post_type_check;
ALTER TABLE tbrain_landing.cms_topic_ideas
  ADD CONSTRAINT cms_topic_ideas_post_type_check
  CHECK (post_type IS NULL OR post_type IN (
    'news_hook', 'field_story', 'trend_pov', 'buyer_guide', 'proof', 'deep_dive', 'synthesis', 'by_the_numbers'
  ));
COMMIT;
