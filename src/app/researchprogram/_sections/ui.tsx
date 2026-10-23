/** Shared helpers for /researchprogram. */

export function mailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}
