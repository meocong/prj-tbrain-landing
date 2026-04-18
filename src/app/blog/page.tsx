import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { getPosts } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import type { CmsPost } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: "Blog",
  description: "Latest insights on AI training data, RLHF, evaluation, and more from the Tbrain team.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1h ISR

export default async function BlogPage() {
  // Fetch from both CMS (self-hosted) and WordPress
  const db = supabaseAdmin();
  const { data: cmsPosts } = await db
    .from("cms_posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(20);

  // WordPress posts
  let wpPosts: { title: string; slug: string; excerpt: string; date: string; image?: string }[] = [];
  try {
    const { edges } = await getPosts({ first: 20 });
    wpPosts = edges.map((e: { node: Record<string, unknown> }) => ({
      title: e.node.title as string,
      slug: e.node.slug as string,
      excerpt: (e.node.excerpt as string)?.replace(/<[^>]*>/g, "") || "",
      date: e.node.date as string,
      image: (e.node.featuredImage as { node?: { sourceUrl?: string } })?.node?.sourceUrl,
    }));
  } catch {
    // WordPress unavailable — show CMS posts only
  }

  // Merge and sort by date
  const allPosts = [
    ...(cmsPosts ?? []).map((p: CmsPost) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      date: p.published_at || p.created_at,
      image: p.cover_image_url,
      source: "cms" as const,
      category: p.category,
    })),
    ...wpPosts.map((p) => ({
      id: `wp-${p.slug}`,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      date: p.date,
      image: p.image,
      source: "wordpress" as const,
      category: null as string | null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <Header />
      <main className="pb-24 pt-32">
        <section className="container mx-auto px-3">
          <div className="text-center">
            <h1 className="text-4xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              <span className="gradient-text">Blog</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#78818f]">
              Insights on AI training data, RLHF, evaluation, and building better AI.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {allPosts.map((post) => (
              <Link
                key={post.id}
                href={post.source === "cms" ? `/blog/${post.slug}` : `/news/${post.slug}`}
                className="glass-card-hover overflow-hidden transition-all"
              >
                {post.image && (
                  <div className="h-48 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={400}
                      height={200}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {post.category && (
                      <span className="badge badge-info">{post.category}</span>
                    )}
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                  <h3
                    className="mt-2 text-lg font-semibold line-clamp-2"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                  >
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="mt-2 text-sm line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {allPosts.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>
                No posts yet. Check back soon!
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
