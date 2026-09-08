import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const revalidate = 3600;
export const runtime = "nodejs";

type FeedRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  published_at: string | null;
  created_at: string;
  author_name: string | null;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

  let posts: FeedRow[] = [];
  try {
    const db = supabaseAdmin();
    const { data } = await db
      .from("cms_posts")
      .select("slug, title, excerpt, published_at, created_at, author_name")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(50);
    posts = (data ?? []) as FeedRow[];
  } catch (err) {
    console.error("[feed.xml] lookup failed:", err);
  }

  const lastBuildDate = new Date().toUTCString();
  const items = posts
    .map((p) => {
      const date = new Date(p.published_at || p.created_at).toUTCString();
      const link = `${baseUrl}/blog/${p.slug}`;
      const description = p.excerpt ? escapeXml(p.excerpt) : "";
      const author = p.author_name ? escapeXml(p.author_name) : "Tbrain";
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${date}</pubDate>
      <description>${description}</description>
      <dc:creator>${author}</dc:creator>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Tbrain Blog</title>
    <link>${baseUrl}/blog</link>
    <description>Insights on AI training data, evaluation, and frontier model programs from Tbrain.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
