"use client";

import Link from "next/link";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { ListResult } from "@/lib/admin/server/list";
import type { ChatSessionRow } from "./page";

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function shortUA(ua: string | null): string {
  if (!ua) return "—";
  if (/iPhone|Android|Mobile/i.test(ua)) return "Mobile";
  if (/Chrome/.test(ua)) return "Chrome";
  if (/Firefox/.test(ua)) return "Firefox";
  if (/Safari/.test(ua)) return "Safari";
  if (/Edg/.test(ua)) return "Edge";
  return "Other";
}

export function ChatsClient({ initial }: { initial: ListResult<ChatSessionRow> }) {
  const columns: Column<ChatSessionRow>[] = [
    {
      key: "id",
      header: "Session",
      render: (r) => (
        <Link
          href={`/admin/chats/${r.id}`}
          className="text-xs font-mono"
          style={{ color: "var(--color-brand-500)" }}
        >
          {r.id.slice(0, 8)}…
        </Link>
      ),
    },
    {
      key: "message_count",
      header: "Messages",
      sortable: true,
      render: (r) => (
        <span className="text-sm" style={{ color: "var(--text-primary)" }}>
          {r.message_count}
        </span>
      ),
    },
    {
      key: "ip",
      header: "IP",
      render: (r) => (
        <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>
          {r.ip ?? "—"}
        </code>
      ),
    },
    {
      key: "user_agent",
      header: "Browser",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {shortUA(r.user_agent)}
        </span>
      ),
    },
    {
      key: "last_message_at",
      header: "Last activity",
      sortable: true,
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {formatRelative(r.last_message_at)}
        </span>
      ),
    },
    {
      key: "started_at",
      header: "Started",
      sortable: true,
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.started_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <DataTableSSR<ChatSessionRow>
      columns={columns}
      rows={initial.rows}
      total={initial.total}
      page={initial.page}
      pageSize={initial.pageSize}
      search={initial.search}
      sort={initial.sort}
      activeFilters={initial.filters}
      searchPlaceholder="Search by IP or visitor id…"
      filters={[
        {
          key: "range",
          label: "Range",
          options: [
            { value: "all", label: "All time" },
            { value: "24h", label: "Last 24h" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
    />
  );
}
