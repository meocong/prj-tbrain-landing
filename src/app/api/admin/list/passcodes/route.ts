import { makeAdminListHandler } from "@/lib/admin/server/list-handler";

export const runtime = "nodejs";

export const GET = makeAdminListHandler({
  table: "passcodes",
  permCode: "passcodes.view",
  select: "*, client:clients(email, full_name, company), batch:batches(slug, name)",
  searchable: ["passcode_prefix", "label", "note"],
  defaultSort: { key: "issued_at", dir: "desc" },
  sortWhitelist: ["issued_at", "expires_at", "use_count", "last_used_at", "passcode_prefix"],
  filters: {
    product_id: (v, q) => q.eq("product_id", v),
    type: (v, q) => (v === "per_client" ? q.not("client_id", "is", null) : q.is("client_id", null)),
    status: (v, q) => {
      const now = new Date().toISOString();
      if (v === "active") return q.is("revoked_at", null).or(`expires_at.is.null,expires_at.gt.${now}`);
      if (v === "expired") return q.is("revoked_at", null).lt("expires_at", now);
      if (v === "revoked") return q.not("revoked_at", "is", null);
      return undefined;
    },
  },
});
