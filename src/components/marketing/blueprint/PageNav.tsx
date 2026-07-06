"use client";

import { useEffect, useState } from "react";

interface NavItem {
  id: string;
  label: string;
}

export function PageNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(e.target.id);
            break;
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    );
    for (const it of items) {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <aside
      aria-label="On this page"
      className="hidden xl:block fixed top-32 right-6 z-20 max-w-[220px]"
      style={{ pointerEvents: "auto" }}
    >
      <div
        className="bp-card"
        style={{
          padding: "14px 16px",
          borderRadius: 12,
          background: "color-mix(in srgb, var(--bp-bg) 82%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          className="bp-mono"
          style={{
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--bp-ink-faint)",
            marginBottom: 10,
          }}
        >
          On this page
        </div>
        <ul className="space-y-1.5">
          {items.map((it) => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="bp-mono block"
                  style={{
                    fontSize: 11.5,
                    padding: "5px 8px",
                    borderRadius: 6,
                    color: on ? "var(--bp-cyan)" : "var(--bp-ink-dim)",
                    borderLeft: on ? "2px solid var(--bp-cyan)" : "2px solid transparent",
                    background: on ? "color-mix(in srgb, var(--bp-cyan) 10%, transparent)" : "transparent",
                    letterSpacing: "0.02em",
                    lineHeight: 1.4,
                    transition: "all .15s ease",
                  }}
                >
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
