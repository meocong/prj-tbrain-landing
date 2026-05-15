"use client";

import { useState, useEffect, useRef } from "react";
import { supabaseAdmin } from "@/lib/admin/supabase-browser";
import { Mail, UserPlus, Loader2 } from "lucide-react";

type Client = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
};

export type ContactPickValue = {
  email: string;
  full_name?: string | null;
  company?: string | null;
  existing?: Client;
};

export type ContactComboboxProps = {
  value: string;
  onChange: (v: ContactPickValue) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function ContactCombobox({ value, onChange, placeholder, autoFocus }: ContactComboboxProps) {
  const [text, setText] = useState(value);
  const [results, setResults] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setText(value), [value]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Debounced search
  useEffect(() => {
    const q = text.trim();
    if (q.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const { data } = await supabaseAdmin
        .from("clients")
        .select("id, email, full_name, company")
        .or(`email.ilike.%${q}%,full_name.ilike.%${q}%,company.ilike.%${q}%`)
        .order("created_at", { ascending: false })
        .limit(8);
      setResults((data ?? []) as Client[]);
      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, [text]);

  const pickExisting = (c: Client) => {
    onChange({ email: c.email, full_name: c.full_name, company: c.company, existing: c });
    setText(c.email);
    setOpen(false);
  };

  const confirmNew = () => {
    onChange({ email: text.trim() });
    setOpen(false);
  };

  const isEmailLike = /.+@.+\..+/.test(text.trim());
  const exactMatch = results?.some((r) => r.email.toLowerCase() === text.trim().toLowerCase());

  return (
    <div ref={wrapRef} className="relative">
      <Mail
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5"
        style={{ color: "var(--text-muted)" }}
      />
      <input
        type="text"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange({ email: e.target.value });
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Search or type new email…"}
        autoFocus={autoFocus}
        className="input-field"
        style={{ paddingLeft: "2.25rem" }}
        autoComplete="off"
      />
      {open && (results !== null || loading) && (
        <div
          className="absolute z-20 left-0 right-0 mt-1 max-h-64 overflow-y-auto rounded-lg"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          }}
        >
          {loading && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
            </div>
          )}
          {!loading && results && results.length > 0 && (
            <ul>
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pickExisting(c)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-input)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate" style={{ color: "var(--text-primary)" }}>
                        {c.full_name ?? c.email}
                      </p>
                      <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                        {c.email}
                        {c.company ? ` · ${c.company}` : ""}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && (!results || results.length === 0) && text.trim().length >= 2 && (
            <div className="px-3 py-2 text-xs" style={{ color: "var(--text-muted)" }}>
              No matches.
            </div>
          )}
          {!loading && isEmailLike && !exactMatch && (
            <button
              type="button"
              onClick={confirmNew}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--bg-input)]"
              style={{
                borderTop: results && results.length > 0 ? "1px solid var(--border-subtle)" : undefined,
                color: "var(--color-brand-500)",
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Create new contact: <span className="font-medium">{text.trim()}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
