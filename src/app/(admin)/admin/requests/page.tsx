"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { REQUEST_STATUS_BADGE } from "@/lib/admin/constants";
import { Check, X as XIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useHasPermission } from "@/lib/admin/auth-context";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function RequestsPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(0);
  const canApprove = useHasPermission("requests.approve");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", statusFilter, page],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("access_requests")
        .select("*", { count: "exact" })
        .order("requested_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count } = await query;
      return { requests: data ?? [], total: count ?? 0 };
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Call the existing approve API
      const { data: req } = await supabaseAdmin
        .from("access_requests")
        .select("approve_token")
        .eq("id", requestId)
        .single();

      if (!req?.approve_token) throw new Error("No approve token");

      const res = await fetch(
        `/data/terminal-bench/api/auth/approve?t=${req.approve_token}`
      );
      if (!res.ok) throw new Error("Approve failed");
    },
    onSuccess: () => {
      toast.success("Request approved and passcode sent");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (err) => {
      toast.error(`Failed: ${err.message}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { data: req } = await supabaseAdmin
        .from("access_requests")
        .select("approve_token")
        .eq("id", requestId)
        .single();

      if (!req?.approve_token) throw new Error("No reject token");

      // Use reject endpoint
      const res = await fetch(
        `/data/terminal-bench/api/auth/reject?t=${req.approve_token}`
      );
      if (!res.ok) throw new Error("Reject failed");
    },
    onSuccess: () => {
      toast.success("Request rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div>
      <h1
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
      >
        Access Requests
      </h1>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        {data?.total ?? 0} requests ({statusFilter})
      </p>

      {/* Filter */}
      <div className="glass-card mt-4 flex items-center gap-3 p-3">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s ? "" : ""
            }`}
            style={{
              backgroundColor: statusFilter === s ? "var(--color-brand-50)" : "transparent",
              color: statusFilter === s ? "var(--color-brand-600)" : "var(--text-secondary)",
            }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              {["Name", "Email", "Company", "Use Case", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-5 w-full" /></td></tr>
              ))
            ) : data?.requests.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  No requests found
                </td>
              </tr>
            ) : (
              data?.requests.map((r: Record<string, unknown>) => (
                <tr key={r.id as string} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {(r.full_name as string) || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {r.email as string}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {(r.company as string) || "—"}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                    {(r.use_case as string) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${REQUEST_STATUS_BADGE[r.status as string] || "badge-muted"}`}>
                      {r.status as string}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(r.requested_at as string).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {canApprove && r.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => approveMutation.mutate(r.id as string)}
                          disabled={approveMutation.isPending}
                          className="btn-ghost p-1.5"
                          title="Approve"
                          style={{ color: "var(--color-success)" }}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => rejectMutation.mutate(r.id as string)}
                          disabled={rejectMutation.isPending}
                          className="btn-ghost p-1.5"
                          title="Reject"
                          style={{ color: "var(--color-error)" }}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--border-default)" }}>
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
    </div>
  );
}
