import { ArrowRight } from "lucide-react";
import { QUESTIONS, CONTACT, MAIL_SUBJECT } from "@/lib/landing/research";
import { QuestionGlyph, OpenGlyph } from "./QuestionGlyph";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { Container, H2, SECTION_PAD, SectionMark, mailto, sentenceCase } from "./ui";

export function Questions() {
  // The note is two sentences; the second is the invitation, so it closes the grid.
  const [startingPoints, ...rest] = QUESTIONS.note.split(". ");
  const yourQuestions = rest.join(". ");

  return (
    <section id="questions" aria-labelledby="questions-title" className="bp-grid bp-frame relative scroll-mt-32 overflow-hidden" style={{ ...SECTION_PAD, borderTop: "1px solid var(--bp-line)" }}>
      <Container>
        <div className="grid items-end gap-x-14 gap-y-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <SectionMark index="02" />
            <H2 id="questions-title" className="mt-5">{QUESTIONS.title}</H2>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={0.08}>
            <p className="lg:pb-2" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{startingPoints}.</p>
          </Reveal>
        </div>

        <Stagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {QUESTIONS.items.map((q, i) => (
            <StaggerItem key={q.key} i={i} className="h-full">
              <article className="bp-card rs-q flex h-full flex-col" style={{ padding: "26px 26px 30px", borderRadius: 16 }}>
                <div className="flex items-start justify-between">
                  <div
                    className="grid place-items-center"
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 14,
                      color: "var(--bp-cyan)",
                      background: "color-mix(in srgb, var(--bp-cyan) 7%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--bp-cyan) 22%, transparent)",
                    }}
                  >
                    <QuestionGlyph k={q.key} />
                  </div>
                  <span className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }} aria-hidden>
                    RQ.{String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-9">
                  <span className="bp-mono block" style={{ fontSize: 10.5, color: "var(--bp-cyan)" }}>
                    {q.topic}
                    <span className="sr-only">:</span>
                  </span>
                  <span
                    className="mt-2.5 block font-semibold"
                    style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(18px, 1.5vw, 21px)", lineHeight: 1.3, letterSpacing: "-0.012em", color: "var(--bp-ink)", textWrap: "pretty" }}
                  >
                    {sentenceCase(q.question)}
                  </span>
                </h3>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.05}>
          <div className="rs-dashed mt-5 flex flex-col gap-5 sm:flex-row sm:items-center" style={{ borderRadius: 16, padding: "22px 26px" }}>
            <div className="shrink-0" style={{ color: "var(--bp-cyan)" }}>
              <OpenGlyph size={48} />
            </div>
            <p className="flex-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "clamp(18px, 1.6vw, 22px)", lineHeight: 1.35, letterSpacing: "-0.012em", color: "var(--bp-ink)" }}>
              {yourQuestions}
            </p>
            <a href={mailto(CONTACT.person.email, MAIL_SUBJECT)} data-rs-track="research_email_click" data-rs-where="questions" className="rs-btn rs-btn-ghost group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3">
              {CONTACT.title}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
