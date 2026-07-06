"use client";

/**
 * SubpageNav — breadcrumb + prev/next cross-page navigation for the two
 * Physical AI subpages. Sits above the SubpageHero.
 */
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";

interface Crumb { label: string; href?: string }

export function Breadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="container mx-auto px-5" style={{ paddingTop: 110, paddingBottom: 12 }}>
      <ol className="flex flex-wrap items-center gap-1.5 bp-mono" style={{ fontSize: 11.5, color: "var(--bp-ink-faint)", letterSpacing: "0.06em" }}>
        {trail.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {c.href ? (
              <Link href={c.href} style={{ color: "var(--bp-ink-dim)" }} className="hover:text-[var(--bp-cyan)]">
                {c.label}
              </Link>
            ) : (
              <span style={{ color: "var(--bp-cyan)" }}>{c.label}</span>
            )}
            {i < trail.length - 1 && <ChevronRight className="h-3 w-3" style={{ opacity: 0.5 }} />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface Neighbor { label: string; href: string; sub: string }

export function PrevNextFooter({ prev, next }: { prev?: Neighbor; next?: Neighbor }) {
  return (
    <section className="bp-grid" style={{ borderTop: "1px solid var(--bp-line)", padding: "48px 0" }}>
      <div className="container mx-auto grid gap-4 px-5 md:grid-cols-2">
        {prev ? (
          <Link href={prev.href} className="group bp-card block" style={{ padding: 22, borderRadius: 14 }}>
            <div className="bp-mono flex items-center gap-2" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </div>
            <div className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--bp-ink)" }}>{prev.label}</div>
            <div className="mt-1" style={{ fontSize: 13, color: "var(--bp-ink-dim)" }}>{prev.sub}</div>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={next.href} className="group bp-card block text-right" style={{ padding: 22, borderRadius: 14 }}>
            <div className="bp-mono flex items-center justify-end gap-2" style={{ fontSize: 10, color: "var(--bp-ink-faint)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Next <ArrowRight className="h-3.5 w-3.5" />
            </div>
            <div className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 20, color: "var(--bp-ink)" }}>{next.label}</div>
            <div className="mt-1" style={{ fontSize: 13, color: "var(--bp-ink-dim)" }}>{next.sub}</div>
          </Link>
        ) : <div />}
      </div>
    </section>
  );
}
