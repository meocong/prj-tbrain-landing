import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getPosts } from "@/lib/api";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import Link from "next/link";
import type { CmsPost } from "@/lib/admin/types";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on AI training data, RLHF, evaluation, robotics, and building better AI from the Tbrain team.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function decodeEntities(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

// Fallback images for WordPress posts that lack featuredImage
const WP_FALLBACK_IMAGES: Record<string, string> = {
  "tech-terms-tuesday-lets-talk-about-small-language-models-slms": "/images/blog-wp-slm.jpg",
  "are-we-really-about-to-run-out-of-data-for-ai": "/images/blog-wp-data-running-out.jpg",
  "behind-every-ai-breakthrough-lies-a-data-secret": "/images/blog-wp-breakthrough.jpg",
};

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  image: string;
  category: string | null;
  source: "cms" | "wordpress";
  readTime?: string;
};

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

export default async function BlogPage() {
  let posts: BlogPost[] = [];

  // 1. CMS posts (self-authored)
  try {
    const db = supabaseAdmin();
    const { data: cmsPosts } = await db
      .from("cms_posts")
      .select("*")
      .eq("status", "published")
      .not("slug", "like", "wp-%")
      .order("published_at", { ascending: false })
      .limit(30);

    if (cmsPosts) {
      posts.push(
        ...cmsPosts.map((p: CmsPost) => ({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || (p.content_md?.slice(0, 160).replace(/[#*_\[\]]/g, "") + "…") || "",
          date: p.published_at || p.created_at,
          image: p.cover_image_url || "/images/blog-rlhf.jpg",
          category: p.category,
          source: "cms" as const,
          readTime: p.content_md ? estimateReadTime(p.content_md) : "5 min read",
        }))
      );
    }
  } catch {
    // DB unavailable
  }

  // 2. WordPress posts
  try {
    const { edges } = await getPosts({ first: 20 });
    posts.push(
      ...edges.map((e: { node: Record<string, unknown> }) => {
        const node = e.node;
        const slug = node.slug as string;
        const rawExcerpt = decodeEntities((node.excerpt as string) || "");
        const categories = node.categories as {
          edges: { node: { name: string } }[];
        } | null;
        const catName = categories?.edges?.[0]?.node?.name ?? null;
        const wpImage = (node.featuredImage as { node?: { sourceUrl?: string } } | null)?.node?.sourceUrl;

        return {
          title: decodeEntities((node.title as string) || ""),
          slug,
          excerpt: rawExcerpt.length > 160 ? rawExcerpt.slice(0, 160) + "…" : rawExcerpt,
          date: node.date as string,
          image: wpImage || WP_FALLBACK_IMAGES[slug] || "/images/blog-rlhf.jpg",
          category: catName && catName.toLowerCase() !== "uncategorized" ? catName : null,
          source: "wordpress" as const,
          readTime: "3 min read",
        };
      })
    );
  } catch {
    // WordPress unavailable
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const featured = posts[0];
  const rest = posts.slice(1);

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
              Insights on AI training data, robotics, evaluation, and building better AI.
            </p>
          </div>

          {/* Featured post — large, Medium-style */}
          {featured && (
            <Link
              href={featured.source === "cms" ? `/blog/${featured.slug}` : `/news/${featured.slug}`}
              className="mx-auto mt-16 block max-w-4xl group"
            >
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={featured.image}
                  alt={featured.title}
                  className="h-[400px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="mt-6">
                <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
                  {featured.category && (
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600">
                      {featured.category}
                    </span>
                  )}
                  <span>{new Date(featured.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  <span>{featured.readTime}</span>
                </div>
                <h2
                  className="mt-3 text-2xl font-semibold leading-tight md:text-3xl group-hover:text-[#6C3CF4] transition-colors"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                >
                  {featured.title}
                </h2>
                <p className="mt-3 text-base leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
                  {featured.excerpt}
                </p>
              </div>
            </Link>
          )}

          {/* Divider */}
          <div className="mx-auto my-16 max-w-4xl border-t border-gray-200" />

          {/* Rest of posts — 2 column grid */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={post.source === "cms" ? `/blog/${post.slug}` : `/news/${post.slug}`}
                className="group"
              >
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {post.category && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                        {post.category}
                      </span>
                    )}
                    <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3
                    className="mt-2 text-lg font-semibold leading-snug line-clamp-2 group-hover:text-[#6C3CF4] transition-colors"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                  >
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm line-clamp-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {posts.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>No posts yet.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
