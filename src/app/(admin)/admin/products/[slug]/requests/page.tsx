"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { CheckCircle, XCircle } from "lucide-react";
import type { Product } from "@/lib/admin/types";

const PAGE_SIZE = 20;

type RequestRow = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  status: string;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  batch?: { slug: string; name: string } | null;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#ca8a04",
  approved: "#16a34a",
  rejected: "#dc2626",
  cancelled: "#6b7280",
};

export default function ProductRequestsPage() {
  const params = useParams<{ slug: string }>();
  const qc = useQueryClient();
  const canApprove = useHasPermission("requests.approve");
  const canReject = useHasPermission("requests.reject");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [banner, setBanner] = useState<string | null>(null);

  const act = useMutation({
    mutationFn: async (args: { id: string; action: "approve" | "reject"; reason?: string }) => {
      const res = await fetch(`/api/admin/requests/${args.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: args.action, reason: args.reason }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error ?? "failed");
      return j;
    },
    onSuccess: (j, vars) => {
      qc.invalidateQueries({ queryKey: ["product-requests"] });
      if (vars.action === "approve" && j.passcode_plain) {
        setBanner(`Approved · passcode ${j.passcode_plain} · email ${j.email?.ok ? "sent" : "skipped"}`);
      } else {
        setBanner(`Rejected · email ${j.email?.ok ? "sent" : "skipped"}`);
      }
    },
  });

  const { data: product } = useQuery({
    queryKey: ["admin-product", params.slug],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("products")
        .select("id")
        .eq("slug", params.slug)
        .maybeSingle();
      return data as Pick<Product, "id"> | null;
    },
  });
  const productId = product?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["product-requests", productId, search, status, page],
    enabled: !!productId,
    queryFn: async () => {
      let q = supabaseAdmin
        .from("access_requests")
        .select("*, batch:batches(slug, name)", { count: "exact" })
        .eq("product_id", productId!)
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%`);
      if (status !== "all") q = q.eq("status", status);
      const { data, count } = await q;
      return { rows: (data ?? []) as RequestRow[], total: count ?? 0 };
    },
  });

  const columns: Column<RequestRow>[] = [
    {
      key: "email",
      header: "Requester",
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>
            {r.full_name || r.email}
          </p>
          <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
            {r.email} {r.company ? `· ${r.company}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {r.batch?.name ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
          style={{ background: "var(--bg-input)", color: STATUS_COLOR[r.status] ?? "var(--text-muted)" }}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Requested",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (r) => {
        if (r.status !== "pending") return null;
        return (
          <div className="flex justify-end gap-1">
            {canApprove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Approve ${r.email}?`)) act.mutate({ id: r.id, action: "approve" });
                }}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
                style={{ color: "#16a34a", background: "rgba(16,185,129,0.08)" }}
              >
                <CheckCircle className="h-3 w-3" /> Approve
              </button>
            )}
            {canReject && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const reason = prompt("Rejection reason (optional, sent in email):") ?? "";
                  if (confirm(`Reject ${r.email}?`)) act.mutate({ id: r.id, action: "reject", reason: reason || undefined });
                }}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
                style={{ color: "#dc2626", background: "rgba(239,68,68,0.08)" }}
              >
                <XCircle className="h-3 w-3" /> Reject
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      {banner && (
        <div
          className="mb-3 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", color: "#16a34a" }}
        >
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-xs">Dismiss</button>
        </div>
      )}
      <DataTable<RequestRow>
      columns={columns}
      rows={data?.rows ?? []}
      total={data?.total ?? 0}
      page={page}
      pageSize={PAGE_SIZE}
      loading={isLoading}
      search={search}
      searchPlaceholder="Search requesters…"
      filters={[
        {
          key: "status",
          label: "Status",
          value: status,
          options: [
            { value: "all", label: "All status" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
            { value: "cancelled", label: "Cancelled" },
          ],
        },
      ]}
      onSearchChange={(v) => {
        setSearch(v);
        setPage(0);
      }}
      onFilterChange={(_, v) => {
        setStatus(v);
        setPage(0);
      }}
      onPageChange={setPage}
      rowKey={(r) => r.id}
      empty="No access requests yet."
      />
    </>
  );
}
