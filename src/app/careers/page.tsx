import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, Mail } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { ABOUT_TBRAIN, CAREERS, POSITIONS, type Position } from "@/lib/landing/careers";
import { MetaChips, applyHref, bindDash } from "./_sections/ui";
import { TrackClicks } from "./_sections/TrackClicks";

/**
 * /careers, set as a split dossier: Tbrain stays put on the left while the
 * open positions and the reasons to join scroll on the right. Every sentence
 * is a job description's (src/lib/landing/careers.ts); the page adds only the
 * headings, the chips and the button labels.
 */

const DESCRIPTION = `Open positions at Tbrain. ${ABOUT_TBRAIN.intro}`;

export const metadata: Metadata = {
  title: "Careers",
  description: DESCRIPTION,
  alternates: { canonical: "/careers" },
  openGraph: {
    title: CAREERS.title,
    description: DESCRIPTION,
    url: "/careers",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: CAREERS.title,
    description: DESCRIPTION,
  },
};

/* From this many roles the list turns into one compact card per role, so the
   page stays an index however many roles open. */
const COMPACT_FROM = 4;

/** Up to three roles: each one in full, with its summary and both actions. */
function RoleEntry({ p }: { p: Position }) {
  return (
    <li className="cr-role cr-card">
      <h3 className="cr-role-title">
        <Link href={`/careers/${p.slug}`} data-cr-track="careers_role_open" data-cr-where="title">
          {bindDash(p.title)}
        </Link>
      </h3>
      <MetaChips p={p} />
      <p className="cr-role-sum">{p.role.body[0]}</p>
      <div className="cr-actions">
        <Link
          href={`/careers/${p.slug}`}
          data-cr-track="careers_role_open"
          data-cr-where="button"
          className="cr-btn cr-btn-primary"
          aria-label={`Role description: ${p.title}`}
        >
          Role description
          <ArrowRight className="cr-arrow h-4 w-4" aria-hidden />
        </Link>
        <a
          href={applyHref(p)}
          data-cr-track="careers_apply_click"
          data-cr-where="list"
          className="cr-btn cr-btn-secondary"
          aria-label={`Apply by email: ${p.title}`}
        >
          <Mail className="h-4 w-4" aria-hidden />
          Apply by email
        </a>
      </div>
      {/* What to send and where, in the doc's words: the way in when a mail
          link opens nothing. */}
      <p className="cr-role-mail">
        {p.application.ask}{" "}
        <a href={applyHref(p)} data-cr-track="careers_apply_click" data-cr-where="list_address" className="cr-link">
          {p.application.email}
        </a>
        .
      </p>
    </li>
  );
}

/** Four roles and up: title and terms on one ruled row that opens the posting. */
function RoleRow({ p }: { p: Position }) {
  return (
    <li className="cr-role cr-role-row cr-card">
      <Link href={`/careers/${p.slug}`} data-cr-track="careers_role_open" data-cr-where="row" className="cr-row-link">
        <span className="cr-row-title">{bindDash(p.title)}</span>
        <span className="cr-row-meta">{[p.employment, p.location, p.reportsTo].join(" · ")}</span>
        <ArrowRight className="cr-arrow cr-row-arrow h-5 w-5" aria-hidden />
      </Link>
    </li>
  );
}

function OpenPositions() {
  if (!POSITIONS.length) return <p className="cr-empty cr-card">{CAREERS.empty}</p>;
  if (POSITIONS.length < COMPACT_FROM) {
    return (
      <ul className="cr-roles">
        {POSITIONS.map((p) => (
          <RoleEntry key={p.slug} p={p} />
        ))}
      </ul>
    );
  }

  // Grouped by team, in order of first appearance, once there is more than one.
  const teams = new Map<string, Position[]>();
  for (const p of POSITIONS) teams.set(p.team ?? "", [...(teams.get(p.team ?? "") ?? []), p]);
  const rows = (ps: Position[]) => (
    <ul className="cr-roles cr-roles-compact">
      {ps.map((p) => (
        <RoleRow key={p.slug} p={p} />
      ))}
    </ul>
  );
  if (teams.size < 2) return rows(POSITIONS);
  return (
    <>
      {[...teams].map(([team, ps]) => (
        <div key={team} className="cr-group">
          <h3 className="cr-group-h">
            {team || "Other roles"} <span className="cr-group-n">{ps.length}</span>
          </h3>
          {rows(ps)}
        </div>
      ))}
    </>
  );
}

export default function CareersPage() {
  return (
    <div className="cr">
      <TrackClicks page="careers" />
      <Header />
      <main id="main-content" className="cr-split">
        <div className="cr-aside">
          <h1 className="cr-title">
            {CAREERS.titleLead} <span className="gradient-text">{CAREERS.titleHighlight}</span>
          </h1>
          {POSITIONS.length > 0 && (
            <p className="cr-status">
              {/* The /researchprogram status line. Below the split the roles
                  sit a screen down, so it is also the way to them. */}
              <a href="#open" className="cr-status-link">
                <span aria-hidden className="cr-open" />
                {POSITIONS.length} open position{POSITIONS.length === 1 ? "" : "s"}
                <ArrowDown className="cr-status-arrow h-4 w-4" aria-hidden />
              </a>
            </p>
          )}
          <p className="cr-ask">
            <strong>{CAREERS.tagline}</strong>
          </p>
          <p className="cr-more">
            <Link href={CAREERS.learnMore.href} className="cr-link-arrow">
              {CAREERS.learnMore.label}
              <ArrowRight className="cr-arrow h-4 w-4" aria-hidden />
            </Link>
          </p>
        </div>

        <div className="cr-body">
          <section id="open" aria-labelledby="open-h" className="cr-section">
            <h2 id="open-h" className="cr-h2">
              {CAREERS.openTitle}
            </h2>
            {/* Every posting opens on its own page with the whole job
                description, so the list stays an index at any length. */}
            <OpenPositions />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
