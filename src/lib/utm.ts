/**
 * UTM + referrer attribution helper.
 *
 * Strategy: capture UTM params on the FIRST page load (when present in URL)
 * and stash in sessionStorage. Subsequent form submits pull from there so a
 * visitor who lands on /blog?utm_source=linkedin then submits a contact form
 * later still gets credited to LinkedIn.
 */

const KEY = "tb_utm_v1";

export type UtmAttribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
};

/**
 * Read UTM params from current URL + document.referrer. If any UTM param is
 * present, stash them. Otherwise leave existing sessionStorage entry alone
 * (preserves first-touch attribution).
 */
export function captureUtm() {
  if (typeof window === "undefined") return;
  try {
    const sp = new URLSearchParams(window.location.search);
    const fields: (keyof UtmAttribution)[] = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
    ];
    const incoming: UtmAttribution = {};
    let hasAny = false;
    for (const f of fields) {
      const v = sp.get(f);
      if (v) {
        incoming[f] = v;
        hasAny = true;
      }
    }
    if (!hasAny) return;

    // External referrer (skip same-origin self-referrals).
    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      incoming.referrer = document.referrer;
    }

    sessionStorage.setItem(KEY, JSON.stringify(incoming));
  } catch {
    // Silently ignore — never block render on attribution capture.
  }
}

/**
 * Read stashed UTM params for inclusion in a form submission. Returns empty
 * object if nothing was captured.
 */
export function readUtm(): UtmAttribution {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UtmAttribution;
  } catch {
    return {};
  }
}
