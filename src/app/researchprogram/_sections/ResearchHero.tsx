import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { RESEARCH_HERO, CONTACT, OFFER, MAIL_SUBJECT } from "@/lib/landing/research";
import { CaptureReel } from "./CaptureReel";
import { Container, Rise, mailto } from "./ui";

/* The program at a glance — each value is a phrase lifted from the brief,
   arranged as a drawing's title block rather than restated. */
const GLANCE: { k: string; v: string }[] = [
  { k: "For", v: "Faculty · postdocs · students" },
  { k: "Data", v: `${OFFER.data.figures[0].display} hours · egocentric` },
  { k: "Collection", v: "Free for academic research" },
  { k: "Formats", v: OFFER.formats.names.join(" · ") },
  { k: "Results", v: "Expected to be published openly" },
];

export function ResearchHero() {
  return (
    <section
      id="top"
      aria-labelledby="research-title"
      className="bp-grid bp-frame relative overflow-hidden"
      style={{ paddingTop: "clamp(104px, 10vw, 140px)", paddingBottom: "clamp(36px, 4vw, 56px)" }}
    >
      <div aria-hidden className="bp-aurora" />
      <Container>
        <div className="grid items-center gap-x-14 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-5">
            <Rise i={0}>
              <div className="bp-fig inline-flex items-center gap-2">
                <span aria-hidden style={{ width: 18, height: 1, background: "var(--bp-cyan)", opacity: 0.8 }} />
                {RESEARCH_HERO.program}
              </div>
            </Rise>

            <Rise i={1}>
              <p
                className="inline-flex items-center gap-2.5 rounded-2xl py-1.5 pl-3 pr-3.5 sm:rounded-full"
                style={{ background: "var(--bp-surface)", border: "1px solid var(--bp-line)", boxShadow: "var(--bp-card-shadow)", fontSize: 13, lineHeight: 1.35, color: "var(--bp-ink)", fontWeight: 500 }}
              >
                <span aria-hidden className="rs-live relative inline-flex h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--bp-green)" }} />
                {RESEARCH_HERO.status}
              </p>
            </Rise>
            </div>

            <Rise i={2}>
              <h1
                id="research-title"
                className="mt-6 font-semibold"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(40px, 5.4vw, 76px)",
                  lineHeight: 0.98,
                  letterSpacing: "-0.04em",
                  color: "var(--bp-ink)",
                  textWrap: "balance",
                }}
              >
                An open invitation to{" "}
                <span
                  style={{
                    background: "linear-gradient(100deg, var(--bp-cyan) 0%, var(--bp-purple) 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  robotics researchers
                </span>
              </h1>
            </Rise>

            <Rise i={3}>
              <p className="mt-8 max-w-[40rem]" style={{ fontSize: "clamp(17px, 1.45vw, 20px)", lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>
                {RESEARCH_HERO.lead}{" "}
                <span style={{ color: "var(--bp-ink)", fontWeight: 600 }}>{RESEARCH_HERO.question}</span>
              </p>
            </Rise>

            <Rise i={4}>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={mailto(CONTACT.person.email, MAIL_SUBJECT)}
                  data-rs-track="research_email_click"
                  data-rs-where="hero"
                  className="rs-btn rs-btn-solid inline-flex items-center justify-center gap-2.5 rounded-xl px-6 py-3.5"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {CONTACT.title}
                </a>
                <Link href={CONTACT.samples.href} data-rs-track="research_samples_click" data-rs-where="hero" className="rs-btn rs-btn-ghost group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5">
                  {CONTACT.samples.label}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
              <p className="bp-mono mt-5" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>
                {CONTACT.person.name} · {CONTACT.person.role} · {CONTACT.person.email}
              </p>
            </Rise>
          </div>

          <div className="lg:col-span-5">
            <Rise i={2} y={28}>
              <CaptureReel />
            </Rise>
          </div>
        </div>

        {/* Title block — the program on one line. */}
        <Rise i={5}>
          <dl
            className="bp-card mt-12 grid overflow-hidden md:grid-cols-5 lg:mt-14"
            style={{ borderRadius: 14 }}
            aria-label="Program at a glance"
          >
            {GLANCE.map((g) => (
              <div
                key={g.k}
                className="rs-glance-cell grid grid-cols-[104px_1fr] items-baseline gap-3 md:block"
                style={{ padding: "14px 20px" }}
              >
                <dt className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>{g.k}</dt>
                <dd className="md:mt-1.5" style={{ fontSize: 14.5, fontWeight: 600, color: "var(--bp-ink)", letterSpacing: "-0.005em" }}>{g.v}</dd>
              </div>
            ))}
          </dl>
        </Rise>
      </Container>
    </section>
  );
}
