import Image from "next/image";
import Link from "next/link";
import type { Para, Position } from "@/lib/landing/careers";

/** Shared helpers for /careers and its postings. */

export function mailto(email: string, subject: string) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** The posting's apply link: the doc's address, the role as the subject. */
export const applyHref = (p: Position) => mailto(p.application.email, p.title);

/** A paragraph from the content model, bold and links as the doc sets them. */
export function Rich({ para }: { para: Para }) {
  return (
    <>
      {para.map((seg, i) =>
        typeof seg === "string" ? (
          <span key={i}>{seg}</span>
        ) : "b" in seg ? (
          <b key={i}>{seg.b}</b>
        ) : (
          <Link key={i} href={seg.href} className="cr-link">
            {seg.label}
          </Link>
        ),
      )}
    </>
  );
}

/** The doc's header line as chips. The posting carries all of it; the list,
    already titled "Careers at Tbrain", drops the company. */
export function MetaChips({ p, company = false }: { p: Position; company?: boolean }) {
  return (
    <ul className="cr-meta" aria-label="Role details">
      {company && (
        <li className="cr-chip cr-chip-company">
          <Image src="/icons/tbrain_ai_logo.svg" alt="" width={16} height={16} unoptimized />
          {p.company}
        </li>
      )}
      {[p.employment, p.location, p.reportsTo].map((m) => (
        <li key={m} className="cr-chip">
          {m}
        </li>
      ))}
    </ul>
  );
}

export const sentenceCase = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

/** Keep a title's " — Physical AI" tail from opening a line on its own dash. */
export const bindDash = (x: string) => x.replace(/ — /g, "\u00A0— ");
