"use client";

/**
 * Cookie / tracking consent helper.
 *
 * The site only sets strictly-necessary cookies (auth/session, anti-bot)
 * without consent. Non-essential tracking — Google Analytics 4, Firebase
 * Analytics and UTM attribution — is gated behind explicit opt-in via this
 * module so we comply with GDPR / ePrivacy and CCPA, and a Global Privacy
 * Control signal counts as a rejection.
 *
 * The choice itself is stored in localStorage (not a cookie) so reading it
 * never sets a cookie before the user has decided.
 */

export type ConsentValue = "accepted" | "rejected";

const KEY = "tbrain-cookie-consent";
const EVENT = "tbrain-consent-change";
const OPEN_EVENT = "tbrain-consent-open";

/**
 * Global Privacy Control: the browser-level "do not sell or share" signal.
 * California requires it be honoured as an opt-out (CCPA regs §7025), so a
 * visitor sending it is treated as having rejected until they say otherwise.
 */
export function hasGpcSignal(): boolean {
  if (typeof navigator === "undefined") return false;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

/** The choice the visitor stored, ignoring GPC. Null if they have not chosen. */
export function getStoredConsent(): ConsentValue | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

/**
 * The effective choice: what the visitor stored, else "rejected" when their
 * browser sends GPC, else null (undecided — nothing non-essential runs).
 */
export function getConsent(): ConsentValue | null {
  return getStoredConsent() ?? (hasGpcSignal() ? "rejected" : null);
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

/**
 * Delete the Google Analytics cookies (`_ga`, `_ga_<id>`, `_gid`, …) on every
 * domain gtag.js or Firebase may have written them to. Called when a visitor
 * withdraws consent, so "Reject" after "Accept" leaves nothing behind.
 */
export function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  const host = location.hostname;
  const apex = host.split(".").slice(-2).join(".");
  const domains = ["", host, `.${host}`, `.${apex}`];
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (!/^_g(a|id|at)/.test(name)) continue;
    for (const d of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? `; domain=${d}` : ""}`;
    }
  }
}
