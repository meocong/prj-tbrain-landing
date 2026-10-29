"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

/** Copy-to-clipboard for the application address — many candidates will
    paste it into their own mail client rather than follow a mailto link. */
export function CopyEmail({ email, where }: { email: string; where: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <button
      type="button"
      data-cr-track="careers_email_copy"
      data-cr-where={where}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
        } catch {
          /* Clipboard blocked (insecure context / permissions): the address is
             on screen and selectable, so there is nothing to recover. */
        }
      }}
      className="cr-btn cr-btn-secondary"
    >
      {copied ? <Check className="h-4 w-4" style={{ color: "var(--cr-open)" }} aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
