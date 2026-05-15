import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "access_requests",
  permCode: "requests.view",
  select: "*, batch:batches(slug, name), product:products(slug, name)",
  searchable: ["email", "full_name", "company"],
  defaultSort: { key: "requested_at", dir: "desc" },
  sortWhitelist: ["requested_at", "reviewed_at", "email", "status"],
  filters: {
    product_id: (v, q) => q.eq("product_id", v),
    status: (v, q) => q.eq("status", v),
  },
});
