import { render } from "@react-email/render";
import { Resend } from "resend";
import type { ReactElement } from "react";

let _resend: Resend | null = null;

function resend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("Missing RESEND_API_KEY");
    _resend = new Resend(key);
  }
  return _resend;
}

export const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Tbrain <no-reply@tbrain.ai>";

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  template: ReactElement;
  replyTo?: string;
}): Promise<void> {
  // Dev-friendly: when RESEND_API_KEY is unset we just log instead of throwing,
  // so the passcode/request flows can be exercised locally before email is set up.
  if (!process.env.RESEND_API_KEY) {
    const text = await render(opts.template, { plainText: true });
    console.warn(
      `[email] RESEND_API_KEY unset — skipping send.\n  to=${opts.to}\n  subject=${opts.subject}\n---\n${text}\n---`
    );
    return;
  }

  const html = await render(opts.template);
  const text = await render(opts.template, { plainText: true });

  const { error } = await resend().emails.send({
    from: FROM_ADDRESS,
    to: opts.to,
    subject: opts.subject,
    html,
    text,
    replyTo: opts.replyTo,
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }
}

export function publicBaseUrl(): string {
  return process.env.PUBLIC_BASE_URL ?? "https://tbrain.ai";
}
