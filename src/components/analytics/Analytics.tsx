"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { enableAnalytics, getAnalyticsInstance } from "@/lib/firebase";
import { logEvent, setAnalyticsCollectionEnabled } from "firebase/analytics";
import { clearAnalyticsCookies, getConsent, onConsentChange } from "@/lib/consent";

const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);

  // Track consent state; only enable analytics once the user opts in.
  useEffect(() => {
    setAllowed(getConsent() === "accepted");
    return onConsentChange((v) => {
      setAllowed(v === "accepted");
      // Withdrawing consent must stop collection now, not on the next visit:
      // an initialised Firebase Analytics keeps sending until told otherwise.
      const instance = getAnalyticsInstance();
      if (instance) setAnalyticsCollectionEnabled(instance, v === "accepted");
      if (v !== "accepted") clearAnalyticsCookies();
    });
  }, []);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;

    enableAnalytics().then((analytics) => {
      if (cancelled || !analytics) return;
      setAnalyticsCollectionEnabled(analytics, true);
      const url = `${pathname}${searchParams.toString() ? "?" + searchParams : ""}`;
      logEvent(analytics, "page_view", {
        page_path: url,
        page_title: document.title,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [allowed, pathname, searchParams]);

  return null;
};

export default Analytics;
