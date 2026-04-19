/** Client-side helpers for calling the server admin list APIs. */

export type ListResponse<T> = { ok: true; rows: T[]; total: number } | { ok: false; error: string };

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  dir?: "asc" | "desc";
  [extra: string]: string | number | boolean | null | undefined;
};

function toQuery(params: ListParams): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    p.set(k, String(v));
  }
  return p.toString();
}

export async function listAdminResource<T>(
  resource: string,
  params: ListParams = {}
): Promise<{ rows: T[]; total: number }> {
  const url = `/api/admin/list/${resource}${toQuery(params) ? `?${toQuery(params)}` : ""}`;
  const res = await fetch(url);
  const j = (await res.json()) as ListResponse<T>;
  if (!j.ok) throw new Error(j.error);
  return { rows: j.rows, total: j.total };
}
