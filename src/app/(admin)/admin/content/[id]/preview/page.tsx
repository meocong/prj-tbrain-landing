"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Pencil } from "lucide-react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { BLOG_PROSE_CLASS } from "@/lib/blog-prose";
import type { CmsPost } from "@/lib/admin/types";

/** Read-only render of a post (any status) with the public blog typography. */
export default function PostPreviewPage() {
  const { id } = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("cms_posts").select("*").eq("id", id).single();
      return data as CmsPost | null;
    },
  });

  if (isLoading) return <div className="skeleton h-[600px] w-full" />;
  if (!post) return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Post not found</div>;

  const words = post.word_count || post.content_md?.split(/\s+/).length || 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/approvals" className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="h-4 w-4" /> Approvals
        </Link>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
          {post.source === "agent" && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium" style={{ backgroundColor: "var(--color-brand-50)", color: "var(--color-brand-600)" }}>
              <Bot className="h-3 w-3" /> AI draft
            </span>
          )}
          <span>{post.status}</span>
          <Link href={`/admin/content/${id}`} className="btn-secondary text-xs">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Link>
        </div>
      </div>

      <article className="mx-auto mt-6 max-w-[720px] rounded-2xl bg-white px-6 py-10 md:px-10">
        <div className="text-sm text-[#5f6875]">
          {post.category ? `${post.category} · ` : ""}
          {Math.max(1, Math.ceil(words / 200))} min read · /blog/{post.slug}
        </div>
        <h1 className="mt-3 text-[32px] font-bold leading-[1.2] tracking-tight text-[#0e1b2e] md:text-[42px]" style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}>
          {post.title}
        </h1>
        {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-[#4b5563]">{post.excerpt}</p>}
        {post.author_name && <p className="mt-3 text-sm text-[#6b7280]">By {post.author_name}</p>}
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image_url} alt={post.title} className="mt-8 aspect-[2/1] w-full rounded-2xl object-cover" />
        )}
        <div className={BLOG_PROSE_CLASS} dangerouslySetInnerHTML={{ __html: post.content_html || post.content_md || "" }} />
        {post.tags && post.tags.length > 0 && (
          <p className="mt-10 text-xs text-[#6C3CF4]">{post.tags.map((t) => `#${t}`).join("  ")}</p>
        )}
        <div className="mt-10 rounded-xl bg-[#f8fafc] p-4 text-xs text-[#475569]">
          <p><span className="font-semibold">SEO title:</span> {post.seo_title || post.title} ({(post.seo_title || post.title).length}/60)</p>
          <p className="mt-1"><span className="font-semibold">Meta description:</span> {post.seo_description || post.excerpt || "—"} ({(post.seo_description || post.excerpt || "").length}/155)</p>
        </div>
      </article>
    </div>
  );
}
