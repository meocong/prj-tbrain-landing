import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Building, Phone, Calendar, FileText, KeyRound, Eye } from "lucide-react";
import { requireAdmin } from "@/lib/admin/server/list";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";
import type { Client } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin("contacts.view");
  const { id } = await params;
  const db = supabaseAdmin();

  const { data: contact } = await db.from("clients").select("*").eq("id", id).maybeSingle();
  if (!contact) notFound();

  const c = contact as Client;

  const [submissions, passcodes, events] = await Promise.all([
    db
      .from("contact_submissions")
      .select("id, source, message, created_at")
      .eq("client_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    db
      .from("passcodes")
      .select("id, passcode_prefix, issued_at, revoked_at, expires_at, product:products(name, slug), batch:batches(name, slug)")
      .eq("client_id", id)
      .order("issued_at", { ascending: false })
      .limit(10),
    db
      .from("access_events")
      .select("id, event_type, occurred_at, batch:batches(name, slug)")
      .eq("client_id", id)
      .order("occurred_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <Link
        href="/admin/contacts"
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All contacts
      </Link>

      <div className="mb-5 flex items-start gap-4">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold shrink-0"
          style={{ background: "rgba(108,60,244,0.12)", color: "var(--color-brand-500)" }}
        >
          {(c.full_name ?? c.email)[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            {c.full_name ?? c.email.split("@")[0]}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
            {c.email} {c.company ? `· ${c.company}` : ""}
          </p>
          {c.status && (
            <span
              className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium uppercase"
              style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
            >
              {c.status}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-4">
          <Section title="Passcodes" icon={KeyRound} count={passcodes.data?.length ?? 0}>
            {(passcodes.data ?? []).length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {(passcodes.data ?? []).map((p) => {
                  const product = Array.isArray(p.product) ? p.product[0] : p.product;
                  const batch = Array.isArray(p.batch) ? p.batch[0] : p.batch;
                  return (
                    <li key={p.id as string} className="flex items-center justify-between py-2">
                      <div>
                        <code className="font-mono text-xs" style={{ color: "var(--text-primary)" }}>
                          TB-{p.passcode_prefix}-••••
                        </code>
                        <span className="ml-2 text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {product?.name ?? "—"} · {batch?.name ?? "—"}
                        </span>
                      </div>
                      <span className="text-[11px]" style={{ color: p.revoked_at ? "#dc2626" : "#16a34a" }}>
                        {p.revoked_at ? "Revoked" : "Active"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="Recent Events" icon={Eye} count={events.data?.length ?? 0}>
            {(events.data ?? []).length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {(events.data ?? []).map((e) => {
                  const batch = Array.isArray(e.batch) ? e.batch[0] : e.batch;
                  return (
                    <li key={e.id as number} className="flex items-center justify-between py-2">
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                      >
                        {String(e.event_type).replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {batch?.name ?? "—"} · {new Date(e.occurred_at as string).toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>

          <Section title="Contact form submissions" icon={FileText} count={submissions.data?.length ?? 0}>
            {(submissions.data ?? []).length === 0 ? (
              <Empty />
            ) : (
              <ul className="space-y-2">
                {(submissions.data ?? []).map((s) => (
                  <li
                    key={s.id as string}
                    className="rounded-md px-3 py-2 text-xs"
                    style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                  >
                    <Link href={`/admin/contacts/forms/${s.id}`} style={{ color: "var(--color-brand-500)" }} className="block truncate">
                      {s.message}
                    </Link>
                    <span className="mt-1 block text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {s.source} · {new Date(s.created_at as string).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <aside className="glass-card p-5 space-y-3 self-start">
          <Info icon={Mail} label="Email">
            <a href={`mailto:${c.email}`} style={{ color: "var(--color-brand-500)" }}>{c.email}</a>
          </Info>
          {c.company && <Info icon={Building} label="Company">{c.company}</Info>}
          {c.role && <Info icon={FileText} label="Role">{c.role}</Info>}
          {c.phone && <Info icon={Phone} label="Phone">{c.phone}</Info>}
          {c.source && <Info icon={FileText} label="Source">{c.source}</Info>}
          <Info icon={Calendar} label="Created">{new Date(c.created_at).toLocaleString()}</Info>
          {c.notes && (
            <div className="pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>
                Notes
              </p>
              <p className="text-xs whitespace-pre-wrap" style={{ color: "var(--text-primary)" }}>
                {c.notes}
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, count, children }: { title: string; icon: typeof Mail; count: number; children: React.ReactNode }) {
  return (
    <section className="glass-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "var(--bg-input)", borderBottom: "1px solid var(--border-subtle)" }}>
        <h3 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          <Icon className="h-4 w-4" style={{ color: "var(--color-brand-500)" }} /> {title}
        </h3>
        <span className="text-[10px] rounded-full px-2 py-0.5" style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}>
          {count}
        </span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function Info({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="break-words" style={{ color: "var(--text-primary)" }}>{children}</p>
      </div>
    </div>
  );
}

function Empty() {
  return <p className="text-xs" style={{ color: "var(--text-muted)" }}>None yet.</p>;
}
