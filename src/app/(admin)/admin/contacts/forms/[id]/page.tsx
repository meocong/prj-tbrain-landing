"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { useHasPermission } from "@/lib/admin/auth-context";
import { ChevronLeft, UserPlus, Trash2, Mail, Calendar, Building, Phone, ExternalLink } from "lucide-react";
import type { ContactSubmission } from "@/lib/admin/types";

type Submission = ContactSubmission & {
  role: string | null;
  phone: string | null;
  client?: { id: string; email: string; full_name: string | null } | null;
};

export default function ContactFormDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const canDelete = useHasPermission("contacts.delete");
  const canCreate = useHasPermission("contacts.create");

  const [actionError, setActionError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["contact-form", params.id],
    queryFn: async () => {
      const { data } = await supabaseAdmin
        .from("contact_submissions")
        .select("*, client:clients(id, email, full_name)")
        .eq("id", params.id)
        .maybeSingle();
      return data as Submission | null;
    },
  });

  const convert = useMutation({
    mutationFn: async () => {
      if (!data) return;
      const { data: client, error } = await supabaseAdmin
        .from("clients")
        .upsert(
          {
            email: data.email.toLowerCase(),
            full_name: data.full_name,
            company: data.company,
            role: data.role,
            phone: data.phone,
            source: data.source ?? "contact_form",
          },
          { onConflict: "email" }
        )
        .select("id")
        .single();
      if (error || !client) throw error ?? new Error("upsert_failed");
      const { error: linkErr } = await supabaseAdmin
        .from("contact_submissions")
        .update({ client_id: client.id })
        .eq("id", params.id);
      if (linkErr) throw linkErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-form", params.id] });
      qc.invalidateQueries({ queryKey: ["contact-forms"] });
    },
    onError: (e: Error) => setActionError(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await supabaseAdmin
        .from("contact_submissions")
        .delete()
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contact-forms"] });
      router.push("/admin/contacts/forms");
    },
    onError: (e: Error) => setActionError(e.message),
  });

  if (!data) return null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/contacts/forms"
        className="inline-flex items-center gap-1 text-xs mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All submissions
      </Link>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            {data.full_name ?? data.email}
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-muted)" }}>
            {data.source ?? "contact_form"} · {new Date(data.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {canCreate && !data.client && (
            <button
              type="button"
              onClick={() => convert.mutate()}
              disabled={convert.isPending}
              className="btn-primary text-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {convert.isPending ? "Converting…" : "Convert to contact"}
            </button>
          )}
          {data.client && (
            <Link
              href={`/admin/contacts?focus=${data.client.id}`}
              className="btn-secondary text-xs"
              style={{ color: "var(--color-brand-500)" }}
            >
              <ExternalLink className="h-3.5 w-3.5" /> View contact
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Delete submission from ${data.email}?`)) remove.mutate();
              }}
              disabled={remove.isPending}
              className="btn-secondary text-xs"
              style={{ color: "#dc2626" }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div
          className="mb-3 rounded-md px-3 py-2 text-xs"
          style={{ background: "rgba(239,68,68,0.08)", color: "#dc2626" }}
        >
          {actionError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="glass-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            Message
          </p>
          <p
            className="whitespace-pre-wrap rounded-md p-4 text-sm"
            style={{ background: "var(--bg-input)", color: "var(--text-primary)", lineHeight: 1.6 }}
          >
            {data.message}
          </p>
        </div>

        <div className="glass-card p-5 space-y-3 self-start">
          <DetailRow icon={Mail} label="Email">
            <a href={`mailto:${data.email}`} style={{ color: "var(--color-brand-500)" }}>
              {data.email}
            </a>
          </DetailRow>
          {data.company && <DetailRow icon={Building} label="Company">{data.company}</DetailRow>}
          {data.role && <DetailRow icon={UserPlus} label="Role">{data.role}</DetailRow>}
          {data.phone && <DetailRow icon={Phone} label="Phone">{data.phone}</DetailRow>}
          <DetailRow icon={Calendar} label="Received">
            {new Date(data.created_at).toLocaleString()}
          </DetailRow>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }} />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
        <p className="break-words" style={{ color: "var(--text-primary)" }}>
          {children}
        </p>
      </div>
    </div>
  );
}
