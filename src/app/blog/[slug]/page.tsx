import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import type { CmsPost } from "@/lib/admin/types";

// ISR: cache rendered post for 5 minutes; admin edits surface within that window.
export const revalidate = 300;

// Pre-render the most-recent published posts at build time so the first hit is
// already cached. Older posts fall back to on-demand ISR.
export async function generateStaticParams() {
  try {
    const db = supabaseAdmin();
    const { data } = await db
      .from("cms_posts")
      .select("slug")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(20);
    return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

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
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.seo_title || post.title,
      description: post.seo_description || post.excerpt || undefined,
      images: post.og_image_url ? [post.og_image_url] : undefined,
      url: `/blog/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
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

  const { data: relatedRaw } = await db
    .from("cms_posts")
    .select("id, slug, title, excerpt, cover_image_url, category, published_at, created_at")
    .eq("status", "published")
    .neq("id", post.id)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(4);
  const related = (relatedRaw ?? []).slice(0, 3);

  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || undefined,
    image: post.cover_image_url ? [post.cover_image_url] : undefined,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: post.author_name
      ? [{ "@type": "Person", name: post.author_name }]
      : [{ "@type": "Organization", name: "Tbrain" }],
    publisher: {
      "@type": "Organization",
      name: "Tbrain",
      logo: { "@type": "ImageObject", url: `${baseUrl}/favicon.ico` },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/blog/${post.slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${baseUrl}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${baseUrl}/blog/${post.slug}` },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
            <div className="relative mt-8 aspect-[2/1] overflow-hidden rounded-2xl">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 900px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Content — render HTML */}
          {(post.content_html || post.content_md) && (
            <div
              className="prose prose-lg mt-12 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-[20px] prose-h3:mt-8 prose-p:text-[18px] prose-p:leading-[1.8] prose-p:text-[#374151] prose-li:text-[18px] prose-li:leading-[1.8] prose-a:text-[#6C3CF4] prose-img:rounded-xl prose-img:my-8 prose-blockquote:border-l-[#6C3CF4] prose-blockquote:text-[#6b7280] prose-blockquote:italic"
              dangerouslySetInnerHTML={{ __html: post.content_html || post.content_md || "" }}
            />
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 rounded-full bg-[#6C3CF4]/10 hover:bg-[#6C3CF4]/15 text-[#6C3CF4] px-3 py-1 text-xs font-semibold tracking-wide transition-colors"
                >
                  <span className="opacity-70">#</span>
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </article>

        {related.length > 0 && (
          <section className="mx-auto max-w-[1128px] px-6 mt-20">
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-[#6C3CF4] mb-2">Keep reading</div>
                <h2 className="text-2xl md:text-3xl font-semibold text-[#0e1b2e] tracking-tight">Related articles</h2>
              </div>
              <Link href="/blog" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#6C3CF4] hover:gap-2 transition-all">
                All articles →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group block rounded-3xl overflow-hidden bg-white shadow hover:shadow-xl transition-all"
                >
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#020617]">
                    {r.cover_image_url ? (
                      <Image
                        src={r.cover_image_url}
                        alt={r.title}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "radial-gradient(ellipse 80% 80% at 30% 30%, rgba(108,60,244,0.7) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 80%, rgba(16,185,129,0.5) 0%, transparent 55%), #020617",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center p-5">
                          <div
                            className="text-white text-base md:text-lg font-semibold tracking-tight leading-snug line-clamp-3 text-center"
                            style={{ fontFamily: "var(--font-heading)" }}
                          >
                            {r.title}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-[#78818f] mb-2">
                      {new Date(r.published_at || r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-[#0e1b2e] leading-snug line-clamp-2 group-hover:text-[#6C3CF4] transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
