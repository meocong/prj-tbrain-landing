"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, ExternalLink, Globe, Clock, FileText, Archive } from "lucide-react";
import Link from "next/link";
import { TipTapEditor } from "@/components/admin/editor/TipTapEditor";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      const { data } = await supabaseAdmin.from("cms_posts").select("*").eq("id", id).single();
      return data;
    },
  });

  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [form, setForm] = useState({
    slug: "",
    excerpt: "",
    coverImageUrl: "",
    category: "",
    tags: "",
    authorName: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      // Prefer content_html, fallback to content_md
      setContentHtml(post.content_html || post.content_md || "");
      setForm({
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        coverImageUrl: post.cover_image_url || "",
        category: post.category || "",
        tags: post.tags ? post.tags.join(", ") : "",
        authorName: post.author_name || "",
        seoTitle: post.seo_title || "",
        seoDescription: post.seo_description || "",
        status: post.status || "draft",
      });
      setWordCount(post.word_count || 0);
    }
  }, [post]);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const saveMutation = useMutation({
    mutationFn: async (newStatus: string | undefined) => {
      const status = newStatus || form.status;
      const { error } = await supabaseAdmin
        .from("cms_posts")
        .update({
          title,
          slug: form.slug,
          excerpt: form.excerpt || null,
          content_html: contentHtml || null,
          cover_image_url: form.coverImageUrl || null,
          category: form.category || null,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
          author_name: form.authorName || null,
          status,
          published_at: status === "published" && !post?.published_at ? new Date().toISOString() : post?.published_at,
          seo_title: form.seoTitle || null,
          seo_description: form.seoDescription || null,
          word_count: wordCount,
          version: (post?.version || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["admin-post", id] });
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin.from("cms_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Deleted");
      router.push("/admin/content");
    },
  });

  if (isLoading) {
    return <div className="space-y-4"><div className="skeleton h-10 w-64" /><div className="skeleton h-[500px] w-full" /></div>;
  }

  if (!post) {
    return <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>Post not found</div>;
  }

  const statusColor = { draft: "#eab308", published: "#22c55e", archived: "#6b7280" }[form.status] || "#6b7280";

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link href="/admin/content" className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        {form.status === "published" && (
          <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
            <ExternalLink className="h-3.5 w-3.5" /> Preview
          </a>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main editor */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full border-0 bg-transparent text-[32px] font-bold tracking-tight outline-none placeholder:text-gray-300"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          />

          <TipTapEditor
            content={contentHtml}
            onChange={setContentHtml}
            onWordCount={setWordCount}
          />

          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{wordCount} words</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{readTime} min</span>
            <span>v{post.version || 1}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Status</h3>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: statusColor }}>
                {form.status}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => saveMutation.mutate(undefined)} disabled={saveMutation.isPending} className="btn-secondary flex-1 justify-center text-sm">
                <Save className="h-3.5 w-3.5" /> Save
              </button>
              {form.status === "draft" ? (
                <button onClick={() => { setForm(f => ({ ...f, status: "published" })); saveMutation.mutate("published"); }} disabled={saveMutation.isPending} className="btn-primary flex-1 justify-center text-sm">
                  <Globe className="h-3.5 w-3.5" /> Publish
                </button>
              ) : form.status === "published" ? (
                <button onClick={() => { setForm(f => ({ ...f, status: "draft" })); saveMutation.mutate("draft"); }} disabled={saveMutation.isPending} className="btn-ghost flex-1 justify-center text-sm">
                  Unpublish
                </button>
              ) : (
                <button onClick={() => { setForm(f => ({ ...f, status: "draft" })); saveMutation.mutate("draft"); }} disabled={saveMutation.isPending} className="btn-ghost flex-1 justify-center text-sm">
                  Restore
                </button>
              )}
            </div>
            <button onClick={() => { setForm(f => ({ ...f, status: "archived" })); saveMutation.mutate("archived"); }} className="btn-ghost w-full justify-center text-xs" style={{ color: "var(--text-muted)" }}>
              <Archive className="h-3 w-3" /> Archive
            </button>
          </div>

          {/* Cover */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cover Image</h3>
            {form.coverImageUrl ? (
              <div className="relative">
                <img src={form.coverImageUrl} alt="" className="w-full rounded-lg object-cover h-32" />
                <button onClick={() => setForm(f => ({ ...f, coverImageUrl: "" }))} className="absolute top-1 right-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">Remove</button>
              </div>
            ) : null}
            <input type="text" value={form.coverImageUrl} onChange={(e) => setForm(f => ({ ...f, coverImageUrl: e.target.value }))} placeholder="Image URL" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          </div>

          {/* SEO */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SEO</h3>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Slug</label>
              <input type="text" value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full rounded-lg px-3 py-2 font-mono text-xs" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>SEO Title</label>
              <input type="text" value={form.seoTitle} onChange={(e) => setForm(f => ({ ...f, seoTitle: e.target.value }))} placeholder="Custom search title" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
              <textarea rows={2} value={form.seoDescription} onChange={(e) => setForm(f => ({ ...f, seoDescription: e.target.value }))} placeholder="Meta description" className="w-full resize-none rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            </div>
          </div>

          {/* Meta */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Metadata</h3>
            <input type="text" value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Category" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            <input type="text" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Tags (comma-separated)" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
            <input type="text" value={form.authorName} onChange={(e) => setForm(f => ({ ...f, authorName: e.target.value }))} placeholder="Author" className="w-full rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }} />
          </div>

          {/* Info */}
          <div className="text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
            <p>Created: {new Date(post.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(post.updated_at).toLocaleString()}</p>
            <p>Version: {post.version || 1}</p>
            <p>Views: {post.view_count || 0}</p>
          </div>

          {/* Danger */}
          <div className="glass-card p-4" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
            <button
              onClick={() => { if (confirm("Delete permanently?")) deleteMutation.mutate(); }}
              className="btn-ghost w-full justify-center text-xs"
              style={{ color: "var(--color-error)" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
