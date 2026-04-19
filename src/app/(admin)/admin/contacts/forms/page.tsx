"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import type { ContactSubmission } from "@/lib/admin/types";

const PAGE_SIZE = 30;

export default function ContactFormsPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["contact-forms", search, source, page],
    queryFn: async () => {
      let q = supabaseAdmin
        .from("contact_submissions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`email.ilike.%${search}%,full_name.ilike.%${search}%,company.ilike.%${search}%,message.ilike.%${search}%`);
      if (source !== "all") q = q.eq("source", source);
      const { data, count } = await q;
      return { rows: (data ?? []) as ContactSubmission[], total: count ?? 0 };
    },
  });

  const columns: Column<ContactSubmission>[] = [
    {
      key: "email",
      header: "Sender",
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
      key: "source",
      header: "Source",
      render: (r) => (
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
          style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
        >
          {r.source}
        </span>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (r) => (
        <span
          className="block text-xs truncate max-w-md"
          style={{ color: "var(--text-secondary)" }}
          title={r.message}
        >
          {r.message}
        </span>
      ),
    },
    {
      key: "client_id",
      header: "Linked",
      render: (r) => (r.client_id ? <span className="text-xs" style={{ color: "#16a34a" }}>Yes</span> : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>),
    },
    {
      key: "created_at",
      header: "Received",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.created_at).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Contact Forms
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Raw submissions from every form on the landing — /contact, data request forms, demo requests, etc.
        </p>
      </div>

      <DataTable<ContactSubmission>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search forms…"
        filters={[
          {
            key: "source",
            label: "Source",
            value: source,
            options: [
              { value: "all", label: "All sources" },
              { value: "contact_form", label: "Contact form" },
              { value: "data_request", label: "Data request" },
              { value: "demo", label: "Demo request" },
            ],
          },
        ]}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onFilterChange={(_, v) => { setSource(v); setPage(0); }}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => { window.location.href = `/admin/contacts/forms/${r.id}`; }}
      />
    </div>
  );
}
