"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";
import { getConsent, onConsentChange } from "@/lib/consent";

/**
 * Mount-only component that captures UTM params from the URL on initial page
 * load and stashes them in sessionStorage for later form submissions.
 *
 * UTM attribution is marketing (non-essential), so it is gated behind cookie
 * consent: nothing is stashed until the user opts in.
 */
export function UtmCapture() {
  useEffect(() => {
    if (getConsent() === "accepted") captureUtm();
    return onConsentChange((v) => {
      if (v === "accepted") captureUtm();
    });
  }, []);
  return null;
}
