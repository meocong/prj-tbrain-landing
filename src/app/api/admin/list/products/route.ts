import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "products",
  permCode: "data.view",
  searchable: ["name", "slug"],
  defaultSort: { key: "created_at", dir: "desc" },
  sortWhitelist: ["created_at", "name", "slug", "is_active"],
  filters: {
    active: (v, q) => (v === "active" ? q.eq("is_active", true) : q.eq("is_active", false)),
  },
});
