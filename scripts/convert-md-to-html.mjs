import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://supabase.tbrain.ai',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NzQ1OTIzNTIsImV4cCI6MTkzMjI3MjM1Mn0.3fb7St7STdmgGlq_A5yrB1gastcK9WN2R-FEatpDKIU',
  { db: { schema: 'tbrain_landing' } }
);

async function mdToHtml(md) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(result);
}

async function main() {
  // Fetch all posts with content_md but no content_html
  const { data: posts, error } = await supabase
    .from('cms_posts')
    .select('id, slug, content_md')
    .not('content_md', 'is', null)
    .is('content_html', null);

  if (error) { console.error('Fetch error:', error); return; }
  console.log(`Found ${posts.length} posts to convert`);

  for (const post of posts) {
    const html = await mdToHtml(post.content_md);
    const wordCount = post.content_md.split(/\s+/).filter(Boolean).length;

    const { error: updateError } = await supabase
      .from('cms_posts')
      .update({ content_html: html, word_count: wordCount })
      .eq('id', post.id);

    if (updateError) {
      console.error(`Failed ${post.slug}:`, updateError);
    } else {
      console.log(`Converted ${post.slug} (${wordCount} words, ${html.length} chars HTML)`);
    }
  }
  console.log('Done!');
}

main();
