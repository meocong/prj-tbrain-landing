"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

const PAGE_SIZE = 50;

const EVENT_TYPES = [
  "all",
  "enter_success",
  "enter_fail",
  "view_sample",
  "view_file",
  "view_tests",
  "view_solution",
  "download_sample_zip",
  "download_batch_zip",
];

export default function AuditPage() {
  const [eventType, setEventType] = useState("all");
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit", eventType, page],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("access_events")
        .select("*, client:clients(email, full_name)", { count: "exact" })
        .order("occurred_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (eventType !== "all") {
        query = query.eq("event_type", eventType);
      }

      const { data, count } = await query;
      return { events: data ?? [], total: count ?? 0 };
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
            Audit Log
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {data?.total ?? 0} events
          </p>
        </div>
        <button className="btn-secondary" title="Export CSV">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Filter */}
      <div className="glass-card mt-4 flex flex-wrap items-center gap-3 p-3">
        <select
          value={eventType}
          onChange={(e) => { setEventType(e.target.value); setPage(0); }}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ backgroundColor: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-default)" }}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Events" : t.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
              {["Time", "Client", "Event", "Sample", "File", "IP"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="skeleton h-5 w-full" /></td></tr>
              ))
            ) : data?.events.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                  No events found
                </td>
              </tr>
            ) : (
              data?.events.map((e: Record<string, unknown>) => {
                const client = e.client as { email: string; full_name: string | null } | null;
                return (
                  <tr key={e.id as number} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(e.occurred_at as string).toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {client?.email || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="badge badge-info text-[10px]">
                        {(e.event_type as string).replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="max-w-[120px] truncate px-4 py-2.5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {(e.sample_id as string)?.slice(0, 8) || "—"}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-2.5 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>
                      {(e.file_path as string) || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs" style={{ color: "var(--text-muted)" }}>
                      {(e.ip as string) || "—"}
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
