import type { CmsPost } from "@/lib/admin/types";
import { PREVIEW_POSTS } from "./posts";

/**
 * Blog posts under review, shown on staging before they exist in the CMS.
 *
 * Staging is a Vercel preview with no CMS database, so the real post page renders
 * these from a copy in `posts.ts` instead. Never on production: the switch is
 * decided in `next.config.ts` with the same fail-closed rule as hand pose.
 */
export const BLOG_PREVIEW_ON = process.env.BLOG_PREVIEW_ON === "1";

export function previewPost(slug: string): CmsPost | null {
  if (!BLOG_PREVIEW_ON) return null;
  return PREVIEW_POSTS.find((p) => p.slug === slug) ?? null;
}

export function previewPosts(): CmsPost[] {
  return BLOG_PREVIEW_ON ? PREVIEW_POSTS : [];
}
