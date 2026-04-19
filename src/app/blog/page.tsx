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
    "Insights on AI training data, RLHF, evaluation, and building better AI from the Tbrain team.",
};

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function decodeEntities(text: string): string {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/&hellip;/g, "…")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .trim();
}

const GRADIENTS = [
  "from-purple-500 to-blue-500",
  "from-blue-500 to-cyan-500",
  "from-indigo-500 to-purple-500",
  "from-violet-500 to-fuchsia-500",
  "from-blue-600 to-indigo-600",
];

export default async function BlogPage() {
  type BlogPost = {
    title: string;
    slug: string;
    excerpt: string;
    date: string;
    image?: string;
    category: string | null;
    source: "cms" | "wordpress";
  };

  let posts: BlogPost[] = [];

  // 1. CMS posts (self-authored, not wp-synced)
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
          image: p.cover_image_url || undefined,
          category: p.category,
          source: "cms" as const,
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
        const rawExcerpt = decodeEntities((node.excerpt as string) || "");
        const categories = node.categories as {
          edges: { node: { name: string } }[];
        } | null;
        const catName = categories?.edges?.[0]?.node?.name ?? null;

        return {
          title: decodeEntities((node.title as string) || ""),
          slug: node.slug as string,
          excerpt: rawExcerpt.length > 160 ? rawExcerpt.slice(0, 160) + "…" : rawExcerpt,
          date: node.date as string,
          image: (node.featuredImage as { node?: { sourceUrl?: string } } | null)?.node?.sourceUrl,
          category: catName && catName.toLowerCase() !== "uncategorized" ? catName : null,
          source: "wordpress" as const,
        };
      })
    );
  } catch {
    // WordPress unavailable
  }

  // Sort by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={post.source === "cms" ? `/blog/${post.slug}` : `/news/${post.slug}`}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
              >
                <div className="h-44 overflow-hidden">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} p-6`}>
                      <span className="line-clamp-3 text-center text-lg font-semibold text-white/90">
                        {post.title}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {post.category && (
                      <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-600">
                        {post.category}
                      </span>
                    )}
                    <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold leading-snug line-clamp-2" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
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
              <p className="text-lg" style={{ color: "var(--text-muted)" }}>No posts yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
