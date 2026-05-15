import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "contact_submissions",
  permCode: "contacts.view",
  select: "*, client:clients(id, email, full_name)",
  searchable: ["email", "full_name", "company", "message"],
  defaultSort: { key: "created_at", dir: "desc" },
  sortWhitelist: ["created_at", "email", "source"],
  filters: {
    source: (v, q) => q.eq("source", v),
  },
});
