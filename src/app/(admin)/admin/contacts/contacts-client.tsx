"use client";

import { useRouter } from "next/navigation";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import type { EnrichedContact, ContactTag } from "@/lib/admin/server/contacts";

const TAG_META: Record<ContactTag, { label: string; color: string; bg: string }> = {
  client:     { label: "Client",     color: "var(--text-secondary)", bg: "var(--bg-input)" },
  form:       { label: "Form",       color: "#3B82F6",               bg: "rgba(59,130,246,0.1)" },
  newsletter: { label: "Newsletter", color: "#F59E0B",               bg: "rgba(245,158,11,0.1)" },
  request:    { label: "Requested",  color: "var(--color-brand-500)",bg: "rgba(108,60,244,0.1)" },
  passcode:   { label: "Has code",   color: "#16a34a",               bg: "rgba(16,185,129,0.1)" },
};

export function ContactsClient({
  rows,
  total,
  page,
  pageSize,
  search,
  tagFilter,
  sortKey,
  sortDir,
}: {
  rows: EnrichedContact[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  tagFilter: string;
  sortKey: string;
  sortDir: "asc" | "desc";
}) {
  const router = useRouter();

  const columns: Column<EnrichedContact>[] = [
    {
      key: "email",
      header: "Contact",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0"
            style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
          >
            {(r.full_name ?? r.email)[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>{r.full_name ?? r.email.split("@")[0]}</p>
            <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{r.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.company ?? "—"}</span>,
    },
    {
      key: "tags",
      header: "Sources",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.tags.filter((t) => t !== "client").map((t) => {
            const m = TAG_META[t];
            return (
              <span key={t} className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{ background: m.bg, color: m.color }}>
                {m.label}
              </span>
            );
          })}
          {r.tags.filter((t) => t !== "client").length === 0 && (
            <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>Manual</span>
          )}
        </div>
      ),
    },
    {
      key: "last_activity",
      header: "Last activity",
      sortable: true,
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {r.last_activity ? new Date(r.last_activity).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Added",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-muted)" }}>{new Date(r.created_at).toLocaleDateString()}</span>,
    },
  ];

  return (
    <DataTableSSR<EnrichedContact>
      columns={columns}
      rows={rows}
      total={total}
      page={page}
      pageSize={pageSize}
      search={search}
      sort={{ key: sortKey, dir: sortDir }}
      activeFilters={{ tag: tagFilter === "all" ? "" : tagFilter }}
      searchPlaceholder="Search by email, name, or company…"
      filters={[
        {
          key: "tag",
          label: "Source",
          options: [
            { value: "all", label: "All" },
            { value: "form", label: "Contact form" },
            { value: "newsletter", label: "Newsletter" },
            { value: "request", label: "Data request" },
            { value: "passcode", label: "Has passcode" },
          ],
        },
      ]}
      rowKey={(r) => r.id}
      onRowClick={(r) => router.push(`/admin/contacts/${r.id}`)}
    />
  );
}
