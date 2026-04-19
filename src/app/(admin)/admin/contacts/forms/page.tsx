import { listAdminResource } from "@/lib/admin/server/list";
import { FormsClient } from "./forms-client";
import type { ContactSubmission } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function ContactFormsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = await listAdminResource<ContactSubmission>(
    {
      table: "contact_submissions",
      permCode: "contacts.view",
      select: "*, client:clients(id, email, full_name)",
      searchable: ["email", "full_name", "company", "message"],
      defaultSort: { key: "created_at", dir: "desc" },
      sortWhitelist: ["created_at", "email", "source"],
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
          Contact Forms
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Raw submissions from every form on the landing — contact, data request, demo, etc.
        </p>
      </div>
      <FormsClient initial={initial} />
    </div>
  );
}
