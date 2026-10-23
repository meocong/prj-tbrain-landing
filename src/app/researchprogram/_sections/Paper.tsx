import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Database, Mail } from "lucide-react";
import { ABOUT, COLLABORATION, CONTACT, MAIL_SUBJECT, OFFER, QUESTIONS, RESEARCH_HERO, WHY_NOW } from "@/lib/landing/research";
import { CopyEmail } from "./CopyEmail";
import { PaperFigure } from "./PaperFigure";
import { QuestionGlyph } from "./QuestionGlyph";
import { mailto } from "./ui";

/**
 * /researchprogram, set as an academic project page in Tbrain's own colours
 * (Tam Le, 2026-10-23: Tbrain colours, simple, a little academic — hero
 * included). Title block, a teaser figure with a numbered caption, an
 * abstract, then the brief's sections as one reading column with numbered
 * references. Every sentence is the brief's (src/lib/landing/research.ts);
 * the page adds only structure: "Figure 1", "Abstract", "References" and the
 * figure caption describing what the figure draws.
 */

function Cite({ n }: { n: number }) {
  const c = WHY_NOW.citations.find((x) => x.n === n)!;
  return (
    <>
      <a href={c.href} target="_blank" rel="noopener noreferrer" className="rp-link">
        {c.label}
      </a>
      <a href={`#ref-${n}`} className="rp-cite" aria-label={`Reference ${n}`}>
        [{n}]
      </a>
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="rp-section">
      <h2 id={`${id}-h`} className="rp-h2">
        {title}
      </h2>
      {children}
    </section>
  );
}

/* Table 1 — the program at a glance. Every cell is a fact from the brief
   (offer, contact audience, collaboration); the table only lines them up. */
