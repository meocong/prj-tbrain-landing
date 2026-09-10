"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { enableAnalytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";
import { getConsent, onConsentChange } from "@/lib/consent";

const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [allowed, setAllowed] = useState(false);

  // Track consent state; only enable analytics once the user opts in.
  useEffect(() => {
    setAllowed(getConsent() === "accepted");
    return onConsentChange((v) => setAllowed(v === "accepted"));
  }, []);

  useEffect(() => {
    if (!allowed) return;
    let cancelled = false;

    enableAnalytics().then((analytics) => {
      if (cancelled || !analytics) return;
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
