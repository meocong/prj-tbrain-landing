"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { clearAnalyticsCookies, getConsent, onConsentChange } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

type Gtag = (...args: unknown[]) => void;

let lastSent: string | null = null;

/**
 * Google Analytics 4 (gtag.js), running alongside Firebase Analytics.
 *
 * Loads ONLY after the visitor accepts analytics cookies. It used to load as
 * soon as the page was interactive, so `_ga` and `_ga_<id>` were set while the
 * consent banner was still on screen, and "Reject" did not stop them — which a
 * Cookiebot CCPA scan flagged as high risk (2026-09-28). A Global Privacy
 * Control signal counts as a rejection (see `getConsent`).
 *
 * When it does load, Consent Mode v2 is declared before the tag runs: analytics
 * granted (the visitor just said yes), every advertising purpose denied, and
 * Google signals and ad personalisation off — nothing here is used for ads, and
 * that is what keeps analytics out of "sale or sharing" under the CCPA. A later
 * "Reject" sets analytics back to denied and deletes the GA cookies, so a
 * change of mind takes effect without a reload.
 */
const Ga4 = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(getConsent() === "accepted");
    return onConsentChange((v) => {
      setAllowed(v === "accepted");
      // Tell a loaded tag first, so it does not write the cookies back on its
      // next hit; then delete them.
      const w = window as unknown as { gtag?: Gtag };
      if (typeof w.gtag === "function") {
        w.gtag("consent", "update", {
          analytics_storage: v === "accepted" ? "granted" : "denied",
        });
      }
      if (v !== "accepted") {
        clearAnalyticsCookies();
        lastSent = null;
      }
    });
  }, []);

  // One page_view per URL, sent here rather than by `config`: the tag is
  // mounted by the same render that flips `allowed`, so `config` and this
  // effect both fired on the first page and GA counted it twice. The last URL
  // sent is kept at module scope so a re-run of the effect (React's dev double
  // invoke, a re-render) cannot send it again. gtag.js may not have run yet on
  // the first pass, so it is waited for briefly.
  useEffect(() => {
    if (!GA_ID || !allowed || typeof window === "undefined") return;
    const url = `${pathname}${searchParams.toString() ? "?" + searchParams : ""}`;
    let tries = 0;
    const send = () => {
      const w = window as unknown as { gtag?: Gtag };
      if (typeof w.gtag !== "function") {
        if (++tries < 50) timer = window.setTimeout(send, 100);
        return;
      }
      if (lastSent === url) return;
      lastSent = url;
      w.gtag("event", "page_view", { page_path: url, page_location: location.href, page_title: document.title });
    };
    let timer = window.setTimeout(send, 0);
    return () => window.clearTimeout(timer);
  }, [allowed, pathname, searchParams]);

  if (!GA_ID || !allowed) return null;

  return (
    <>
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
            analytics_storage: 'granted'
          });
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
        `}
      </Script>
      <Script
        id="ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
    </>
  );
};

export default Ga4;
