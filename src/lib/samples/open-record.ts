/**
 * Open a record in the catalogue's modal from anywhere on the page.
 *
 * `SampleCatalog` owns the open record and reads `?record=` once, on mount. A
 * link elsewhere on the same page — a hero button, a "Start here" chip, a row
 * of the comparison table — changing only the query string does not remount
 * it, so the catalogue would never hear about it. This is the one channel: the
 * caller dispatches, the catalogue listens.
 *
 * Callers keep a real `href` (`?record=<slug>#samples`) so the control is still
 * a link without JavaScript and can be opened in a new tab; the click handler
 * calls `openRecord` and prevents the navigation.
 */

export const OPEN_RECORD_EVENT = "samples:open-record";

export interface OpenRecordDetail {
  slug: string;
  /** Frame to seek to on open, as `&f=` does. */
  frame?: number;
}

export function openRecord(slug: string, frame?: number) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenRecordDetail>(OPEN_RECORD_EVENT, { detail: { slug, frame } }),
  );
}

/** The `href` that does the same thing without script. */
export const recordHref = (slug: string, frame?: number) =>
  `?record=${encodeURIComponent(slug)}${frame != null ? `&f=${frame}` : ""}#samples`;

/** `&f=` from the current URL, if it is a usable frame index. */
export function frameFromUrl(): number | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("f");
  if (raw == null || !/^\d+$/.test(raw)) return null;
  return Number(raw);
}
