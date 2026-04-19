import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "batches",
  permCode: "data.view",
  select: "*",
  searchable: ["name", "slug"],
  defaultSort: { key: "created_at", dir: "desc" },
  sortWhitelist: ["created_at", "name", "slug"],
  filters: {
    product_id: (v, q) => q.eq("product_id", v),
  },
});
