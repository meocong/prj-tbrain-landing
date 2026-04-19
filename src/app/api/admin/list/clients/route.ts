import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "clients",
  permCode: "contacts.view",
  searchable: ["email", "full_name", "company", "role"],
  defaultSort: { key: "created_at", dir: "desc" },
  sortWhitelist: ["created_at", "email", "full_name", "company", "status"],
  filters: {
    status: (v, q) => q.eq("status", v),
    source: (v, q) => q.eq("source", v),
  },
});
