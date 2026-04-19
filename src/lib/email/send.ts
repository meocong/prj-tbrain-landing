import "server-only";

export type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string | null;
  replyTo?: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Thin Resend wrapper. Returns ok=false (but does NOT throw) so the calling
 * flow can log + continue without trapping the user.
 */
export async function sendEmail(args: SendArgs): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Tbrain <no-reply@tbrain.ai>";
  if (!key) return { ok: false, error: "missing_resend_key" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(args.to) ? args.to : [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text ?? undefined,
        reply_to: args.replyTo,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[email] resend failed", res.status, body.slice(0, 200));
      return { ok: false, error: `resend_${res.status}` };
    }
    const json = (await res.json()) as { id?: string };
    return { ok: true, id: json.id ?? "unknown" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[email] resend threw:", msg);
    return { ok: false, error: "resend_exception" };
  }
}
