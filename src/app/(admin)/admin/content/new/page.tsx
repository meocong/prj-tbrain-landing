"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    contentMd: "",
    category: "",
    tags: "",
    seoTitle: "",
    seoDescription: "",
  });

  const autoSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 200);

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const { error } = await supabaseAdmin.from("cms_posts").insert({
        title: form.title,
        slug: form.slug || autoSlug(form.title),
        excerpt: form.excerpt || null,
        content_md: form.contentMd || null,
        category: form.category || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        seo_title: form.seoTitle || null,
        seo_description: form.seoDescription || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      toast.success(status === "published" ? "Post published!" : "Draft saved");
      router.push("/admin/content");
    },
    onError: (err) => {
      toast.error(`Failed: ${err.message}`);
    },
  });

  return (
    <div>
      <Link
        href="/admin/content"
        className="inline-flex items-center gap-1 text-sm"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Content
      </Link>

      <h1
        className="mt-4 text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        New Blog Post
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => {
                setForm((f) => ({
                  ...f,
                  title: e.target.value,
                  slug: f.slug || autoSlug(e.target.value),
                }));
              }}
              placeholder="Post title"
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
              placeholder="auto-generated-from-title"
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
              placeholder="Brief summary for listing pages..."
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
              placeholder="Write your post in Markdown..."
              className="w-full resize-y rounded-lg px-3 py-2.5 font-mono text-sm leading-relaxed"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="glass-card p-4 space-y-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Publish
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => saveMutation.mutate("draft")}
                disabled={saveMutation.isPending || !form.title}
                className="btn-secondary flex-1 justify-center"
              >
                <Save className="h-4 w-4" />
                Save Draft
              </button>
              <button
                onClick={() => saveMutation.mutate("published")}
                disabled={saveMutation.isPending || !form.title}
                className="btn-primary flex-1 justify-center"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="glass-card p-4 space-y-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Metadata
            </h3>
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>
                Category
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Engineering, News"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>
                Tags (comma-separated)
              </label>
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

          <div className="glass-card p-4 space-y-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              SEO
            </h3>
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>
                SEO Title
              </label>
              <input
                type="text"
                value={form.seoTitle}
                onChange={(e) => setForm((f) => ({ ...f, seoTitle: e.target.value }))}
                placeholder="Custom title for search engines"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs" style={{ color: "var(--text-muted)" }}>
                SEO Description
              </label>
              <textarea
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                placeholder="Meta description for search results..."
                className="w-full resize-none rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
