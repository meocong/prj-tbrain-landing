import { z } from "zod";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { countWords, htmlToPlainText, sanitizeImageUrl, sanitizePostHtml, slugify } from "./sanitize";

/** Columns the agent may read back. Excludes view counters and internals. */
export const AGENT_POST_COLUMNS =
  "id, slug, title, excerpt, content_html, cover_image_url, og_image_url, category, tags, author_name, status, published_at, seo_title, seo_description, word_count, version, source, reviewed_at, agent_meta, created_at, updated_at";

const source = z.object({
  url: z.string().url().max(2000),
  title: z.string().max(300).optional(),
  publisher: z.string().max(200).optional(),
  accessed_at: z.string().max(40).optional(),
});

// Best-effort: social cards can't show SVG, and our charts are SVG.
const rasterUrl = z
  .string()
  .max(2000)
  .refine((u) => !/\.svg(\?|#|$)/i.test(u), "cover/og image must be PNG/JPEG/WebP, not an SVG chart; use a source figure or library image");

export const draftInput = z.object({
  title: z.string().trim().min(10).max(160),
  slug: z.string().trim().max(80).optional(),
  excerpt: z.string().trim().max(400).optional(),
  content_html: z.string().min(200).max(200_000),
  cover_image_url: rasterUrl.optional().nullable(),
  og_image_url: rasterUrl.optional().nullable(),
  category: z.string().trim().max(60).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(12).optional(),
  author_name: z.string().trim().max(120).optional().nullable(),
  seo_title: z.string().trim().max(60).optional().nullable(),
  seo_description: z.string().trim().max(160).optional().nullable(),
  // Research trail shown to the reviewer: sources, rubric scores, topic, flags.
  agent_meta: z
    .object({
      topic: z.string().max(500).optional(),
      angle: z.string().max(1000).optional(),
      target_keyword: z.string().max(120).optional(),
      sources: z.array(source).max(40).optional(),
      rubric: z.record(z.string(), z.number().min(0).max(5)).optional(),
      factcheck_flags: z.array(z.string().max(500)).max(30).optional(),
      notes: z.string().max(4000).optional(),
      model: z.string().max(80).optional(),
    })
    .passthrough()
    .optional(),
});

export const draftPatch = draftInput.partial();

export type DraftInput = z.infer<typeof draftInput>;

/** Map validated agent input to cms_posts columns (sanitized). */
export function toRow(input: Partial<DraftInput>) {
  const row: Record<string, unknown> = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = slugify(input.slug);
  if (input.excerpt !== undefined) row.excerpt = input.excerpt || null;
  if (input.content_html !== undefined) {
    const html = sanitizePostHtml(input.content_html);
    const text = htmlToPlainText(html);
    row.content_html = html;
    row.content_md = text;
    row.word_count = countWords(text);
  }
  if (input.cover_image_url !== undefined) row.cover_image_url = sanitizeImageUrl(input.cover_image_url);
  if (input.og_image_url !== undefined) row.og_image_url = sanitizeImageUrl(input.og_image_url);
  if (input.category !== undefined) row.category = input.category || null;
  if (input.tags !== undefined) row.tags = input.tags.length ? input.tags : null;
  if (input.author_name !== undefined) row.author_name = input.author_name || null;
  if (input.seo_title !== undefined) row.seo_title = input.seo_title || null;
  if (input.seo_description !== undefined) row.seo_description = input.seo_description || null;
  if (input.agent_meta !== undefined) row.agent_meta = input.agent_meta;
  return row;
}

/** First free slug: base, base-2, base-3 ... */
export async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const db = supabaseAdmin();
  const root = slugify(base) || `post-${Date.now()}`;
  const { data } = await db.from("cms_posts").select("id, slug").like("slug", `${root}%`);
  const taken = new Set(
    (data ?? []).filter((r: { id: string }) => r.id !== ignoreId).map((r: { slug: string }) => r.slug),
  );
  if (!taken.has(root)) return root;
  for (let i = 2; i < 100; i++) {
    const candidate = `${root}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${root}-${Date.now()}`;
}

export function zodError(err: z.ZodError) {
  return {
    error: "invalid_input",
    issues: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
  };
}

/**
 * The agent may change a post it wrote, or a human's draft that an admin
 * explicitly handed it via a revise request that is currently running.
 */
export async function agentMayEdit(post: { id: string; source: string; status: string }): Promise<boolean> {
  if (post.source === "agent") return true;
  if (post.status !== "draft") return false;
  const { data } = await supabaseAdmin()
    .from("cms_agent_requests")
    .select("id")
    .eq("type", "revise")
    .eq("post_id", post.id)
    .eq("status", "running")
    .limit(1);
  return Boolean(data?.length);
}
