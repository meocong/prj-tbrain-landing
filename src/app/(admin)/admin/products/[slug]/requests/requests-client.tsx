"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHasPermission } from "@/lib/admin/auth-context";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { CheckCircle, XCircle } from "lucide-react";
import type { ListResult } from "@/lib/admin/server/list";

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
  pending: "#ca8a04", approved: "#16a34a", rejected: "#dc2626", cancelled: "#6b7280",
};

export function RequestsClient({ initial }: { initial: ListResult<RequestRow> }) {
  const router = useRouter();
  const canApprove = useHasPermission("requests.approve");
  const canReject = useHasPermission("requests.reject");
  const [banner, setBanner] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const act = async (id: string, action: "approve" | "reject", email: string) => {
    const reason = action === "reject" ? prompt("Rejection reason (optional):") ?? "" : undefined;
    if (!confirm(`${action === "approve" ? "Approve" : "Reject"} ${email}?`)) return;
    setBusy(id);
    const res = await fetch(`/api/admin/requests/${id}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: reason || undefined }),
    });
    const j = await res.json();
    setBusy(null);
    if (j.ok) {
      setBanner(
        action === "approve" && j.passcode_plain
          ? `Approved · passcode ${j.passcode_plain} · email ${j.email?.ok ? "sent" : "skipped"}`
          : `${action} · email ${j.email?.ok ? "sent" : "skipped"}`
      );
      router.refresh();
    }
  };

  const columns: Column<RequestRow>[] = [
    {
      key: "email",
      header: "Requester",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name || r.email}</p>
          <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
            {r.email}{r.company ? ` · ${r.company}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.batch?.name ?? "—"}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
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
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.created_at).toLocaleDateString()}</span>,
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
                onClick={(e) => { e.stopPropagation(); act(r.id, "approve", r.email); }}
                disabled={busy === r.id}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
                style={{ color: "#16a34a", background: "rgba(16,185,129,0.08)" }}
              >
                <CheckCircle className="h-3 w-3" /> Approve
              </button>
            )}
            {canReject && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); act(r.id, "reject", r.email); }}
                disabled={busy === r.id}
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
          className="mb-3 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm animate-[fadeIn_0.3s_ease-out]"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", color: "#16a34a" }}
        >
          <span>{banner}</span>
          <button onClick={() => setBanner(null)} className="text-xs">Dismiss</button>
        </div>
      )}
      <DataTableSSR<RequestRow>
        columns={columns}
        rows={initial.rows}
        total={initial.total}
        page={initial.page}
        pageSize={initial.pageSize}
        search={initial.search}
        sort={initial.sort}
        activeFilters={initial.filters}
        searchPlaceholder="Search requesters…"
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "All status" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
              { value: "cancelled", label: "Cancelled" },
            ],
          },
        ]}
        rowKey={(r) => r.id}
        empty="No access requests yet."
      />
    </>
  );
}
