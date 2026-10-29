import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { POSITIONS, positionBySlug, type Para, type Position } from "@/lib/landing/careers";
import { CopyEmail } from "../_sections/CopyEmail";
import { MetaChips, Rich, applyHref, bindDash } from "../_sections/ui";
import { TrackClicks } from "../_sections/TrackClicks";

/**
 * One job posting, on the same split as /careers: the role, its terms and the
 * way to apply stay put on the left while the job description reads down the
 * right. The description is the doc's, section for section, in its order.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return POSITIONS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = positionBySlug((await params).slug);
  if (!p) return {};
  const description = p.role.body[0];
  return {
    title: p.title,
    description,
    alternates: { canonical: `/careers/${p.slug}` },
    openGraph: { title: `${p.title} · Tbrain`, description, url: `/careers/${p.slug}`, type: "website" },
    twitter: { card: "summary_large_image", title: `${p.title} · Tbrain`, description },
  };
}

const BASE_URL = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

/* schema.org JobPosting. Google wants the whole description as HTML and every
   fact in it visible on the page, so it is built from the same content model
   the page renders. No salary, closing date or directApply: the doc gives
   none of them, and email applications are not what directApply describes. */
function jobPostingJsonLd(p: Position) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const rich = (para: Para) => para.map((s) => (typeof s === "string" ? esc(s) : "b" in s ? `<strong>${esc(s.b)}</strong>` : esc(s.label))).join("");
  const leadList = (items: { lead: string; body: string }[]) => `<ul>${items.map((i) => `<li><strong>${esc(i.lead)}</strong> ${esc(i.body)}</li>`).join("")}</ul>`;
  const description = [
    `<h2>${esc(p.about.title)}</h2>${p.about.body.map((x) => `<p>${rich(x)}</p>`).join("")}`,
    `<h2>${esc(p.role.title)}</h2>${p.role.body.map((x) => `<p>${esc(x)}</p>`).join("")}`,
    `<h2>${esc(p.responsibilities.title)}</h2>${leadList(p.responsibilities.items)}`,
    `<h2>${esc(p.requirements.title)}</h2><ul>${p.requirements.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul><p>${esc(p.requirements.note)}</p>`,
    `<h2>${esc(p.why.title)}</h2>${leadList(p.why.items)}`,
    `<h2>${esc(p.application.title)}</h2><p>${rich(p.application.location)}</p><p>${esc(p.application.ask)} ${esc(p.application.email)}.</p>`,
  ].join("");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: p.title,
    description,
    datePosted: p.datePosted,
    employmentType: p.employmentType,
    identifier: { "@type": "PropertyValue", name: "Tbrain", value: p.slug },
    url: `${BASE_URL}/careers/${p.slug}`,
    hiringOrganization: { "@type": "Organization", name: "Tbrain", sameAs: BASE_URL },
    jobLocation: p.countries.map((c) => ({ "@type": "Place", address: { "@type": "PostalAddress", addressCountry: c } })),
  };
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="cr-section">
      <h2 id={`${id}-h`} className="cr-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function PositionPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = positionBySlug((await params).slug);
  if (!p) notFound();
  const { about, role, responsibilities, requirements, why, application } = p;

  return (
    <div className="cr">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd(p)).replace(/</g, "\\u003c") }}
      />
      <TrackClicks page="careers_posting" />
      <Header />
      <main id="main-content">
        <article className="cr-split" aria-labelledby="role-h">
          <header className="cr-aside cr-aside-card cr-card">
            <Link href="/careers" className="cr-back">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              All open positions
            </Link>
            <h1 id="role-h" className="cr-title cr-title-role">
              {bindDash(p.title)}
            </h1>
            <MetaChips p={p} company />
            <div className="cr-actions">
              <a href={applyHref(p)} data-cr-track="careers_apply_click" data-cr-where="aside" className="cr-btn cr-btn-primary">
                <Mail className="h-4 w-4" aria-hidden />
                Apply by email
              </a>
              <CopyEmail email={application.email} where="aside" />
            </div>
            <p className="cr-aside-email">
              <a href={applyHref(p)} data-cr-track="careers_apply_click" data-cr-where="aside_address" className="cr-link">
                {application.email}
              </a>
            </p>
          </header>

          <div className="cr-body cr-doc cr-card">
            <Section id="about" title={about.title}>
              {about.body.map((para, i) => (
                <p key={i} className="cr-p">
                  <Rich para={para} />
                </p>
              ))}
            </Section>

            <Section id="role" title={role.title}>
              {role.body.map((x) => (
                <p key={x} className="cr-p">
                  {x}
                </p>
              ))}
            </Section>

            <Section id="responsibilities" title={responsibilities.title}>
              <ul className="cr-list">
                {responsibilities.items.map((i) => (
                  <li key={i.lead}>
                    <b>{i.lead}</b> {i.body}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="requirements" title={requirements.title}>
              <ul className="cr-list">
                {requirements.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <p className="cr-p">{requirements.note}</p>
            </Section>

            <Section id="why" title={why.title}>
              <ul className="cr-list">
                {why.items.map((i) => (
                  <li key={i.lead}>
                    <b>{i.lead}</b> {i.body}
                  </li>
                ))}
              </ul>
            </Section>

            <Section id="apply" title={application.title}>
              <p className="cr-p">
                <Rich para={application.location} />
              </p>
              <div className="cr-apply">
                <p className="cr-p">
                  {application.ask}{" "}
                  <a href={applyHref(p)} data-cr-track="careers_apply_click" data-cr-where="apply_address" className="cr-link">
                    <b>{application.email}</b>
                  </a>
                  .
                </p>
                <div className="cr-actions">
                  <a href={applyHref(p)} data-cr-track="careers_apply_click" data-cr-where="apply_button" className="cr-btn cr-btn-primary">
                    <Mail className="h-4 w-4" aria-hidden />
                    Apply by email
                  </a>
                  <CopyEmail email={application.email} where="apply" />
                </div>
              </div>
              <p className="cr-p">
                <Rich para={application.learnMore} />
              </p>
            </Section>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
