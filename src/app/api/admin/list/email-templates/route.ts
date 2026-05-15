import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "email_templates",
  permCode: "content.view",
  select: "*, product:products(slug, name)",
  searchable: ["name", "key", "subject"],
  defaultSort: { key: "key", dir: "asc" },
  sortWhitelist: ["key", "name", "updated_at", "is_active"],
  filters: {
    scope: (v, q) => (v === "global" ? q.is("product_id", null) : q.not("product_id", "is", null)),
    product_id: (v, q) => {
      if (v === "any") return q;
      return q.or(`product_id.eq.${v},product_id.is.null`);
    },
  },
});
