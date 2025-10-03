"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { analytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";

const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!analytics) return;
    
    const url = `${pathname}${searchParams.toString() ? "?" + searchParams : ""}`;
    logEvent(analytics, "page_view", {
      page_path: url,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
};

export default Analytics;
