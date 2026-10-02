"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";

/** Reader-facing share row under a blog post. Plain share URLs, no SDKs or trackers. */
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const e = encodeURIComponent;
  const targets = [
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${e(url)}` },
    { label: "X", href: `https://x.com/intent/post?text=${e(title)}&url=${e(url)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${e(url)}` },
  ];

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2 border-t pt-6" style={{ borderColor: "var(--border-default, #e5e7eb)" }}>
      <span className="mr-1 text-sm font-medium" style={{ color: "var(--text-muted)" }}>Share</span>
      {targets.map((t) => (
        <a
          key={t.label}
          href={t.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:border-[#6C3CF4] hover:text-[#6C3CF4]"
          style={{ borderColor: "var(--border-default, #e5e7eb)", color: "var(--text-secondary)" }}
        >
          {t.label}
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Clipboard blocked; nothing else to do.
          }
        }}
        className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:border-[#6C3CF4] hover:text-[#6C3CF4]"
        style={{ borderColor: "var(--border-default, #e5e7eb)", color: "var(--text-secondary)" }}
      >
        {copied ? <Check className="h-3 w-3" /> : <Link2 className="h-3 w-3" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
