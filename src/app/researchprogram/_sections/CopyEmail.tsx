"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copy-to-clipboard for the contact address — many readers will paste it
    into a university mail client rather than follow a mailto link. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      data-rs-track="research_email_copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
        } catch {
          /* Clipboard blocked (insecure context / permissions): the address is
             on screen and selectable, so there is nothing to recover. */
        }
      }}
      className="rp-btn rp-btn-secondary"
    >
      {copied ? <Check className="h-4 w-4" style={{ color: "var(--rp-open)" }} aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
