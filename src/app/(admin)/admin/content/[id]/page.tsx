"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("cms_posts")
        .select("*")
        .eq("id", id)
        .single();
      return data;
    },
  });

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    contentMd: "",
    category: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
    status: "draft",
  });

  useEffect(() => {
    if (post) {
      setForm({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        contentMd: post.content_md || "",
        category: post.category || "",
        tags: post.tags ? post.tags.join(", ") : "",
        seoTitle: post.seo_title || "",
        seoDescription: post.seo_description || "",
        status: post.status || "draft",
      });
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (newStatus: string | undefined) => {
      const status = newStatus || form.status;
      const { error } = await supabaseAdmin
        .from("cms_posts")
        .update({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt || null,
          content_md: form.contentMd || null,
          category: form.category || null,
          tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
          status,
          published_at:
            status === "published" && !post?.published_at
              ? new Date().toISOString()
              : post?.published_at,
          seo_title: form.seoTitle || null,
          seo_description: form.seoDescription || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post saved");
      queryClient.invalidateQueries({ queryKey: ["admin-post", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin
        .from("cms_posts")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      router.push("/admin/content");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-64 w-full" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="py-20 text-center" style={{ color: "var(--text-muted)" }}>
        Post not found
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link
          href="/admin/content"
          className="inline-flex items-center gap-1 text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Content
        </Link>
        {form.status === "published" && (
          <a
            href={`/blog/${form.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Live
          </a>
        )}
      </div>

      <h1
        className="mt-4 text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        Edit Post
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Slug
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full rounded-lg px-3 py-2.5 font-mono text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Excerpt
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              className="w-full resize-none rounded-lg px-3 py-2.5 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Content (Markdown)
            </label>
            <textarea
              rows={20}
              value={form.contentMd}
              onChange={(e) => setForm((f) => ({ ...f, contentMd: e.target.value }))}
              className="w-full resize-y rounded-lg px-3 py-2.5 font-mono text-sm leading-relaxed"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Actions
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => saveMutation.mutate(undefined)}
                disabled={saveMutation.isPending}
                className="btn-secondary flex-1 justify-center"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              {form.status === "draft" ? (
                <button
                  onClick={() => saveMutation.mutate("published")}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex-1 justify-center"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => saveMutation.mutate("draft")}
                  disabled={saveMutation.isPending}
                  className="btn-ghost flex-1 justify-center"
                >
                  Unpublish
                </button>
              )}
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Metadata
            </h3>
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="ai, training, data"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SEO</h3>
            <input
              type="text"
              value={form.seoTitle}
              onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
              placeholder="SEO title"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
            <textarea
              rows={2}
              value={form.seoDescription}
              onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
              placeholder="Meta description"
              className="w-full resize-none rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Danger zone */}
          <div
            className="glass-card p-4"
            style={{ borderColor: "rgba(239,68,68,0.2)" }}
          >
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-error)" }}>
              Danger Zone
            </h3>
            <button
              onClick={() => {
                if (confirm("Delete this post permanently?")) {
                  deleteMutation.mutate();
                }
              }}
              className="btn-ghost mt-2 w-full justify-center text-xs"
              style={{ color: "var(--color-error)" }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Post
            </button>
          </div>

          {/* Info */}
          <div className="text-xs space-y-1" style={{ color: "var(--text-muted)" }}>
            <p>Created: {new Date(post.created_at).toLocaleString()}</p>
            <p>Updated: {new Date(post.updated_at).toLocaleString()}</p>
            <p>Views: {post.view_count}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
