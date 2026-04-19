import { listAdminResource } from "@/lib/admin/server/list";
import { ContactsClient } from "./contacts-client";
import type { Client } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = await listAdminResource<Client>(
    {
      table: "clients",
      permCode: "contacts.view",
      searchable: ["email", "full_name", "company", "role"],
      defaultSort: { key: "created_at", dir: "desc" },
      sortWhitelist: ["created_at", "email", "full_name", "company"],
      filters: {
        source: (v, q) => q.eq("source", v),
      },
    },
    sp
  );

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Contacts
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Everyone registered in CRM — from contact forms, data requests, newsletter, or added manually.
        </p>
      </div>
      <ContactsClient initial={initial} />
    </div>
  );
}
