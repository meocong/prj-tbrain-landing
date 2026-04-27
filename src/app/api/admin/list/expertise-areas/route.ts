import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "expertise_areas",
  permCode: "content.view",
  searchable: ["label", "detail"],
  defaultSort: { key: "display_order", dir: "asc" },
  sortWhitelist: ["display_order", "label", "updated_at", "is_active"],
  filters: {
    is_active: (v, q) => q.eq("is_active", v === "true"),
  },
});
