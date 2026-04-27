import "server-only";
import { listAdminResource } from "@/lib/admin/server/list";
import { ChatsClient } from "./chats-client";

export const dynamic = "force-dynamic";

export type ChatSessionRow = {
  id: string;
  visitor_id: string | null;
  ip: string | null;
  user_agent: string | null;
  started_at: string;
  last_message_at: string | null;
  message_count: number;
};

export default async function ChatsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;

  const initial = await listAdminResource<ChatSessionRow>(
    {
      table: "chat_sessions",
      permCode: "chats.view",
      select: "id, visitor_id, ip, user_agent, started_at, last_message_at, message_count",
      searchable: ["ip", "visitor_id"],
      defaultSort: { key: "last_message_at", dir: "desc" },
      sortWhitelist: ["last_message_at", "started_at", "message_count"],
      filters: {
        range: (v, q) => {
          const hours = v === "24h" ? 24 : v === "7d" ? 24 * 7 : v === "30d" ? 24 * 30 : 0;
          if (!hours) return undefined;
          return q.gte("started_at", new Date(Date.now() - hours * 3600_000).toISOString());
        },
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
          Chat Sessions
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Conversations between visitors and the Tbrain AI assistant. Click a row to view the transcript.
        </p>
      </div>
      <ChatsClient initial={initial} />
    </div>
  );
}
