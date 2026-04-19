-- Add content_html, version, and word_count to cms_posts
-- content_html stores TipTap HTML output (new posts)
-- content_md kept for backward compat (existing markdown posts)

ALTER TABLE tbrain_landing.cms_posts ADD COLUMN IF NOT EXISTS content_html text;
ALTER TABLE tbrain_landing.cms_posts ADD COLUMN IF NOT EXISTS version int NOT NULL DEFAULT 1;
ALTER TABLE tbrain_landing.cms_posts ADD COLUMN IF NOT EXISTS word_count int DEFAULT 0;
