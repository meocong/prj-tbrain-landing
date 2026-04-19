import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { CmsPost } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = supabaseAdmin();
  const { data: post } = await db
    .from("cms_posts")
    .select("title, seo_title, seo_description, excerpt, og_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || undefined,
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.og_image_url ? [post.og_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = supabaseAdmin();

  const { data: post } = await db
    .from("cms_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<CmsPost>();

  if (!post) notFound();

  // Increment view count (fire-and-forget)
  db.from("cms_posts")
    .update({ view_count: (post.view_count || 0) + 1 })
    .eq("id", post.id)
    .then(() => {});

  const readingTime = Math.max(
    1,
    Math.ceil((post.content_md?.split(/\s+/).length || 0) / 200)
  );

  return (
    <div>
      <Header />
      <main className="pb-24 pt-32">
        <article className="mx-auto max-w-[720px] px-6">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm transition-colors hover:text-[#6C3CF4]"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="mt-6">
            <div className="flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--text-muted)" }}>
              {post.category && (
                <span className="inline-flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  {post.category}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(post.published_at || post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span>{readingTime} min read</span>
            </div>

            <h1
              className="mt-4 text-[32px] font-bold leading-[1.2] tracking-tight md:text-[42px]"
              style={{ fontFamily: "var(--font-heading)", color: "#0e1b2e", letterSpacing: "-0.03em" }}
            >
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                {post.excerpt}
              </p>
            )}

            {post.author_name && (
              <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
                By {post.author_name}
              </p>
            )}
          </header>

          {/* Cover image */}
          {post.cover_image_url && (
            <div className="mt-8 overflow-hidden rounded-2xl">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          {post.content_md && (
            <div className="prose prose-lg mt-12 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-[20px] prose-h3:mt-8 prose-p:text-[18px] prose-p:leading-[1.8] prose-p:text-[#374151] prose-li:text-[18px] prose-li:leading-[1.8] prose-a:text-[#6C3CF4] prose-img:rounded-xl prose-img:my-8 prose-blockquote:border-l-[#6C3CF4] prose-blockquote:text-[#6b7280] prose-blockquote:italic">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content_md}
              </ReactMarkdown>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="badge badge-muted">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>
      <Footer />
    </div>
  );
}
