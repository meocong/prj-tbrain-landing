"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { GRANT_STATUS_BADGE } from "@/lib/admin/constants";
import { Search, X, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useHasPermission } from "@/lib/admin/auth-context";

const PAGE_SIZE = 20;

function grantStatus(grant: { revoked_at: string | null; expires_at: string | null }): string {
  if (grant.revoked_at) return "revoked";
  if (grant.expires_at && new Date(grant.expires_at) < new Date()) return "expired";
  return "active";
}

export default function PasscodesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const canCreate = useHasPermission("passcodes.create");
  const canRevoke = useHasPermission("passcodes.revoke");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-passcodes", search, page],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("passcodes")
        .select("*, client:clients(email, full_name, company)", { count: "exact" })
        .order("issued_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        // Search by client email through a workaround or filter on passcode_prefix
        query = query.ilike("passcode_prefix", `%${search.toUpperCase()}%`);
      }

      const { data, count } = await query;
      return { grants: data ?? [], total: count ?? 0 };
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (grantId: string) => {
      const { error } = await supabaseAdmin
        .from("passcodes")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", grantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-passcodes"] });
    },
  });

  const totalPages = Math.ceil((data?.total ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
          >
            Data Access / Passcodes
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {data?.total ?? 0} passcodes issued
          </p>
        </div>
        {canCreate && (
          <a href="/admin/passcodes/create" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Passcode
          </a>
        )}
      </div>

      {/* Filter */}
      <div className="glass-card mt-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1" style={{ maxWidth: "320px" }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by passcode prefix..."
            className="w-full rounded-lg py-2 pl-9 pr-8 text-sm"
            style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5">
              <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              {["Client", "Prefix", "Uses", "Status", "Issued", "Expires", "Actions"].map((h) => (
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
            ) : data?.grants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  No passcodes found
                </td>
              </tr>
            ) : (
              data?.grants.map((g: Record<string, unknown>) => {
                const status = grantStatus(g as { revoked_at: string | null; expires_at: string | null });
                const client = g.client as { email: string; full_name: string | null; company: string | null } | null;
                return (
                  <tr key={g.id as string} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                      <div className="font-medium">{client?.full_name || "—"}</div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>{client?.email || "—"}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {g.passcode_prefix as string}****
                    </td>
                    <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                      {g.use_count as number}{g.max_uses ? ` / ${g.max_uses}` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${GRANT_STATUS_BADGE[status] || "badge-muted"}`}>{status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(g.issued_at as string).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                      {g.expires_at ? new Date(g.expires_at as string).toLocaleDateString() : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      {canRevoke && status === "active" && (
                        <button
                          onClick={() => revokeMutation.mutate(g.id as string)}
                          className="btn-ghost text-xs"
                          style={{ color: "var(--color-error)" }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
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
