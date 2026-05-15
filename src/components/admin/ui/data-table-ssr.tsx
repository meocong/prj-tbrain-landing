"use client";

import { useState, useEffect, useTransition, useMemo, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Search, X, ChevronLeft, ChevronRight, Loader2,
  ChevronDown, ChevronUp, ArrowUpDown,
} from "lucide-react";

export type Column<Row> = {
  key: string;
  header: string;
  render?: (row: Row) => ReactNode;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
};

export type FilterDef = {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
};

export type DataTableSSRProps<Row> = {
  /** Data fetched server-side; passed down as props. */
  rows: Row[];
  total: number;
  /** Current state reflected in URL searchParams (server passed these in). */
  page: number;
  pageSize: number;
  search: string;
  sort: { key: string; dir: "asc" | "desc" };
  filters?: FilterDef[];
  activeFilters?: Record<string, string>;

  columns: Column<Row>[];
  rowKey: (row: Row) => string;
  onRowClick?: (row: Row) => void;
  actions?: ReactNode;
  empty?: ReactNode;
  searchPlaceholder?: string;
};

export function DataTableSSR<Row>({
  rows,
  total,
  page,
  pageSize,
  search,
  sort,
  filters = [],
  activeFilters = {},
  columns,
  rowKey,
  onRowClick,
  actions,
  empty,
  searchPlaceholder = "Search…",
}: DataTableSSRProps<Row>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [localSearch, setLocalSearch] = useState(search);

  // Keep local search in sync when server updates the URL
  useEffect(() => { setLocalSearch(search); }, [search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const push = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  // Debounced search → URL
  useEffect(() => {
    if (localSearch === search) return;
    const t = setTimeout(() => push({ search: localSearch || null, page: "0" }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localSearch]);

  const handleSort = (key: string) => {
    if (sort.key === key) {
      push({ sort: key, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      push({ sort: key, dir: "desc" });
    }
  };

  const handleFilter = (key: string, value: string) => {
    push({ [key]: value === "all" ? null : value, page: "0" });
  };

  const handlePage = (p: number) => push({ page: String(p) });

  const hasToolbar = filters.length > 0 || actions || true; // always show (has search)
  const pendingClass = useMemo(() => (isPending ? "pointer-events-none opacity-60 transition-opacity" : "transition-opacity"), [isPending]);

  return (
    <div className="glass-card overflow-hidden">
      {hasToolbar && (
        <div
          className="flex flex-wrap items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
        >
          <div className="relative flex-1 min-w-[180px] max-w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            <input
              type="search"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg py-1.5 pr-8 text-sm outline-none transition-shadow"
              style={{
                paddingLeft: "2rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.boxShadow = "0 0 0 2px rgba(139,92,246,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.boxShadow = "";
              }}
            />
            {localSearch && (
              <button
                type="button"
                onClick={() => { setLocalSearch(""); push({ search: null, page: "0" }); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5"
                aria-label="Clear"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {filters.map((f) => (
            <div key={f.key} className="relative">
              <select
                value={activeFilters[f.key] ?? "all"}
                onChange={(e) => handleFilter(f.key, e.target.value)}
                className="appearance-none rounded-lg py-1.5 pr-7 pl-2.5 text-sm outline-none cursor-pointer"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                aria-label={f.label}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {f.label}: {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
            </div>
          ))}
          <div className="flex-1" />
          {isPending && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: "var(--color-brand-500)" }} />
          )}
          {actions}
        </div>
      )}

      <div className={`overflow-x-auto ${pendingClass}`}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {columns.map((c) => {
                const isSorted = sort.key === c.key;
                return (
                  <th
                    key={c.key}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide select-none"
                    style={{
                      color: isSorted ? "var(--text-primary)" : "var(--text-muted)",
                      width: c.width,
                      textAlign: c.align ?? "left",
                      cursor: c.sortable ? "pointer" : undefined,
                    }}
                    onClick={c.sortable ? () => handleSort(c.key) : undefined}
                  >
                    <span className="inline-flex items-center gap-1">
                      {c.header}
                      {c.sortable &&
                        (isSorted ? (
                          sort.dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  {empty ?? "No data"}
                </td>
              </tr>
            )}
            {rows.map((row, i) => {
              const id = rowKey(row);
              return (
                <tr
                  key={id}
                  onClick={onRowClick ? (e) => {
                    if ((e.target as HTMLElement).closest("input,button,a,select")) return;
                    onRowClick(row);
                  } : undefined}
                  className={`${onRowClick ? "cursor-pointer" : ""} animate-[fadeIn_0.3s_ease-out] stagger-${Math.min(i + 1, 6)}`}
                  style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                  onMouseEnter={onRowClick ? (e) => ((e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-input)") : undefined}
                  onMouseLeave={onRowClick ? (e) => ((e.currentTarget as HTMLTableRowElement).style.background = "") : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-3 py-2" style={{ color: "var(--text-primary)", textAlign: c.align ?? "left" }}>
                      {c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as ReactNode) ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between px-4 py-2.5 text-xs"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg-input)",
            color: "var(--text-muted)",
          }}
        >
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handlePage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1 transition disabled:opacity-40"
              style={{ color: "var(--text-primary)" }}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2">{page + 1} / {totalPages}</span>
            <button
              type="button"
              onClick={() => handlePage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-2 py-1 transition disabled:opacity-40"
              style={{ color: "var(--text-primary)" }}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