function ProgramTable() {
  const { data, collection, formats } = OFFER;
  const rows: [string, React.ReactNode][] = [
    ["Egocentric human demonstrations", <span key="h" className="rp-num">{data.figures[0].display} hours</span>],
    ["Tasks", <span key="t" className="rp-num">about 3,000</span>],
    ["Real working environments", <><span className="rp-num">70+</span> · {data.places.join(", ")}</>],
    ["Data collection", collection.topic],
    ["Delivery formats", formats.names.join(", ")],
    ["Who we'd love to hear from", sentenceCase(CONTACT.roles.join(", ").replace(", students", " and students"))],
    ["Results", "Expected to be published openly"],
  ];
  return (
    <figure className="rp-table-wrap">
      <figcaption className="rp-table-cap">
        <b>Table 1.</b> The program at a glance.
      </figcaption>
      <table className="rp-table">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th scope="row">{k}</th>
              <td>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

const sentenceCase = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

export function PaperHero() {
  return (
    <header className="rp-hero">
      <div className="rp-col-wide text-center">
        <h1 className="rp-title">{RESEARCH_HERO.title}</h1>
        <p className="rp-authors">{RESEARCH_HERO.program}</p>
        <p className="rp-venue">
          <span aria-hidden className="rp-open" />
          {RESEARCH_HERO.status}
        </p>
        <div className="rp-actions">
          <a href={mailto(CONTACT.person.email, MAIL_SUBJECT)} data-rs-track="research_email_click" data-rs-where="hero" className="rp-btn rp-btn-primary">
            <Mail className="h-4 w-4" aria-hidden />
            {CONTACT.title}
          </a>
          <Link href={CONTACT.samples.href} data-rs-track="research_samples_click" data-rs-where="hero" className="rp-btn rp-btn-secondary">
            <Database className="h-4 w-4" aria-hidden />
            {CONTACT.samples.label}
          </Link>
        </div>
      </div>

      <figure className="rp-col-figure">
        <PaperFigure />
        <figcaption className="rp-caption">
          <b>Figure 1.</b> One recorded demonstration as data. (a) Both hands in 3D from the joint track, 21 joints per hand: solid where the pose was measured,
          dashed where it was guessed; drag to look around. (b) The state of each hand in every frame of the clip. Joint data only, no camera pixels; scale not shown.
        </figcaption>
      </figure>

      <div className="rp-col" id="abstract">
        <h2 className="rp-h2">Abstract</h2>
        <p className="rp-p">
          {RESEARCH_HERO.lead} <b>{RESEARCH_HERO.question}</b>
        </p>
        <p className="rp-p">
          {RESEARCH_HERO.weBring} {RESEARCH_HERO.youBring} {RESEARCH_HERO.shape}
        </p>

        <ProgramTable />
      </div>
    </header>
  );
}

export function PaperBody() {
  const [startingPoints, ...rest] = QUESTIONS.note.split(". ");
  const { data, collection, partner, formats } = OFFER;
  return (
    <div className="rp-col">
      <Section id="why" title={WHY_NOW.title}>
        <p className="rp-p">
          {WHY_NOW.p1.map((seg, i) => ("text" in seg ? <span key={i}>{seg.text}</span> : <Cite key={i} n={seg.cite} />))}
        </p>
        <p className="rp-p">{WHY_NOW.p2}</p>
      </Section>

      <Section id="questions" title={QUESTIONS.title}>
        <p className="rp-p">
          {startingPoints}. {rest.join(". ")}
        </p>
        <ol className="rp-rq" aria-label="Research questions">
          {QUESTIONS.items.map((q, i) => (
            <li key={q.key} id={`rq-${q.key}`}>
              <span className="rp-rq-glyph" aria-hidden>
                <QuestionGlyph k={q.key} size={36} />
              </span>
              <span className="min-w-0">
                <span className="rp-rq-n">RQ{i + 1}</span>
                <span className="rp-rq-topic">{q.topic}</span>
                <span className="rp-rq-q">{sentenceCase(q.question)}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="offer" title={OFFER.title}>
        <ul className="rp-list">
          <li>
            <b>{data.topic}:</b> {data.body}
          </li>
          <li>
            <b>{collection.topic}:</b> {collection.body}
          </li>
          <li>
            <b>{partner.topic}:</b> {partner.body}
          </li>
          <li>
            <b>{formats.topic}:</b> {formats.body}
          </li>
        </ul>
        <p className="rp-p">
          {COLLABORATION.sentence} {COLLABORATION.thesis} {COLLABORATION.open}
        </p>
      </Section>

      <Section id="contact" title={CONTACT.title}>
        <p className="rp-p">{CONTACT.audienceLead}</p>
        <p className="rp-p">
          {CONTACT.ask} {CONTACT.next}
        </p>
        <div className="rp-contact">
          <div className="flex min-w-0 items-center gap-3.5">
            <Image src={CONTACT.person.avatar} alt={CONTACT.person.name} width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
            <div className="min-w-0">
            <div className="rp-contact-name">{CONTACT.person.name}</div>
            <div className="rp-contact-role">{CONTACT.person.role}</div>
            <a href={mailto(CONTACT.person.email, MAIL_SUBJECT)} data-rs-track="research_email_click" data-rs-where="contact_address" className="rp-link rp-contact-email">
              {CONTACT.person.email}
            </a>
            </div>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <a href={mailto(CONTACT.person.email, MAIL_SUBJECT)} data-rs-track="research_email_click" data-rs-where="contact_button" className="rp-btn rp-btn-primary">
              <Mail className="h-4 w-4" aria-hidden />
              Send a short note
            </a>
            <CopyEmail email={CONTACT.person.email} />
          </div>
        </div>
        <p className="rp-p">
          {CONTACT.samples.label}:{" "}
          <Link href={CONTACT.samples.href} data-rs-track="research_samples_click" data-rs-where="contact" className="rp-link">
            {CONTACT.samples.display}
          </Link>
        </p>
      </Section>

      <Section id="about" title={ABOUT.title}>
        <p className="rp-p">
          {ABOUT.body}{" "}
          <Link href={ABOUT.site.href} className="rp-link">
            {ABOUT.site.display}
          </Link>
        </p>
      </Section>

      <section aria-labelledby="refs-h" className="rp-section">
        <h2 id="refs-h" className="rp-h2">
          References
        </h2>
        <ol className="rp-refs">
          {WHY_NOW.citations.map((c) => (
            <li key={c.n} id={`ref-${c.n}`}>
              <span className="rp-refs-n">[{c.n}]</span>
              <span>
                {c.label}.{" "}
                <a href={c.href} target="_blank" rel="noopener noreferrer" className="rp-link">
                  {c.host}
                  <ArrowUpRight className="ml-0.5 inline h-3.5 w-3.5 align-[-2px]" aria-hidden />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

