import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import Link from "next/link";
import Image from "next/image";
import type { CmsPost } from "@/lib/admin/types";
import { Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on AI training data, robotics, evaluation, and building better AI from the Tbrain team.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog — Tbrain",
    description:
      "Field notes on training data quality, RLHF, evaluation, and the operational side of agentic AI.",
    url: "/blog",
    type: "website",
  },
};

// ISR: regenerate the blog index every 5 minutes so newly published posts
// appear quickly without paying for force-dynamic on every request.
export const revalidate = 300;

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  image: string;
  category: string | null;
  readTime: string;
};

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

const POSTS_PER_PAGE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const currentPage = Math.max(1, Number(sp.page) || 1);
  let posts: BlogPost[] = [];

  try {
    const db = supabaseAdmin();
    const { data: cmsPosts } = await db
      .from("cms_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(60);

    if (cmsPosts) {
      posts = cmsPosts.map((p: CmsPost) => ({
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt || (p.content_md?.slice(0, 200).replace(/[#*_\[\]]/g, "") + "…") || "",
        date: p.published_at || p.created_at,
        image: p.cover_image_url || "/images/blog-rlhf.jpg",
        category: p.category,
        readTime: p.content_md ? estimateReadTime(p.content_md) : "5 min read",
      }));
    }
  } catch { /* DB unavailable */ }

  const totalPosts = posts.length;
  const totalPages = Math.ceil((totalPosts - 1) / POSTS_PER_PAGE); // -1 for featured
  const featured = posts[0];
  const allRest = posts.slice(1);
  const rest = allRest.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  return (
    <div>
      <Header />
      <main className="pb-32 pt-32">
        <div className="container mx-auto max-w-6xl px-4">
          {/* Header */}
          <h1
            className="text-4xl font-semibold tracking-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Blog
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed md:text-xl" style={{ color: "var(--text-secondary)" }}>
            Insights on AI training data, robotics, evaluation, and building better AI.
          </p>

          <div className="mt-12 h-px" style={{ background: "var(--border-subtle)" }} />

          {/* Featured post */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              className="group mt-12 block"
            >
              <div className="relative aspect-[2/1] overflow-hidden rounded-xl">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="mt-8">
                <div className="flex items-center gap-3 text-sm" style={{ color: "#6b7280" }}>
                  {featured.category && (
                    <span className="font-medium text-[#6C3CF4]">{featured.category}</span>
                  )}
                  <span>
                    {new Date(featured.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                </div>
                <h2
                  className="mt-3 text-[28px] font-bold leading-tight tracking-tight group-hover:text-[#6C3CF4] transition-colors duration-300 md:text-[32px]"
                  style={{ fontFamily: "var(--font-heading)", color: "#0e1b2e", letterSpacing: "-0.02em" }}
                >
                  {featured.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed" style={{ color: "#6b7280" }}>
                  {featured.excerpt}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#6C3CF4] group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          )}

          <div className="mt-14 h-px bg-gray-200" />

          {/* Post list — single column, generous spacing (Medium-style) */}
          <div className="mt-10 space-y-12">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group flex gap-6 md:gap-8"
              >
                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#6b7280" }}>
                    {post.category && (
                      <span className="font-medium text-[#6C3CF4]">{post.category}</span>
                    )}
                    <span>
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h3
                    className="mt-2 text-xl font-bold leading-snug tracking-tight group-hover:text-[#6C3CF4] transition-colors duration-300"
                    style={{ fontFamily: "var(--font-heading)", color: "#0e1b2e", letterSpacing: "-0.01em" }}
                  >
                    {post.title}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed line-clamp-2" style={{ color: "#6b7280" }}>
                    {post.excerpt}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-sm" style={{ color: "#9ca3af" }}>
                    <Clock className="h-3.5 w-3.5" />
                    {post.readTime}
                  </div>
                </div>
                {/* Image */}
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg md:h-32 md:w-44">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: "#6b7280" }}
                >
                  ← Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-[#6C3CF4] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {currentPage < totalPages && (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100"
                  style={{ color: "#6b7280" }}
                >
                  Next →
                </Link>
              )}
            </div>
          )}

          <p className="mt-6 text-center text-xs" style={{ color: "#9ca3af" }}>
            {totalPosts} articles
          </p>

          {posts.length === 0 && (
            <div className="mt-16 text-center">
              <p className="text-lg" style={{ color: "#9ca3af" }}>No posts yet.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
