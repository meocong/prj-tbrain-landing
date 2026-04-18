"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { CONTACT_STATUS_BADGE } from "@/lib/admin/constants";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Client } from "@/lib/admin/types";

const PAGE_SIZE = 20;

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts", search, statusFilter, page],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("clients")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%`
        );
      }
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, count } = await query;
      return { clients: (data ?? []) as Client[], total: count ?? 0 };
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
            Contacts
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {data?.total ?? 0} contacts
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-card mt-4 flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1" style={{ maxWidth: "320px" }}>
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search by name, email, company..."
            className="w-full rounded-lg py-2 pl-9 pr-8 text-sm"
            style={{
              backgroundColor: "var(--bg-input)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-default)",
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5"
            >
              <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            backgroundColor: "var(--bg-input)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-default)",
          }}
        >
          <option value="all">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              {["Name", "Email", "Company", "Source", "Status", "Created"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-4 py-3">
                    <div className="skeleton h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : data?.clients.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  No contacts found
                </td>
              </tr>
            ) : (
              data?.clients.map((c) => (
                <tr
                  key={c.id}
                  className="transition-colors"
                  style={{ borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <td className="px-4 py-3 font-medium" style={{ color: "var(--text-primary)" }}>
                    {c.full_name || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {c.email}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                    {c.company || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge badge-muted">{c.source || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${CONTACT_STATUS_BADGE[c.status ?? "new"] || "badge-muted"}`}>
                      {c.status || "new"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: "1px solid var(--border-default)" }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-ghost p-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-ghost p-1.5"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
