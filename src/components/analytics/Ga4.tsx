"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Google Analytics 4 (gtag.js), running alongside Firebase Analytics.
 *
 * Loads as soon as the page is interactive — it does NOT wait for cookie
 * consent. We disable gtag's own automatic page_view and emit one per
 * client-side navigation ourselves so SPA route changes are tracked.
 */
const Ga4 = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Send a page_view on every route change once gtag is loaded.
  useEffect(() => {
    if (!GA_ID || typeof window === "undefined") return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== "function") return;
    const url = `${pathname}${searchParams.toString() ? "?" + searchParams : ""}`;
    w.gtag("event", "page_view", {
      page_path: url,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        id="ga4-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
};

export default Ga4;
