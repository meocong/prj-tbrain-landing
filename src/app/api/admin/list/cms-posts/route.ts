import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "cms_posts",
  permCode: "content.view",
  searchable: ["title", "slug", "category", "author_name"],
  defaultSort: { key: "updated_at", dir: "desc" },
  sortWhitelist: ["updated_at", "created_at", "published_at", "title", "view_count", "status"],
  filters: {
    status: (v, q) => q.eq("status", v),
    category: (v, q) => q.eq("category", v),
  },
});
