"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/**
 * Mount-only component that captures UTM params from the URL on initial page
 * load and stashes them in sessionStorage for later form submissions.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtm();
  }, []);
  return null;
}
