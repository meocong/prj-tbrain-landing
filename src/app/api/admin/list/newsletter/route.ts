import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "newsletter_subscribers",
  permCode: "contacts.view",
  searchable: ["email", "full_name"],
  defaultSort: { key: "subscribed_at", dir: "desc" },
  sortWhitelist: ["subscribed_at", "unsubscribed_at", "email"],
  filters: {
    state: (v, q) => (v === "subscribed" ? q.is("unsubscribed_at", null) : q.not("unsubscribed_at", "is", null)),
  },
});
