import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "services",
  permCode: "content.view",
  searchable: ["title", "slug", "description"],
  defaultSort: { key: "display_order", dir: "asc" },
  sortWhitelist: ["display_order", "title", "updated_at", "is_active"],
  filters: {
    is_active: (v, q) => q.eq("is_active", v === "true"),
  },
});
