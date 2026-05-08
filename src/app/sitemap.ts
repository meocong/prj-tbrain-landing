import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export const revalidate = 3600; // Refresh hourly so new blog posts/case studies surface

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
  const now = new Date();

  // Static routes — keep priority + frequency hints aligned with content cadence.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/team`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/platform`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/casestudy`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/data/terminal-bench`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/data/physical-ai`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic — best-effort. If DB unreachable just emit static routes.
  let dynamicRoutes: MetadataRoute.Sitemap = [];
  try {
    const db = supabaseAdmin();
    const [posts, caseStudies] = await Promise.all([
      db
        .from("cms_posts")
        .select("slug, updated_at")
        .eq("status", "published")
        .order("updated_at", { ascending: false }),
      db
        .from("case_studies")
        .select("slug, updated_at")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
    ]);

    dynamicRoutes = [
      ...((posts.data ?? []) as Array<{ slug: string; updated_at: string }>).map((p) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: new Date(p.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...((caseStudies.data ?? []) as Array<{ slug: string; updated_at: string }>).map((c) => ({
        url: `${baseUrl}/casestudy/${c.slug}`,
        lastModified: new Date(c.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch (err) {
    console.error("[sitemap] dynamic routes lookup failed:", err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
