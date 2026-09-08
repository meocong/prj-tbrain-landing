import "server-only";

const DEFAULT_RECIPIENTS = ["tam@tbrain.ai", "hannah.vu@tbrain.ai"];

/**
 * Recipients for admin notification emails (contact form, Terminal Bench
 * access requests, etc.). Reads `ADMIN_EMAIL` as a comma-separated list so
 * multiple humans can be CC'd without code changes.
 */
export function getAdminRecipients(): string[] {
  const raw = process.env.ADMIN_EMAIL;
  if (!raw) return DEFAULT_RECIPIENTS;
  const parsed = raw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : DEFAULT_RECIPIENTS;
}

/** Single address suitable for the `reply-to` header. Picks the first recipient. */
export function getAdminReplyTo(): string {
  return getAdminRecipients()[0];
}
