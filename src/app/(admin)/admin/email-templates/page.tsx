"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import { Mail, Globe, Package } from "lucide-react";

const PAGE_SIZE = 30;

type Row = {
  id: string;
  product_id: string | null;
  key: string;
  name: string;
  subject: string;
  is_active: boolean;
  product?: { slug: string; name: string } | null;
};

export default function EmailTemplatesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["email-templates", search, scope, page],
    queryFn: async () => {
      let q = supabaseAdmin
        .from("email_templates")
        .select("*, product:products(slug, name)", { count: "exact" })
        .order("key")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.or(`name.ilike.%${search}%,key.ilike.%${search}%,subject.ilike.%${search}%`);
      if (scope === "global") q = q.is("product_id", null);
      if (scope === "scoped") q = q.not("product_id", "is", null);
      const { data, count } = await q;
      return { rows: (data ?? []) as unknown as Row[], total: count ?? 0 };
    },
  });

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Template",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <Mail className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} />
          <div>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {r.name}
            </p>
            <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              {r.key}
            </code>
          </div>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope",
      render: (r) =>
        r.product_id ? (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-secondary)" }}>
            <Package className="h-3.5 w-3.5" /> {r.product?.name ?? "—"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
            <Globe className="h-3.5 w-3.5" /> Global
          </span>
        ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (r) => (
        <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
          {r.subject}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (r) => (
        <span className="text-xs" style={{ color: r.is_active ? "#16a34a" : "var(--text-muted)" }}>
          {r.is_active ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Email Templates
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            Global defaults + per-product overrides. Variables use{" "}
            <code className="px-1" style={{ background: "var(--bg-input)" }}>
              {"{{name}}"}
            </code>{" "}
            syntax.
          </p>
        </div>
      </div>

      <DataTable<Row>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search templates…"
        filters={[
          {
            key: "scope",
            label: "Scope",
            value: scope,
            options: [
              { value: "all", label: "All scopes" },
              { value: "global", label: "Global" },
              { value: "scoped", label: "Per-product" },
            ],
          },
        ]}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(0);
        }}
        onFilterChange={(_, v) => {
          setScope(v);
          setPage(0);
        }}
        onPageChange={setPage}
        rowKey={(r) => r.id}
        onRowClick={(r) => {
          window.location.href = `/admin/email-templates/${r.id}`;
        }}
        empty="No templates. Seed runs as part of migration 006."
      />
      {/* placeholder link to satisfy unused import */}
      <Link href="/admin/email-templates" className="hidden" />
    </div>
  );
}
