import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { getPosts } from "@/lib/api";

export const runtime = "nodejs";

/**
 * Content sync cron job.
 * Pulls latest posts from WordPress and caches them in cms_posts table.
 *
 * Trigger via:
 *   - External cron: GET /api/cron/content-sync?secret=<CRON_SECRET>
 *   - Claude Code /schedule agent
 *
 * Protection: requires CRON_SECRET env var to match query param.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expected = process.env.CRON_SECRET;

  if (expected && secret !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const db = supabaseAdmin();
  let synced = 0;

  try {
    // Fetch latest WordPress posts
    const { edges } = await getPosts({ first: 50 });

    for (const edge of edges) {
      const node = edge.node as Record<string, unknown>;
      const slug = `wp-${node.slug as string}`;
      const title = node.title as string;
      const excerpt = ((node.excerpt as string) || "").replace(/<[^>]*>/g, "");
      const date = node.date as string;
      const featuredImage = node.featuredImage as {
        node?: { sourceUrl?: string };
      } | null;
      const coverUrl = featuredImage?.node?.sourceUrl ?? null;

      const categories = node.categories as {
        edges: { node: { name: string; slug: string } }[];
      } | null;
      const category = categories?.edges?.[0]?.node?.name ?? null;

      // Upsert — only update if WordPress has newer data
      const { error } = await db.from("cms_posts").upsert(
        {
          slug,
          title,
          excerpt,
          content_md: null, // WordPress content stays on WordPress
          cover_image_url: coverUrl,
          category,
          status: "published",
          published_at: date,
          author_name: "WordPress",
          seo_title: title,
          seo_description: excerpt.slice(0, 160),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slug" }
      );

      if (!error) synced++;
    }
  } catch (err) {
    console.error("[cron] Content sync failed:", err);
    return NextResponse.json(
      { error: "sync_failed", message: String(err) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    synced,
    timestamp: new Date().toISOString(),
  });
}
