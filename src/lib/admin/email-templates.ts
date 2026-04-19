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

/** Wrap the rendered body HTML in the Tbrain email theme: 600px container,
 *  brand font-family, branded header strip. Safe to apply to any body_html
 *  since it only adds wrapper chrome. */
export function applyTbrainTheme(bodyHtml: string, opts: { preview?: boolean } = {}): string {
  const brand = "#6C3CF4";
  const bg = opts.preview ? "#F8FAFC" : "#F8FAFC";
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0F172A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 auto;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.06);overflow:hidden;">
        <tr><td style="background:${brand};padding:16px 24px;">
          <span style="color:#fff;font-weight:700;font-size:18px;letter-spacing:-0.01em;">Tbrain</span>
        </td></tr>
        <tr><td style="padding:24px;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="padding:16px 24px;background:#F1F5F9;font-size:12px;color:#64748B;text-align:center;">
          © Tbrain. Reply to this email if you have questions.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function renderTemplate(
  tpl: Pick<TemplateRow, "subject" | "body_html" | "body_text">,
  vars: Record<string, string | number | null | undefined>,
  { themed = true }: { themed?: boolean } = {}
): RenderedEmail {
  const body = render(tpl.body_html, vars, { html: true });
  return {
    subject: render(tpl.subject, vars, { html: false }),
    html: themed ? applyTbrainTheme(body) : body,
    text: tpl.body_text ? render(tpl.body_text, vars, { html: false }) : null,
  };
}
