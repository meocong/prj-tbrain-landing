import "server-only";
import { supabaseAdmin } from "@/lib/terminal-bench/supabase/admin";

export type TemplateKey =
  | "passcode_granted"
  | "request_approved"
  | "request_rejected"
  | "welcome";

export type TemplateRow = {
  id: string;
  product_id: string | null;
  key: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  variables: string[];
  is_active: boolean;
};

export type RenderedEmail = { subject: string; html: string; text: string | null };

/**
 * Minimal Mustache-style variable substitution.
 * Supports:
 *   {{var}}           — replace with vars[var] (HTML-escaped in HTML, raw in text)
 *   {{#var}}…{{/var}} — conditional block (renders iff var is truthy)
 * Unknown vars render as empty string.
 */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function render(
  template: string,
  vars: Record<string, string | number | null | undefined>,
  { html }: { html: boolean } = { html: false }
): string {
  // Conditional blocks: {{#key}}…{{/key}}
  let out = template.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, key, inner) => {
    const v = vars[key];
    return v !== undefined && v !== null && v !== "" ? inner : "";
  });
  // Simple vars
  out = out.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key];
    if (v === undefined || v === null) return "";
    const s = String(v);
    return html ? escapeHtml(s) : s;
  });
  return out;
}

/**
 * Resolve the active template for (key, product_id).
 * Falls back to global (product_id NULL) if no product-specific override exists.
 */
export async function resolveTemplate(
  key: TemplateKey,
  productId: string | null
): Promise<TemplateRow | null> {
  const db = supabaseAdmin();
  if (productId) {
    const { data: scoped } = await db
      .from("email_templates")
      .select("*")
      .eq("key", key)
      .eq("is_active", true)
      .eq("product_id", productId)
      .maybeSingle();
    if (scoped) return scoped as TemplateRow;
  }
  const { data: global } = await db
    .from("email_templates")
    .select("*")
    .eq("key", key)
    .eq("is_active", true)
    .is("product_id", null)
    .maybeSingle();
  return (global as TemplateRow | null) ?? null;
}

export function renderTemplate(
  tpl: Pick<TemplateRow, "subject" | "body_html" | "body_text">,
  vars: Record<string, string | number | null | undefined>
): RenderedEmail {
  return {
    subject: render(tpl.subject, vars, { html: false }),
    html: render(tpl.body_html, vars, { html: true }),
    text: tpl.body_text ? render(tpl.body_text, vars, { html: false }) : null,
  };
}
