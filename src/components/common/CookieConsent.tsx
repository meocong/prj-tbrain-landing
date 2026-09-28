"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getConsent,
  setConsent,
  hasGpcSignal,
  getStoredConsent,
  onOpenConsentBanner,
  type ConsentValue,
} from "@/lib/consent";

/**
 * Cookie consent banner. Shown only until the visitor makes a choice.
 *
 * "Accept" enables non-essential tracking (Google Analytics 4, Firebase
 * Analytics, UTM attribution); "Reject" keeps it disabled, and withdraws it if
 * it was on. Strictly-necessary cookies
 * (auth/session, anti-bot) are unaffected either way.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [gpc, setGpc] = useState(false);

  useEffect(() => {
    // A browser sending Global Privacy Control has already said no: analytics
    // stay off and the banner is not pushed at them. They can still open it.
    setGpc(hasGpcSignal() && getStoredConsent() === null);
    if (getConsent() === null) setVisible(true);
    return onOpenConsentBanner(() => setVisible(true));
  }, []);

  if (!visible) return null;

  const choose = (value: ConsentValue) => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] flex justify-center p-4"
    >
      <div
        className="flex w-full max-w-3xl flex-col gap-4 rounded-xl border p-5 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between"
        style={{
          backgroundColor: "var(--bp-panel)",
          borderColor: "var(--border-default)",
          color: "var(--text-primary)",
        }}
      >
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          We use strictly-necessary cookies to run this site. With your consent
          we also use analytics cookies to understand how the site is used. See
          our{" "}
          <Link href="/policy" className="underline" style={{ color: "var(--primary)" }}>
            Privacy &amp; Cookie Policy
          </Link>
          .
          {gpc && (
            <>
              {" "}
              Your browser&apos;s Global Privacy Control signal is on, so analytics stay off unless you
              accept here.
            </>
          )}
        </p>
        <div className="flex shrink-0 gap-2">
          {/* Same weight as Accept. California's regulations ask for
              "symmetry in choice" (CCPA regs §7004): declining may not be the
              quieter, harder-to-see option. */}
          <Button size="lg" onClick={() => choose("rejected")}>
            Reject
          </Button>
          <Button size="lg" onClick={() => choose("accepted")}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
