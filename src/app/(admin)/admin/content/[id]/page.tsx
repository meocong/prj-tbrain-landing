"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, ExternalLink, Globe, Clock, FileText, Archive, Eye, Bot, AlertTriangle, SendHorizonal } from "lucide-react";
import Link from "next/link";
import { TipTapEditor } from "@/components/admin/editor/TipTapEditor";
import { SharePanel } from "@/components/admin/content/SharePanel";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";
import { CoverImageField } from "@/components/admin/content/CoverImageField";
import { AiPanel, type SeoSuggestion } from "@/components/admin/content/AiPanel";
import type { Editor } from "@tiptap/react";
import { revalidateBlogPost } from "@/lib/admin/revalidate-blog";
import type { CmsAgentMeta } from "@/lib/admin/types";

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { adminUser } = useAdminAuth();
  const canPublish = useHasPermission("content.publish");

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
  const [editor, setEditor] = useState<Editor | null>(null);
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
      const publishing = status === "published" && post?.status !== "published";
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
          // Publishing from the editor counts as the human review of an AI draft.
          ...(publishing ? { reviewed_by: adminUser?.id ?? null, reviewed_at: new Date().toISOString() } : {}),
          seo_title: form.seoTitle || null,
          seo_description: form.seoDescription || null,
          word_count: wordCount,
          version: (post?.version || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      if (status === "published" || post?.status === "published") {
        await revalidateBlogPost(form.slug);
        if (post?.slug && post.slug !== form.slug) await revalidateBlogPost(post.slug);
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      queryClient.invalidateQueries({ queryKey: ["admin-post", id] });
    },
    onError: (err) => toast.error(`Failed: ${err.message}`),
  });

  // Editors without publish rights send the draft to /admin/approvals instead.
  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: pending } = await supabaseAdmin
        .from("approval_requests")
        .select("id")
        .eq("resource_type", "post")
        .eq("resource_id", id)
        .eq("status", "pending")
        .maybeSingle();
      if (pending) return;
      const { error } = await supabaseAdmin
        .from("approval_requests")
        .insert({ resource_type: "post", resource_id: id, submitted_by: adminUser?.id ?? null });
      if (error) throw error;
    },
    onSuccess: () => toast.success("Submitted for review"),
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
        <div className="flex gap-1">
          <Link href={`/admin/content/${id}/preview`} className="btn-ghost text-xs">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Link>
          {form.status === "published" && (
            <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
              <ExternalLink className="h-3.5 w-3.5" /> View live
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main editor */}
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full border-0 bg-transparent text-[32px] font-bold tracking-tight outline-none placeholder:text-[color:var(--text-muted)]"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          />

          <TipTapEditor
            content={contentHtml}
            onChange={setContentHtml}
            onWordCount={setWordCount}
            onReady={setEditor}
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
              {form.status === "draft" && canPublish ? (
                <button onClick={() => { setForm(f => ({ ...f, status: "published" })); saveMutation.mutate("published"); }} disabled={saveMutation.isPending} className="btn-primary flex-1 justify-center text-sm">
                  <Globe className="h-3.5 w-3.5" /> Publish
                </button>
              ) : form.status === "draft" ? (
                <button onClick={() => saveMutation.mutate(undefined, { onSuccess: () => submitMutation.mutate() })} disabled={saveMutation.isPending || submitMutation.isPending} className="btn-primary flex-1 justify-center text-sm">
                  <SendHorizonal className="h-3.5 w-3.5" /> Submit
                </button>
              ) : form.status === "published" && canPublish ? (
                <button onClick={() => { setForm(f => ({ ...f, status: "draft" })); saveMutation.mutate("draft"); }} disabled={saveMutation.isPending} className="btn-ghost flex-1 justify-center text-sm">
                  Unpublish
                </button>
              ) : form.status === "archived" ? (
                <button onClick={() => { setForm(f => ({ ...f, status: "draft" })); saveMutation.mutate("draft"); }} disabled={saveMutation.isPending} className="btn-ghost flex-1 justify-center text-sm">
                  Restore
                </button>
              ) : null}
            </div>
            <button onClick={() => { setForm(f => ({ ...f, status: "archived" })); saveMutation.mutate("archived"); }} className="btn-ghost w-full justify-center text-xs" style={{ color: "var(--text-muted)" }}>
              <Archive className="h-3 w-3" /> Archive
            </button>
          </div>

          <AiPanel
            editor={editor}
            title={title}
            postId={id}
            postStatus={post.status}
            onSeo={(seo: SeoSuggestion) =>
              setForm((f) => ({
                ...f,
                seoTitle: seo.seo_title,
                seoDescription: seo.seo_description,
                excerpt: f.excerpt || seo.excerpt,
                tags: f.tags || seo.tags.join(", "),
              }))
            }
          />

          <SharePanel postId={id} slug={form.slug} published={post.status === "published"} />

          {post.source === "agent" && <AgentTrail meta={post.agent_meta as CmsAgentMeta | null} reviewedAt={post.reviewed_at} />}

          <CoverImageField value={form.coverImageUrl} onChange={(url) => setForm(f => ({ ...f, coverImageUrl: url }))} />

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

/** What the content agent researched and flagged — shown to the human editor. */
const isHttp = (u: string) => /^https?:\/\//i.test(u);

function AgentTrail({ meta, reviewedAt }: { meta: CmsAgentMeta | null; reviewedAt: string | null }) {
  const m = meta ?? {};
  const knowledgeIds = (m.knowledge_ids ?? []).filter((id) => /^[0-9a-f-]{36}$/i.test(id));
  const { data: knowledge } = useQuery({
    queryKey: ["agent-trail-knowledge", knowledgeIds.join(",")],
    enabled: knowledgeIds.length > 0,
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("cms_agent_knowledge")
        .select("id, kind, title, status")
        .in("id", knowledgeIds);
      return (data ?? []) as { id: string; kind: string; title: string; status: string }[];
    },
  });
  return (
    <div className="glass-card p-4 space-y-2 text-xs" style={{ color: "var(--text-secondary)" }}>
      <div className="flex items-center gap-2">
        <Bot className="h-4 w-4" style={{ color: "var(--color-brand-600)" }} />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>AI draft</h3>
      </div>
      <p style={{ color: "var(--text-muted)" }}>
        {reviewedAt ? `Reviewed ${new Date(reviewedAt).toLocaleString()}` : "Not reviewed yet — check facts and sources before publishing."}
      </p>
      {m.post_type && <p><span className="font-medium">Post type:</span> {m.post_type.replaceAll("_", " ")}</p>}
      {m.takeaway && <p><span className="font-medium">Takeaway:</span> {m.takeaway}</p>}
      {m.angle && <p><span className="font-medium">Angle:</span> {m.angle}</p>}
      {m.target_keyword && <p><span className="font-medium">Keyword:</span> {m.target_keyword}</p>}
      {m.scorecard?.total != null ? (
        <p><span className="font-medium">Critic:</span> {m.scorecard.total}/26</p>
      ) : (
        m.rubric && (
          <p><span className="font-medium">Self-review:</span> {Object.entries(m.rubric).map(([k, v]) => `${k} ${v}/5`).join(" · ")}</p>
        )
      )}
      {m.reader_pass && <p><span className="font-medium">Reader pass:</span> {m.reader_pass}</p>}
      {knowledgeIds.length > 0 && (
        <div>
          <p className="font-medium">Knowledge used ({knowledgeIds.length})</p>
          <ul className="mt-1 space-y-0.5 pl-1">
            {knowledgeIds.map((id) => {
              const k = knowledge?.find((x) => x.id === id);
              return (
                <li key={id}>
                  {k ? `${k.kind}: ${k.title}` : id.slice(0, 8)}
                  {k && k.status !== "approved" && (
                    <span className="ml-1 font-medium" style={{ color: "#b45309" }}>({k.status} — not approved)</span>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href="/admin/content/agent/knowledge" className="underline underline-offset-2">Open knowledge</Link>
        </div>
      )}
      {m.images && m.images.length > 0 && (
        <details>
          <summary className="cursor-pointer font-medium">Images ({m.images.length})</summary>
          <ul className="mt-1 space-y-1.5 pl-1">
            {m.images.map((img, i) => (
              <li key={i} className="break-all">
                <span className="font-medium">
                  {img.kind === "source_figure"
                    ? "Source figure"
                    : img.kind === "annotated_figure"
                      ? "Annotated figure"
                      : img.kind === "video"
                        ? "Video"
                        : img.kind === "chart"
                          ? `Our chart${img.form ? ` (${img.form})` : ""}`
                          : "Library"}
                </span>
                {img.why ? ` — ${img.why}` : ""}
                {(img.kind === "source_figure" || img.kind === "annotated_figure" || img.kind === "video") && (
                  <span className="block" style={{ color: img.license ? undefined : "#b45309" }}>
                    {img.credit || "no credit recorded"} · {img.license || "licence not recorded: check before publishing"}
                    {img.source_url && isHttp(img.source_url) && (
                      <>
                        {" · "}
                        <a href={img.source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">source</a>
                      </>
                    )}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      {m.factcheck_flags && m.factcheck_flags.length > 0 && (
        <ul className="space-y-1 rounded-lg px-2 py-1.5" style={{ background: "rgba(234,179,8,0.1)" }}>
          {m.factcheck_flags.map((f, i) => (
            <li key={i} className="flex gap-1"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" style={{ color: "#eab308" }} />{f}</li>
          ))}
        </ul>
      )}
      {m.sources && m.sources.length > 0 && (
        <details>
          <summary className="cursor-pointer font-medium">Sources ({m.sources.length})</summary>
          <ol className="mt-1 list-decimal space-y-1 pl-4">
            {m.sources.map((src, i) => (
              <li key={i} className="break-all">
                {isHttp(src.url) ? (
                  <a href={src.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {src.title || src.url}
                  </a>
                ) : (
                  <span>{src.title || src.url}</span>
                )}
                {src.publisher ? ` — ${src.publisher}` : ""}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
