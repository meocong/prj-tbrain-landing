"use client";

import { useState } from "react";
import { DataTableSSR, type Column } from "@/components/admin/ui/data-table-ssr";
import {
  SAMPLE_TYPE_META, SamplePreviewCell, SampleDetailRenderer,
  type SampleRow, type SampleType,
} from "@/components/admin/samples/renderers";
import type { ListResult } from "@/lib/admin/server/list";
import { X } from "lucide-react";

type BatchOption = { id: string; name: string };

export function SamplesClient({
  initial,
  batches,
}: {
  initial: ListResult<SampleRow>;
  batches: BatchOption[];
}) {
  const [detail, setDetail] = useState<SampleRow | null>(null);

  const columns: Column<SampleRow>[] = [
    {
      key: "title",
      header: "Sample",
      sortable: true,
      render: (r) => (
        <div className="min-w-0">
          <p className="truncate font-medium" style={{ color: "var(--text-primary)" }}>{r.title}</p>
          <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>{r.slug}</code>
        </div>
      ),
    },
    { key: "sample_type", header: "Type", sortable: true, render: (r) => <SamplePreviewCell row={r} /> },
    {
      key: "difficulty",
      header: "Difficulty",
      sortable: true,
      render: (r) =>
        r.difficulty ? (
          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}>
            {r.difficulty}
          </span>
        ) : <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>—</span>,
    },
    {
      key: "category",
      header: "Category",
      sortable: true,
      render: (r) => <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.category ?? "—"}</span>,
    },
  ];

  return (
    <>
      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setDetail(null)}
        >
          <div
            className="glass-card w-full max-w-3xl my-8 animate-[scaleIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
            >
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>{detail.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <SamplePreviewCell row={detail} />
                  <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>{detail.slug}</code>
                </div>
              </div>
              <button onClick={() => setDetail(null)} aria-label="Close">
                <X className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
            <div className="p-5">
              <SampleDetailRenderer row={detail} />
            </div>
          </div>
        </div>
      )}
      <DataTableSSR<SampleRow>
        columns={columns}
        rows={initial.rows}
        total={initial.total}
        page={initial.page}
        pageSize={initial.pageSize}
        search={initial.search}
        sort={initial.sort}
        activeFilters={initial.filters}
        searchPlaceholder="Search samples…"
        filters={[
          {
            key: "sample_type",
            label: "Type",
            options: [
              { value: "all", label: "All types" },
              ...Object.entries(SAMPLE_TYPE_META).map(([v, m]) => ({ value: v as SampleType, label: m.label })),
            ],
          },
          {
            key: "batch_id",
            label: "Batch",
            options: [
              { value: "all", label: "All batches" },
              ...batches.map((b) => ({ value: b.id, label: b.name })),
            ],
          },
        ]}
        rowKey={(r) => r.id}
        onRowClick={(r) => setDetail(r)}
        empty="No samples for this product yet."
      />
    </>
  );
}
