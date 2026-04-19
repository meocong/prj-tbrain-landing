"use client";

import { useState, useEffect, useMemo, type ReactNode } from "react";
import { Search, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

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
  value: string;
  options: Array<{ value: string; label: string }>;
};

export type DataTableProps<Row> = {
  columns: Column<Row>[];
  rows: Row[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  search?: string;
  searchPlaceholder?: string;
  filters?: FilterDef[];
  onSearchChange?: (value: string) => void;
  onFilterChange?: (key: string, value: string) => void;
  onPageChange: (page: number) => void;
  onRowClick?: (row: Row) => void;
  rowKey: (row: Row) => string;
  actions?: ReactNode;
  empty?: ReactNode;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectedChange?: (ids: Set<string>) => void;
  bulkActions?: ReactNode;
};

export function DataTable<Row>({
  columns,
  rows,
  total,
  page,
  pageSize,
  loading,
  search,
  searchPlaceholder = "Search…",
  filters = [],
  onSearchChange,
  onFilterChange,
  onPageChange,
  onRowClick,
  rowKey,
  actions,
  empty,
  selectable = false,
  selectedIds,
  onSelectedChange,
  bulkActions,
}: DataTableProps<Row>) {
  const [localSearch, setLocalSearch] = useState(search ?? "");

  // Debounce search input → parent
  useEffect(() => {
    if (!onSearchChange) return;
    const t = setTimeout(() => {
      if (localSearch !== search) onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(t);
  }, [localSearch, onSearchChange, search]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasToolbar = onSearchChange || filters.length > 0 || actions;
  const selectedCount = selectedIds?.size ?? 0;

  const allVisibleSelected = useMemo(() => {
    if (!selectable || rows.length === 0) return false;
    return rows.every((r) => selectedIds?.has(rowKey(r)));
  }, [rows, rowKey, selectable, selectedIds]);

  const toggleAll = () => {
    if (!onSelectedChange) return;
    const next = new Set(selectedIds ?? []);
    if (allVisibleSelected) {
      rows.forEach((r) => next.delete(rowKey(r)));
    } else {
      rows.forEach((r) => next.add(rowKey(r)));
    }
    onSelectedChange(next);
  };

  const toggleOne = (id: string) => {
    if (!onSelectedChange) return;
    const next = new Set(selectedIds ?? []);
    next.has(id) ? next.delete(id) : next.add(id);
    onSelectedChange(next);
  };

  return (
    <div className="glass-card overflow-hidden">
      {hasToolbar && (
        <div
          className="flex flex-wrap items-center gap-2 px-4 py-2.5"
          style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-input)" }}
        >
          {onSearchChange && (
            <div className="relative flex-1 min-w-[180px] max-w-[280px]">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md py-1.5 pl-8 pr-7 text-sm outline-none"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  aria-label="Clear"
                >
                  <X className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
                </button>
              )}
            </div>
          )}
          {filters.map((f) => (
            <select
              key={f.key}
              value={f.value}
              onChange={(e) => onFilterChange?.(f.key, e.target.value)}
              className="rounded-md py-1.5 px-2 text-sm outline-none cursor-pointer"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              aria-label={f.label}
            >
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ))}
          <div className="flex-1" />
          {selectedCount > 0 && bulkActions ? (
            <div className="flex items-center gap-2">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {selectedCount} selected
              </span>
              {bulkActions}
            </div>
          ) : (
            actions
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              {selectable && (
                <th className="w-10 px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAll}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2 text-xs font-semibold uppercase tracking-wide"
                  style={{
                    color: "var(--text-muted)",
                    width: c.width,
                    textAlign: c.align ?? "left",
                  }}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-3 py-12 text-center">
                  <Loader2
                    className="mx-auto h-5 w-5 animate-spin"
                    style={{ color: "var(--color-brand-500)" }}
                  />
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-3 py-10 text-center text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  {empty ?? "No data"}
                </td>
              </tr>
            )}
            {rows.map((row) => {
              const id = rowKey(row);
              const isSelected = selectedIds?.has(id) ?? false;
              return (
                <tr
                  key={id}
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest("input,button,a,select")) return;
                    onRowClick?.(row);
                  }}
                  className={onRowClick ? "cursor-pointer" : ""}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    background: isSelected ? "var(--sidebar-active-bg)" : undefined,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick && !isSelected) {
                      (e.currentTarget as HTMLTableRowElement).style.background = "var(--bg-input)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLTableRowElement).style.background = "";
                    }
                  }}
                >
                  {selectable && (
                    <td className="w-10 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleOne(id)}
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className="px-3 py-2"
                      style={{
                        color: "var(--text-primary)",
                        textAlign: c.align ?? "left",
                      }}
                    >
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
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="rounded px-2 py-1 transition disabled:opacity-40"
              style={{ color: "var(--text-primary)" }}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="px-2">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="rounded px-2 py-1 transition disabled:opacity-40"
              style={{ color: "var(--text-primary)" }}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
