import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "samples",
  permCode: "data.view",
  select: "id, batch_id, slug, title, difficulty, category, sample_type, payload, batches!inner(product_id)",
  searchable: ["title", "slug"],
  defaultSort: { key: "slug", dir: "asc" },
  sortWhitelist: ["slug", "title", "difficulty", "category", "sample_type"],
  filters: {
    product_id: (v, q) => q.eq("batches.product_id", v),
    batch_id: (v, q) => q.eq("batch_id", v),
    sample_type: (v, q) => q.eq("sample_type", v),
  },
});
