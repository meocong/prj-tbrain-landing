"use client";

import Link from "next/link";

export type CaseStudyBlockRow = {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  display_order: number;
  is_active: boolean;
  updated_at: string;
};

export function CaseStudyBlocksClient({
  caseStudyId,
  rows,
}: {
  caseStudyId: string;
  rows: CaseStudyBlockRow[];
}) {
  if (!rows.length) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No widgets yet. Add the first block to start composing this detail page.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {["Order", "Type", "Title", "Status", "Updated"].map((header) => (
                <th key={header} className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td className="px-3 py-3 font-mono text-xs" style={{ color: "var(--text-muted)" }}>{row.display_order}</td>
                <td className="px-3 py-3">
                  <code className="text-[11px]" style={{ color: "var(--text-muted)" }}>{row.type}</code>
                </td>
                <td className="px-3 py-3">
                  <Link href={`/admin/case-studies/${caseStudyId}/blocks/${row.id}`} className="font-medium hover:underline" style={{ color: "var(--text-primary)" }}>
                    {row.title || row.subtitle || "Untitled widget"}
                  </Link>
                </td>
                <td className="px-3 py-3">
                  <span className={row.is_active ? "badge-success" : "badge-muted"}>
                    {row.is_active ? "Active" : "Hidden"}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs" style={{ color: "var(--text-muted)" }}>
                  {new Date(row.updated_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
