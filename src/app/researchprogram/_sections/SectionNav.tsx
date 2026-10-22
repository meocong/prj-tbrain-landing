"use client";

/**
 * In-page navigation pinned under the site header once the hero has scrolled
 * away, with the active section underlined and the one action always in reach.
 */
import { useEffect, useRef, useState } from "react";
import { Mail } from "lucide-react";
import { CONTACT, MAIL_SUBJECT } from "@/lib/landing/research";
import { mailto } from "./ui";

export interface NavItem {
  id: string;
  label: string;
}

export function SectionNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  /* Over the contact island (dark in both themes) the bar re-scopes to the
     dark tokens instead of going muddy grey. */
  const [overDark, setOverDark] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px", threshold: 0 }
    );
    const els = items.map((it) => document.getElementById(it.id)).filter((x): x is HTMLElement => Boolean(x));
    els.forEach((el) => io.observe(el));
    // Above the first section (in the hero) nothing is active.
    const island = document.getElementById("contact");
    const onScroll = () => {
      if (els[0] && els[0].getBoundingClientRect().top > window.innerHeight * 0.4) setActive(null);
      const nav = navRef.current?.getBoundingClientRect();
      const r = island?.getBoundingClientRect();
      setOverDark(Boolean(nav && r && r.top <= nav.bottom && r.bottom >= nav.top));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  // Phones: the row scrolls sideways, so keep the active tab in view (scroll
  // the row itself — scrollIntoView would also move the page).
  useEffect(() => {
    const ul = listRef.current;
    const a = active ? ul?.querySelector<HTMLElement>(`a[href="#${active}"]`) : null;
    if (!ul || !a || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({ left: a.offsetLeft - ul.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="On this page"
      className={`rs-subnav sticky z-40 transition-colors duration-300 ${overDark ? "dark" : ""}`}
      style={{
        top: "var(--rs-header-h, 64px)",
        background: "color-mix(in srgb, var(--bp-bg) 84%, transparent)",
        WebkitBackdropFilter: "blur(12px) saturate(140%)",
        backdropFilter: "blur(12px) saturate(140%)",
        borderTop: "1px solid var(--bp-line)",
        borderBottom: "1px solid var(--bp-line)",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6 md:px-8">
        <ul ref={listRef} className="rs-subnav-scroll -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-2">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id} className="shrink-0">
                <a
                  href={`#${it.id}`}
                  aria-current={on ? "location" : undefined}
                  className="rs-subnav-link relative inline-flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{ fontSize: 13.5, fontWeight: 500, color: on ? "var(--bp-ink)" : "var(--bp-ink-dim)", textDecoration: "none" }}
                >
                  <span className="bp-mono" style={{ fontSize: 9.5, color: on ? "var(--bp-cyan)" : "var(--bp-ink-faint)", letterSpacing: "0.08em" }} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {it.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-2 h-[2px] origin-left rounded-full transition-transform duration-300"
                    style={{ background: "var(--bp-cyan)", transform: on ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </a>
              </li>
            );
          })}
        </ul>
        <a
          href={mailto(CONTACT.person.email, MAIL_SUBJECT)}
          data-rs-track="research_email_click"
          data-rs-where="subnav"
          className="rs-btn rs-btn-solid hidden shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 sm:inline-flex"
          style={{ fontSize: 13 }}
        >
          <Mail className="h-3.5 w-3.5" aria-hidden />
          {CONTACT.title}
        </a>
      </div>
    </nav>
  );
}
