import "server-only";
import { NextResponse } from "next/server";
import { createAdminServerClient } from "@/lib/admin/supabase-server";
import { getAdminUser, hasPermission } from "@/lib/admin/permissions";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryBuilder = any;

export type ListHandlerConfig = {
  /** Table name in tbrain_landing schema */
  table: string;
  /** Permission code required to list this resource */
  permCode: string;
  /** PostgREST select string (supports joins like "*, client:clients(email)") */
  select?: string;
  /** Columns OR'd together for ?search= */
  searchable?: string[];
  /** Default sort applied when ?sort= is missing */
  defaultSort?: { key: string; dir: "asc" | "desc" };
  /** Columns allowed in ?sort= (prevents SQL surface abuse) */
  sortWhitelist?: string[];
  /** Custom filter transformers keyed by query param. Return the new q or undefined to leave as-is. */
  filters?: Record<string, (value: string, q: QueryBuilder) => QueryBuilder | undefined>;
  /** Optional post-processor on the raw result rows (e.g. merge stats) */
  enrich?: (rows: Record<string, unknown>[]) => Promise<Record<string, unknown>[]> | Record<string, unknown>[];
};

/** Standard admin list handler — auth + permission check, pagination, sort, search, filters. */
export function makeAdminListHandler(cfg: ListHandlerConfig) {
  return async function GET(req: Request) {
    const supa = await createAdminServerClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const admin = await getAdminUser(user.email);
    if (!admin) return NextResponse.json({ error: "not_admin" }, { status: 403 });
    if (!hasPermission(admin, cfg.permCode))
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const url = new URL(req.url);
    const page = Math.max(0, Number(url.searchParams.get("page") ?? 0));
    const pageSize = Math.min(200, Math.max(1, Number(url.searchParams.get("pageSize") ?? 30)));
    const search = (url.searchParams.get("search") ?? "").trim();
    const sortKey = url.searchParams.get("sort") ?? cfg.defaultSort?.key ?? "created_at";
    const sortDir = (url.searchParams.get("dir") ?? cfg.defaultSort?.dir ?? "desc") === "asc" ? "asc" : "desc";

    const db = supabaseAdmin();
    let q = db
      .from(cfg.table)
      .select(cfg.select ?? "*", { count: "exact" })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    // Sort — enforce whitelist if provided
    const allowSort = cfg.sortWhitelist ? cfg.sortWhitelist.includes(sortKey) : true;
    if (allowSort) {
      q = q.order(sortKey, { ascending: sortDir === "asc" });
    }

    // Search
    if (search && cfg.searchable?.length) {
      const escaped = search.replace(/[%,()]/g, "");
      q = q.or(cfg.searchable.map((c) => `${c}.ilike.%${escaped}%`).join(","));
    }

    // Custom filters
    for (const [key, transform] of Object.entries(cfg.filters ?? {})) {
      const v = url.searchParams.get(key);
      if (v !== null && v !== "" && v !== "all") {
        const nextQ = transform(v, q as QueryBuilder);
        if (nextQ) q = nextQ;
      }
    }

    const { data, count, error } = await q;
    if (error) {
      console.error(`[admin/${cfg.table}] query error:`, error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let rows = (data ?? []) as unknown as Record<string, unknown>[];
    if (cfg.enrich) rows = await cfg.enrich(rows);

    return NextResponse.json({ ok: true, rows, total: count ?? 0 });
  };
}

/** Fetch a single row by id (or slug) with permission check. */
export function makeAdminGetHandler(cfg: {
  table: string;
  permCode: string;
  select?: string;
  keyColumn?: string;
}) {
  return async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
    const { id } = await ctx.params;
    const supa = await createAdminServerClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user?.email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const admin = await getAdminUser(user.email);
    if (!admin || !hasPermission(admin, cfg.permCode))
      return NextResponse.json({ error: "forbidden" }, { status: 403 });

    const db = supabaseAdmin();
    const keyCol = cfg.keyColumn ?? "id";
    const { data, error } = await db
      .from(cfg.table)
      .select(cfg.select ?? "*")
      .eq(keyCol, id)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, row: data });
  };
}
