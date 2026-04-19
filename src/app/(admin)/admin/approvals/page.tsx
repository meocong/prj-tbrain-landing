"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { Check, X as XIcon, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  approved: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

export default function ApprovalsPage() {
  const canApprove = useHasPermission("approvals.approve");
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["admin-approvals", statusFilter, page],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("approval_requests")
        .select("*, submitter:admin_users!submitted_by(email, full_name)", { count: "exact" })
        .order("submitted_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count } = await query;
      return { requests: data ?? [], total: count ?? 0 };
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: string; status: "approved" | "rejected"; note?: string }) => {
      // Update approval request
      const { error: approvalError } = await supabaseAdmin
        .from("approval_requests")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          review_note: note || null,
        })
        .eq("id", id);
      if (approvalError) throw approvalError;

      // If approved and resource_type is 'post', publish the post
      const { data: request } = await supabaseAdmin.from("approval_requests").select("resource_type, resource_id").eq("id", id).single();
      if (request && status === "approved" && request.resource_type === "post") {
        await supabaseAdmin.from("cms_posts").update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }).eq("id", request.resource_id);
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

      {/* Status filter tabs */}
      <div className="glass-card mt-4 flex items-center gap-3 p-3">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
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
            return (
              <div key={r.id as string} className="glass-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: STATUS_COLORS[status] || "#6b7280" }}>
                        {status}
                      </span>
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {(r.resource_type as string)} approval
                      </span>
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      Submitted by {submitter?.full_name || submitter?.email || "Unknown"} · {new Date(r.submitted_at as string).toLocaleString()}
                    </p>
                    {r.resource_type === "post" && (
                      <Link href={`/admin/content/${r.resource_id}`} className="mt-1 inline-flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-brand-600)" }}>
                        <Eye className="h-3 w-3" /> View post
                      </Link>
                    )}
                    {r.review_note ? (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs italic" style={{ color: "var(--text-secondary)" }}>
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
