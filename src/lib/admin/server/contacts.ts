import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export type ContactTag = "form" | "newsletter" | "request" | "client" | "passcode";

export type EnrichedContact = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  source: string | null;
  status: string | null;
  created_at: string;
  tags: ContactTag[];
  last_activity: string | null;
};

/**
 * Unified contact list. Base set is `clients` (CRM store), enriched with
 * presence tags from related tables: contact_submissions, newsletter_subscribers,
 * access_requests, passcodes.
 */
export async function listEnrichedContacts(opts: {
  page: number;
  pageSize: number;
  search?: string;
  tagFilter?: ContactTag | "all";
  sortKey?: string;
  sortDir?: "asc" | "desc";
}): Promise<{ rows: EnrichedContact[]; total: number }> {
  const db = supabaseAdmin();

  let q = db
    .from("clients")
    .select("*", { count: "exact" })
    .order(opts.sortKey ?? "created_at", { ascending: (opts.sortDir ?? "desc") === "asc" })
    .range(opts.page * opts.pageSize, (opts.page + 1) * opts.pageSize - 1);

  if (opts.search) {
    const s = opts.search.replace(/[%,()]/g, "");
    q = q.or(`email.ilike.%${s}%,full_name.ilike.%${s}%,company.ilike.%${s}%`);
  }

  const { data: clients, count } = await q;
  const clientRows = (clients ?? []) as Array<{
    id: string; email: string; full_name: string | null; company: string | null;
    source: string | null; status: string | null; created_at: string;
  }>;
  if (clientRows.length === 0) return { rows: [], total: count ?? 0 };

  const emails = clientRows.map((c) => c.email.toLowerCase());
  const ids = clientRows.map((c) => c.id);

  // Fire all enrichment queries in parallel
  const [submissions, subscriptions, requests, passcodes] = await Promise.all([
    db.from("contact_submissions").select("client_id, email, created_at").in("email", emails),
    db.from("newsletter_subscribers").select("email, subscribed_at, unsubscribed_at").in("email", emails),
    db.from("access_requests").select("email, requested_at, status").in("email", emails),
    db.from("passcodes").select("client_id, issued_at, revoked_at").in("client_id", ids),
  ]);

  const formsByEmail = new Map<string, string>();
  for (const s of (submissions.data ?? []) as Array<{ email: string; created_at: string }>) {
    const k = s.email.toLowerCase();
    if (!formsByEmail.has(k) || formsByEmail.get(k)! < s.created_at) formsByEmail.set(k, s.created_at);
  }

  const newsByEmail = new Map<string, { at: string; active: boolean }>();
  for (const n of (subscriptions.data ?? []) as Array<{ email: string; subscribed_at: string; unsubscribed_at: string | null }>) {
    const k = n.email.toLowerCase();
    if (!newsByEmail.has(k) || newsByEmail.get(k)!.at < n.subscribed_at) {
      newsByEmail.set(k, { at: n.subscribed_at, active: !n.unsubscribed_at });
    }
  }

  const reqByEmail = new Map<string, string>();
  for (const r of (requests.data ?? []) as Array<{ email: string; requested_at: string }>) {
    const k = r.email.toLowerCase();
    if (!reqByEmail.has(k) || reqByEmail.get(k)! < r.requested_at) reqByEmail.set(k, r.requested_at);
  }

  const passByClientId = new Map<string, { at: string; active: boolean }>();
  for (const p of (passcodes.data ?? []) as Array<{ client_id: string; issued_at: string; revoked_at: string | null }>) {
    const k = p.client_id;
    if (!passByClientId.has(k) || passByClientId.get(k)!.at < p.issued_at) {
      passByClientId.set(k, { at: p.issued_at, active: !p.revoked_at });
    }
  }

  let rows: EnrichedContact[] = clientRows.map((c) => {
    const key = c.email.toLowerCase();
    const tags: ContactTag[] = ["client"];
    const acts: string[] = [c.created_at];
    if (formsByEmail.has(key)) { tags.push("form"); acts.push(formsByEmail.get(key)!); }
    if (newsByEmail.has(key) && newsByEmail.get(key)!.active) { tags.push("newsletter"); acts.push(newsByEmail.get(key)!.at); }
    if (reqByEmail.has(key)) { tags.push("request"); acts.push(reqByEmail.get(key)!); }
    if (passByClientId.has(c.id) && passByClientId.get(c.id)!.active) { tags.push("passcode"); acts.push(passByClientId.get(c.id)!.at); }
    acts.sort();
    return { ...c, tags, last_activity: acts.length > 0 ? acts[acts.length - 1] : null };
  });

  // In-memory filter by tag (not done in SQL because tags are derived)
  if (opts.tagFilter && opts.tagFilter !== "all") {
    rows = rows.filter((r) => r.tags.includes(opts.tagFilter as ContactTag));
  }

  return { rows, total: count ?? 0 };
}
