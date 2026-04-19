"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useHasPermission } from "@/lib/admin/auth-context";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import { IssuePasscodeModal } from "@/components/admin/email/issue-passcode-modal";
import { KeyRound, Ban, User, Plus } from "lucide-react";
import type { Passcode } from "@/lib/admin/types";
import type { ListResult } from "@/lib/admin/server/list";

export function PasscodesClient({
  initial,
  productSlug,
  productId,
}: {
  initial: ListResult<Passcode>;
  productSlug: string;
  productId: string;
}) {
  const router = useRouter();
  const canRevoke = useHasPermission("passcodes.revoke");
  const canCreate = useHasPermission("passcodes.create");
  const [issueOpen, setIssueOpen] = useState(false);
  const [lastIssued, setLastIssued] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);

  const revoke = async (id: string, prefix: string) => {
    if (!confirm(`Revoke passcode TB-${prefix}-••••?`)) return;
    setRevoking(id);
    const res = await fetch(`/api/admin/passcodes/${id}/revoke`, { method: "POST" });
    const j = await res.json();
    if (j.ok) router.refresh();
    setRevoking(null);
  };

  const columns: Column<Passcode>[] = [
    {
      key: "passcode_prefix",
      header: "Passcode",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <KeyRound className="h-3.5 w-3.5" style={{ color: "var(--color-brand-500)" }} />
          <code className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
            TB-{r.passcode_prefix}-••••
          </code>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (r) =>
        r.client_id ? (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--color-brand-500)" }}>
            <User className="h-3 w-3" /> Per-client
          </span>
        ) : (
          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
            Shared
          </span>
        ),
    },
    {
      key: "label",
      header: "Label / Client",
      render: (r) =>
        r.client ? (
          <div className="min-w-0">
            <p className="truncate text-sm" style={{ color: "var(--text-primary)" }}>{r.client.email}</p>
            {r.client.company && <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>{r.client.company}</p>}
          </div>
        ) : (
          <span className="text-sm" style={{ color: "var(--text-primary)" }}>{r.label ?? "—"}</span>
        ),
    },
    {
      key: "batch",
      header: "Batch",
      render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.batch?.name ?? r.batch?.slug ?? "—"}</span>,
    },
    {
      key: "use_count",
      header: "Uses",
      align: "right",
      sortable: true,
      render: (r) => (
        <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
          {r.use_count}{r.max_uses != null ? `/${r.max_uses}` : ""}
        </span>
      ),
    },
    {
      key: "issued_at",
      header: "Issued",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.issued_at).toLocaleDateString()}</span>,
    },
    {
      key: "expires_at",
      header: "Status",
      sortable: true,
      render: (r) => {
        if (r.revoked_at) return <span className="text-xs" style={{ color: "#dc2626" }}>Revoked</span>;
        if (r.expires_at && new Date(r.expires_at) < new Date())
          return <span className="text-xs" style={{ color: "#ca8a04" }}>Expired</span>;
        return <span className="text-xs" style={{ color: "#16a34a" }}>Active</span>;
      },
    },
    ...(canRevoke
      ? [
          {
            key: "actions",
            header: "",
            align: "right" as const,
            render: (r: Passcode) =>
              r.revoked_at ? null : (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); revoke(r.id, r.passcode_prefix); }}
                  disabled={revoking === r.id}
                  className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs"
                  style={{ color: "#dc2626", background: "rgba(239,68,68,0.08)" }}
                >
                  <Ban className="h-3 w-3" /> Revoke
                </button>
              ),
          },
        ]
      : []),
  ];

  return (
    <>
      {lastIssued && (
        <div
          className="mb-3 flex items-center justify-between rounded-lg px-4 py-2.5 text-sm animate-[fadeIn_0.3s_ease-out]"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)", color: "#16a34a" }}
        >
          <span>Passcode issued: <code className="font-mono">{lastIssued}</code></span>
          <button onClick={() => setLastIssued(null)} className="text-xs">Dismiss</button>
        </div>
      )}
      <IssuePasscodeModal
        open={issueOpen}
        productSlug={productSlug}
        productId={productId}
        onClose={() => setIssueOpen(false)}
        onIssued={(r) => {
          setLastIssued(r.passcode_plain);
          router.refresh();
        }}
      />
      <DataTableSSR<Passcode>
        columns={columns}
        rows={initial.rows}
        total={initial.total}
        page={initial.page}
        pageSize={initial.pageSize}
        search={initial.search}
        sort={initial.sort}
        activeFilters={initial.filters}
        searchPlaceholder="Search by prefix or label…"
        actions={
          canCreate ? (
            <button type="button" onClick={() => setIssueOpen(true)} className="btn-primary text-xs">
              <Plus className="h-3.5 w-3.5" /> Issue passcode
            </button>
          ) : null
        }
        filters={[
          {
            key: "type",
            label: "Type",
            options: [
              { value: "all", label: "All types" },
              { value: "per_client", label: "Per-client" },
              { value: "shared", label: "Shared" },
            ],
          },
          {
            key: "status",
            label: "Status",
            options: [
              { value: "all", label: "All" },
              { value: "active", label: "Active only" },
              { value: "expired", label: "Expired" },
              { value: "revoked", label: "Revoked" },
            ],
          },
        ]}
        rowKey={(r) => r.id}
        empty="No passcodes for this product yet."
      />
    </>
  );
}
