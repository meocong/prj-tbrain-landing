import { requireAdmin } from "@/lib/admin/server/list";
import { listEnrichedContacts, type ContactTag } from "@/lib/admin/server/contacts";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { KpiStrip } from "@/components/admin/ui/kpi-strip";
import { ContactsClient } from "./contacts-client";
import { Users, Inbox, Mail, KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("contacts.view");
  const sp = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

  const page = Number(first(sp.page) || 0);
  const pageSize = 30;
  const search = first(sp.search);
  const tagFilter = first(sp.tag) || "all";
  const sortKey = first(sp.sort) || "created_at";
  const sortDir = (first(sp.dir) as "asc" | "desc") || "desc";

  const db = supabaseAdmin();
  const [{ rows, total }, clientsCount, newsletterCount, formsCount, pendingRequests] = await Promise.all([
    listEnrichedContacts({
      page, pageSize, search,
      tagFilter: tagFilter as ContactTag | "all",
      sortKey: ["created_at", "email"].includes(sortKey) ? sortKey : "created_at",
      sortDir,
    }),
    db.from("clients").select("id", { count: "exact", head: true }),
    db.from("newsletter_subscribers").select("id", { count: "exact", head: true }).is("unsubscribed_at", null),
    db.from("contact_submissions").select("id", { count: "exact", head: true }),
    db.from("access_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

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
          Unified CRM — everyone who submitted a form, subscribed, requested access, or was added manually.
        </p>
      </div>

      <KpiStrip
        items={[
          { label: "Total", value: clientsCount.count ?? 0, icon: Users, accent: "primary" },
          { label: "Contact forms", value: formsCount.count ?? 0, icon: Inbox, accent: "info" },
          { label: "Newsletter", value: newsletterCount.count ?? 0, icon: Mail, accent: "warning" },
          { label: "Pending requests", value: pendingRequests.count ?? 0, icon: KeyRound, accent: "error" },
        ]}
      />

      <ContactsClient
        rows={rows}
        total={total}
        page={page}
        pageSize={pageSize}
        search={search}
        tagFilter={tagFilter}
        sortKey={sortKey}
        sortDir={sortDir}
      />
    </div>
  );
}
