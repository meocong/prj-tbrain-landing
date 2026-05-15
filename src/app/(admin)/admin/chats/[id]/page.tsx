import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageSquare, User, Bot, Globe, Clock } from "lucide-react";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import ReactMarkdown from "react-markdown";

export const dynamic = "force-dynamic";

type Session = {
  id: string;
  visitor_id: string | null;
  ip: string | null;
  user_agent: string | null;
  started_at: string;
  last_message_at: string | null;
  message_count: number;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("chats.view");
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: session } = await db
    .from("chat_sessions")
    .select("id, visitor_id, ip, user_agent, started_at, last_message_at, message_count")
    .eq("id", id)
    .maybeSingle();
  if (!session) notFound();
  const s = session as Session;

  const { data: rawMessages } = await db
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", id)
    .order("created_at", { ascending: true });
  const messages = (rawMessages ?? []) as Message[];

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <Link
        href="/admin/chats"
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All chat sessions
      </Link>

      <div className="mb-6">
        <h1
          className="text-2xl font-bold tracking-tight flex items-center gap-2"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          <MessageSquare className="h-6 w-6" style={{ color: "var(--color-brand-500)" }} />
          Session {s.id.slice(0, 8)}…
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs" style={{ color: "var(--text-muted)" }}>
          <span className="inline-flex items-center gap-1">
            <Globe className="h-3 w-3" />
            <code>{s.ip ?? "no IP"}</code>
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Started {new Date(s.started_at).toLocaleString()}
          </span>
          <span>{s.message_count} messages</span>
          {s.user_agent && (
            <span className="truncate max-w-[28rem]" title={s.user_agent}>
              {s.user_agent}
            </span>
          )}
        </div>
      </div>

      <div
        className="rounded-2xl p-5 space-y-4"
        style={{ background: "var(--bg-elevated, #fff)", border: "1px solid var(--border-default)" }}
      >
        {messages.length === 0 && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No messages in this session yet.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{
                background: m.role === "user" ? "var(--color-brand-500)" : "var(--bg-input)",
                color: m.role === "user" ? "white" : "var(--text-secondary)",
              }}
            >
              {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div className="min-w-0 max-w-[75%]">
              <div
                className="rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                style={
                  m.role === "user"
                    ? {
                        background: "var(--color-brand-500)",
                        color: "white",
                        borderBottomRightRadius: "4px",
                      }
                    : {
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        borderBottomLeftRadius: "4px",
                      }
                }
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
              <p
                className={`mt-1 text-[10px] ${m.role === "user" ? "text-right" : ""}`}
                style={{ color: "var(--text-muted)" }}
              >
                {new Date(m.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
