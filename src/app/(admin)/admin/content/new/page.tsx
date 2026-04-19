"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Globe, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { TipTapEditor } from "@/components/admin/editor/TipTapEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [form, setForm] = useState({
    slug: "",
    excerpt: "",
    coverImageUrl: "",
    category: "",
    tags: "",
    authorName: "Tbrain Team",
    seoTitle: "",
    seoDescription: "",
  });

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 200);

  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const saveMutation = useMutation({
    mutationFn: async (status: "draft" | "published") => {
      const slug = form.slug || autoSlug(title);
      const { error } = await supabaseAdmin.from("cms_posts").insert({
        title,
        slug,
        excerpt: form.excerpt || null,
        content_html: contentHtml || null,
        content_md: null,
        cover_image_url: form.coverImageUrl || null,
        category: form.category || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
        author_name: form.authorName || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        seo_title: form.seoTitle || null,
        seo_description: form.seoDescription || null,
        word_count: wordCount,
        version: 1,
      });
      if (error) throw error;
    },
    onSuccess: (_, status) => {
      toast.success(status === "published" ? "Published!" : "Draft saved");
      router.push("/admin/content");
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  return (
    <div>
      <Link href="/admin/content" className="inline-flex items-center gap-1 text-sm" style={{ color: "var(--text-muted)" }}>
        <ArrowLeft className="h-4 w-4" /> Back to Content
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main editor */}
        <div className="space-y-4">
          {/* Title — Medium-style large input */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!form.slug) setForm((f) => ({ ...f, slug: autoSlug(e.target.value) }));
            }}
            placeholder="Post title"
            className="w-full border-0 bg-transparent text-[32px] font-bold tracking-tight outline-none placeholder:text-gray-300"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          />

          {/* TipTap Editor */}
          <TipTapEditor
            content=""
            onChange={setContentHtml}
            onWordCount={setWordCount}
          />

          {/* Editor footer */}
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" />{wordCount} words</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{readTime} min read</span>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Publish */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Publish</h3>
            <div className="flex gap-2">
              <button
                onClick={() => saveMutation.mutate("draft")}
                disabled={saveMutation.isPending || !title}
                className="btn-secondary flex-1 justify-center text-sm"
              >
                <Save className="h-3.5 w-3.5" /> Save Draft
              </button>
              <button
                onClick={() => saveMutation.mutate("published")}
                disabled={saveMutation.isPending || !title}
                className="btn-primary flex-1 justify-center text-sm"
              >
                <Globe className="h-3.5 w-3.5" /> Publish
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Cover Image</h3>
            {form.coverImageUrl ? (
              <div className="relative">
                <img src={form.coverImageUrl} alt="" className="w-full rounded-lg object-cover h-32" />
                <button
                  onClick={() => setForm((f) => ({ ...f, coverImageUrl: "" }))}
                  className="absolute top-1 right-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white"
                >
                  Remove
                </button>
              </div>
            ) : null}
            <input
              type="text"
              value={form.coverImageUrl}
              onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
              placeholder="Image URL or upload path"
              className="w-full rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
            />
          </div>

          {/* SEO */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>SEO</h3>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto-generated"
                className="w-full rounded-lg px-3 py-2 font-mono text-xs"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>SEO Title</label>
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
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Description</label>
              <textarea
                rows={2}
                value={form.seoDescription}
                onChange={(e) => setForm((f) => ({ ...f, seoDescription: e.target.value }))}
                placeholder="Meta description"
                className="w-full resize-none rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Metadata</h3>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="e.g. Engineering, Robotics"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                placeholder="ai, training, data"
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Excerpt</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="Brief summary"
                className="w-full resize-none rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>Author</label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm"
                style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
