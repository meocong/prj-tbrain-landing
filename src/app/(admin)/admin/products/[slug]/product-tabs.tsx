"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { key: "", label: "Overview" },
  { key: "batches", label: "Batches" },
  { key: "samples", label: "Samples" },
  { key: "passcodes", label: "Passcodes" },
  { key: "requests", label: "Requests" },
  { key: "events", label: "Events" },
  { key: "templates", label: "Templates" },
  { key: "settings", label: "Settings" },
];

export function ProductTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const basePath = `/admin/products/${slug}`;
  const currentTab = pathname === basePath ? "" : pathname.replace(`${basePath}/`, "").split("/")[0];

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto mb-5"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      {TABS.map((t) => {
        const active = t.key === currentTab;
        const href = t.key ? `${basePath}/${t.key}` : basePath;
        return (
          <Link
            key={t.key}
            href={href}
            className="px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              color: active ? "var(--color-brand-500)" : "var(--text-muted)",
              borderBottom: active ? "2px solid var(--color-brand-500)" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
