"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { DataTable, type Column } from "@/components/admin/ui/data-table";
import type { NewsletterSubscriber } from "@/lib/admin/types";

const PAGE_SIZE = 30;

export default function NewsletterPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [state, setState] = useState("subscribed");

  const { data, isLoading } = useQuery({
    queryKey: ["newsletter", search, state, page],
    queryFn: async () => {
      let q = supabaseAdmin
        .from("newsletter_subscribers")
        .select("*", { count: "exact" })
        .order("subscribed_at", { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (search) q = q.ilike("email", `%${search}%`);
      if (state === "subscribed") q = q.is("unsubscribed_at", null);
      if (state === "unsubscribed") q = q.not("unsubscribed_at", "is", null);
      const { data, count } = await q;
      return { rows: (data ?? []) as NewsletterSubscriber[], total: count ?? 0 };
    },
  });

  const columns: Column<NewsletterSubscriber>[] = [
    {
      key: "email",
      header: "Subscriber",
      render: (r) => (
        <div>
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>
            {r.full_name || r.email}
          </p>
          {r.full_name && (
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {r.email}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {r.source ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) =>
        r.unsubscribed_at ? (
          <span className="text-xs" style={{ color: "#dc2626" }}>Unsubscribed</span>
        ) : (
          <span className="text-xs" style={{ color: "#16a34a" }}>Subscribed</span>
        ),
    },
    {
      key: "subscribed_at",
      header: "Since",
      render: (r) => (
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {new Date(r.subscribed_at).toLocaleDateString()}
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
          Newsletter
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Everyone who opted in from the landing footer / blog signup.
        </p>
      </div>

      <DataTable<NewsletterSubscriber>
        columns={columns}
        rows={data?.rows ?? []}
        total={data?.total ?? 0}
        page={page}
        pageSize={PAGE_SIZE}
        loading={isLoading}
        search={search}
        searchPlaceholder="Search by email…"
        filters={[
          {
            key: "state",
            label: "State",
            value: state,
            options: [
              { value: "subscribed", label: "Subscribed" },
              { value: "unsubscribed", label: "Unsubscribed" },
              { value: "all", label: "All" },
            ],
          },
        ]}
        onSearchChange={(v) => { setSearch(v); setPage(0); }}
        onFilterChange={(_, v) => { setState(v); setPage(0); }}
        onPageChange={setPage}
        rowKey={(r) => r.id}
      />
    </div>
  );
}
