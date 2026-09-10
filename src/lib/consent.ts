"use client";

/**
 * Cookie / tracking consent helper.
 *
 * The site only sets strictly-necessary cookies (auth/session, anti-bot)
 * without consent. Non-essential tracking — Firebase Analytics and UTM
 * attribution — is gated behind explicit opt-in via this module so we comply
 * with GDPR / ePrivacy and CCPA.
 *
 * The choice itself is stored in localStorage (not a cookie) so reading it
 * never sets a cookie before the user has decided.
 */

export type ConsentValue = "accepted" | "rejected";

const KEY = "tbrain-cookie-consent";
const EVENT = "tbrain-consent-change";
const OPEN_EVENT = "tbrain-consent-open";

/** Current stored choice, or null if the user has not decided yet. */
export function getConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

/** Persist the user's choice and notify listeners in the same tab. */
export function setConsent(value: ConsentValue): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
  } catch {
    // Storage may be unavailable (private mode, blocked) — fail silent.
  }
}

/** Subscribe to in-tab consent changes. Returns an unsubscribe function. */
export function onConsentChange(cb: (v: ConsentValue) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent).detail as ConsentValue);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export const hasAnalyticsConsent = (): boolean => getConsent() === "accepted";

/** Request the consent banner to re-open so the user can change their choice. */
export function openConsentBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/** Subscribe to banner re-open requests. Returns an unsubscribe function. */
export function onOpenConsentBanner(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
}
