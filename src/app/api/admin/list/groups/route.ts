import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "groups",
  permCode: "groups.view",
  searchable: ["name", "description"],
  defaultSort: { key: "name", dir: "asc" },
  sortWhitelist: ["name", "created_at"],
});
