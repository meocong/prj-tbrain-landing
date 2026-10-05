import "server-only";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import { KnowledgeClient } from "./knowledge-client";

export const dynamic = "force-dynamic";

export default async function AgentKnowledgePage() {
  await requireAdmin("content.view");
  // Creator/reviewer names for the list (admin_users itself needs users.view).
  const { data } = await supabaseAdmin().from("admin_users").select("id, full_name, email");
  const names = Object.fromEntries((data ?? []).map((u) => [u.id as string, (u.full_name || u.email) as string]));
  return <KnowledgeClient adminNames={names} />;
}
