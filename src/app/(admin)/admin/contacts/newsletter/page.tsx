import { listAdminResource } from "@/lib/admin/server/list";
import { NewsletterClient } from "./newsletter-client";
import type { NewsletterSubscriber } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = await listAdminResource<NewsletterSubscriber>(
    {
      table: "newsletter_subscribers",
      permCode: "contacts.view",
      searchable: ["email", "full_name"],
      defaultSort: { key: "subscribed_at", dir: "desc" },
      sortWhitelist: ["subscribed_at", "unsubscribed_at", "email"],
      filters: {
        state: (v, q) => (v === "subscribed" ? q.is("unsubscribed_at", null) : q.not("unsubscribed_at", "is", null)),
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
          Newsletter
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Everyone who opted in from the landing footer or blog signup.
        </p>
      </div>
      <NewsletterClient initial={initial} />
    </div>
  );
}
