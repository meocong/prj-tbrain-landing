"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useAdminAuth, useHasPermission } from "@/lib/admin/auth-context";
import { revalidateBlogPost } from "@/lib/admin/revalidate-blog";
import { Check, X as XIcon, Clock, Eye, ChevronLeft, ChevronRight, Bot, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PAGE_SIZE = 20;

interface PostSummary {
  id: string;
  title: string;
  slug: string;
  status: string;
  source: string;
  word_count: number | null;
  agent_meta: { rubric?: Record<string, number>; factcheck_flags?: string[] } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  approved: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

export default function ApprovalsPage() {
  const canApprove = useHasPermission("approvals.approve");
  const { adminUser } = useAdminAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  // Deep link from the content agent's Telegram message: /admin/approvals?id=<request id>
  const [focusId, setFocusId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) {
      setFocusId(id);
      setStatusFilter("all");
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-approvals", statusFilter, page, focusId],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("approval_requests")
        .select("*, submitter:admin_users!submitted_by(email, full_name)", { count: "exact" })
        .order("submitted_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (focusId) {
        query = query.eq("id", focusId);
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count } = await query;
      const requests = data ?? [];

      // Post titles + agent provenance so the reviewer sees what they approve.
      const postIds = requests.filter((r) => r.resource_type === "post").map((r) => r.resource_id as string);
      const posts: Record<string, PostSummary> = {};
      if (postIds.length) {
        const { data: rows } = await supabaseAdmin
          .from("cms_posts")
          .select("id, title, slug, status, source, word_count, agent_meta")
          .in("id", postIds);
        for (const p of rows ?? []) posts[p.id as string] = p as PostSummary;
      }
      return { requests, total: count ?? 0, posts };
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: "approved" | "rejected"; note?: string }) => {
      // Update approval request
      const { data: claimed, error: approvalError } = await supabaseAdmin
        .from("approval_requests")
        .update({
          status,
          reviewed_by: adminUser?.id ?? null,
          reviewed_at: new Date().toISOString(),
          review_note: note || null,
        })
        .eq("id", id)
        .eq("status", "pending")
        .select("id");
      if (approvalError) throw approvalError;
      // Guards double clicks / two reviewers: only the first decision counts.
      if (!claimed?.length) throw new Error("This request was already reviewed");

      // If approved and resource_type is 'post', publish the post
      const { data: request } = await supabaseAdmin.from("approval_requests").select("resource_type, resource_id").eq("id", id).single();
      if (request && status === "approved" && request.resource_type === "post") {
        const now = new Date().toISOString();
        const { data: published, error: publishError } = await supabaseAdmin.from("cms_posts").update({
          status: "published",
          published_at: now,
          reviewed_by: adminUser?.id ?? null,
          reviewed_at: now,
          updated_at: now,
        }).eq("id", request.resource_id).select("slug").single();
        if (publishError) {
          // Don't strand the request as approved with the post unpublished.
          await supabaseAdmin.from("approval_requests")
            .update({ status: "pending", reviewed_by: null, reviewed_at: null })
            .eq("id", id);
          throw publishError;
        }
        await revalidateBlogPost(published?.slug);
      }
      if (request && status === "rejected" && request.resource_type === "post") {
        await supabaseAdmin.from("cms_posts").update({
          status: "draft",
          updated_at: new Date().toISOString(),
        }).eq("id", request.resource_id);
      }
    },
    onSuccess: (_, vars) => {
      toast.success(vars.status === "approved" ? "Approved!" : "Rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-approvals"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div>
      <h1 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        Approvals
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        Review and approve content submissions. {data?.total ?? 0} total.
      </p>

      {focusId && (
        <button
          onClick={() => { setFocusId(null); setStatusFilter("pending"); window.history.replaceState(null, "", "/admin/approvals"); }}
          className="btn-ghost mt-3 text-xs"
        >
          Showing one request · show all pending
        </button>
      )}

      {/* Status filter tabs */}
      <div className="glass-card mt-4 flex items-center gap-3 p-3">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); setFocusId(null); }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: statusFilter === s ? "var(--color-brand-50)" : "transparent",
              color: statusFilter === s ? "var(--color-brand-600)" : "var(--text-secondary)",
            }}
          >
            {s === "pending" && <Clock className="inline h-3.5 w-3.5 mr-1" />}
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-28 w-full" />)
        ) : data?.requests.length === 0 ? (
          <div className="glass-card p-12 text-center" style={{ color: "var(--text-muted)" }}>No {statusFilter} approvals</div>
        ) : (
          data?.requests.map((r: Record<string, unknown>) => {
            const submitter = r.submitter as { email: string; full_name: string | null } | null;
            const status = r.status as string;
            const post = r.resource_type === "post" ? data.posts[r.resource_id as string] : undefined;
            const meta = post?.agent_meta ?? {};
            const flags = Array.isArray(meta.factcheck_flags) ? meta.factcheck_flags : [];
            const rubric = meta.rubric && typeof meta.rubric === "object" ? Object.entries(meta.rubric) : [];
            return (
              <div
                key={r.id as string}
                className="glass-card p-5"
                style={focusId === r.id ? { boxShadow: "0 0 0 2px var(--color-brand-500)" } : undefined}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: STATUS_COLORS[status] || "#6b7280" }}>
                        {status}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {post ? post.title : `${r.resource_type as string} approval`}
                      </span>
                      {post?.source === "agent" && (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ backgroundColor: "var(--color-brand-50)", color: "var(--color-brand-600)" }}>
                          <Bot className="h-3 w-3" /> AI draft
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Submitted by {submitter?.full_name || submitter?.email || (post?.source === "agent" ? "Content agent" : "Unknown")} · {new Date(r.submitted_at as string).toLocaleString()}
                      {post?.word_count ? ` · ${post.word_count} words` : ""}
                    </p>
                    {rubric.length > 0 && (
                      <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                        Self-review: {rubric.map(([k, v]) => `${k} ${String(v)}/5`).join(" · ")}
                      </p>
                    )}
                    {flags.length > 0 && (
                      <ul className="mt-2 space-y-1 rounded-lg px-3 py-2 text-xs" style={{ background: "rgba(234,179,8,0.1)", color: "var(--text-secondary)" }}>
                        {flags.map((f, i) => (
                          <li key={i} className="flex gap-1"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" style={{ color: "#eab308" }} />{String(f)}</li>
                        ))}
                      </ul>
                    )}
                    {r.resource_type === "post" && (
                      <div className="mt-1 flex gap-3">
                        <Link href={`/admin/content/${r.resource_id}/preview`} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
                          <Eye className="h-3 w-3" /> Preview
                        </Link>
                        <Link href={`/admin/content/${r.resource_id}`} className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
                          Edit post
                        </Link>
                      </div>
                    )}
                    {r.review_note ? (
                      <p
                        className="mt-2 rounded-lg px-3 py-2 text-xs italic"
                        style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                      >
                        Note: {String(r.review_note)}
                      </p>
                    ) : null}
                  </div>

                  {canApprove && status === "pending" && (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => reviewMutation.mutate({ id: r.id as string, status: "approved", note: reviewNote[r.id as string] })}
                          disabled={reviewMutation.isPending}
                          className="btn-primary text-xs px-3 py-1.5"
                        >
                          <Check className="h-3.5 w-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => reviewMutation.mutate({ id: r.id as string, status: "rejected", note: reviewNote[r.id as string] })}
                          disabled={reviewMutation.isPending}
                          className="btn-ghost text-xs px-3 py-1.5"
                          style={{ color: "var(--color-error)" }}
                        >
                          <XIcon className="h-3.5 w-3.5" /> Reject
                        </button>
                      </div>
                      <input
                        type="text"
                        value={reviewNote[r.id as string] || ""}
                        onChange={(e) => setReviewNote((prev) => ({ ...prev, [r.id as string]: e.target.value }))}
                        placeholder="Review note (optional)"
                        className="rounded-lg px-2 py-1 text-xs"
                        style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Page {page + 1} of {totalPages}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost p-1.5">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost p-1.5">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
