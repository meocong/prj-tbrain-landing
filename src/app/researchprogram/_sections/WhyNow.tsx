import { ArrowUpRight } from "lucide-react";
import { WHY_NOW } from "@/lib/landing/research";
import { Reveal } from "./motion";
import { Container, H2, SECTION_PAD, SectionMark } from "./ui";

/** The motivation, laid out like a paper's introduction: running text with
    numbered references, a figure for the open question, a reference list. */
export function WhyNow() {
  const cites = WHY_NOW.citations;
  const P2_MARK = "composition, quality and structure";
  const [p2a, p2b] = WHY_NOW.p2.split(P2_MARK);

  return (
    <section id="why" aria-labelledby="why-title" className="relative scroll-mt-32" style={{ ...SECTION_PAD, background: "var(--bp-bg-2)", borderTop: "1px solid var(--bp-line)" }}>
      <Container>
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-36">
              <Reveal>
                <SectionMark index="01" />
                <H2 id="why-title" className="mt-5">{WHY_NOW.title}</H2>
              </Reveal>

              {/* FIG.02 — the question as the brief frames it: volume on one
                  side, composition / quality / structure on the other. */}
              <Reveal delay={0.12}>
                <figure className="bp-card mt-10 overflow-hidden" style={{ borderRadius: 14 }}>
                  <div className="flex items-center justify-between" style={{ padding: "10px 16px", borderBottom: "1px solid var(--bp-line)" }}>
                    <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-ink-faint)" }}>FIG.02 · the open question</span>
                    <span className="bp-mono" style={{ fontSize: 9.5, color: "var(--bp-cyan)" }}>?</span>
                  </div>
                  <div style={{ padding: "22px 20px 24px", fontFamily: "var(--font-mono)", fontSize: "clamp(13px, 1.15vw, 15px)", lineHeight: 2, color: "var(--bp-ink)" }}>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span style={{ color: "var(--bp-ink-faint)" }}>value</span>
                      <span style={{ color: "var(--bp-ink-faint)" }}>=</span>
                      <span style={{ color: "var(--bp-ink-dim)" }}>f(hours)<span style={{ color: "var(--bp-ink-faint)", fontWeight: 700 }}> ?</span></span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span style={{ color: "var(--bp-ink-faint)" }}>value</span>
                      <span style={{ color: "var(--bp-cyan)" }}>=</span>
                      <span>
                        f(<span style={{ color: "var(--bp-cyan)" }}>composition</span>, <span style={{ color: "var(--bp-cyan)" }}>quality</span>, <span style={{ color: "var(--bp-cyan)" }}>structure</span>)
                        <span style={{ color: "var(--bp-purple)", fontWeight: 700 }}> ?</span>
                      </span>
                    </div>
                  </div>
                  <figcaption className="bp-mono" style={{ padding: "10px 16px", fontSize: 9.5, color: "var(--bp-ink-faint)", borderTop: "1px dashed var(--bp-line)", background: "var(--bp-surface-2)" }}>
                    Recent work suggests that hours alone are a weak predictor of value
                  </figcaption>
                </figure>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <Reveal delay={0.05}>
              <p style={{ fontSize: "clamp(17px, 1.35vw, 19px)", lineHeight: 1.75, color: "var(--bp-ink-dim)" }}>
                {WHY_NOW.p1.map((seg, i) => {
                  if ("text" in seg) return <span key={i}>{seg.text}</span>;
                  const c = cites.find((x) => x.n === seg.cite)!;
                  return (
                    <span key={i} className="whitespace-nowrap">
                      <a href={c.href} target="_blank" rel="noopener noreferrer" className="rs-cite">{c.label}</a>
                      <a href={`#ref-${c.n}`} className="rs-sup" aria-label={`Reference ${c.n}`}>[{c.n}]</a>
                    </span>
                  );
                })}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <p
                className="mt-10 font-semibold"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(22px, 2.3vw, 30px)",
                  lineHeight: 1.32,
                  letterSpacing: "-0.018em",
                  color: "var(--bp-ink)",
                  paddingLeft: 22,
                  borderLeft: "3px solid var(--bp-cyan)",
                }}
              >
                {p2a}
                <span className="rs-mark">{P2_MARK}</span>
                {p2b.split(/(real-world)/).map((part, i) => (part === "real-world" ? <span key={i} className="whitespace-nowrap">{part}</span> : part))}
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="mt-14" style={{ borderTop: "1px solid var(--bp-line)", paddingTop: 22 }}>
                <h3 className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>References</h3>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2">
                  {cites.map((c) => (
                    <li key={c.n} id={`ref-${c.n}`} className="h-full scroll-mt-40">
                      <a
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bp-card rs-lift group flex h-full items-start gap-3"
                        style={{ padding: "14px 16px", borderRadius: 12, textDecoration: "none" }}
                      >
                        <span className="bp-mono shrink-0" style={{ fontSize: 11, color: "var(--bp-cyan)", letterSpacing: "0.04em" }}>[{c.n}]</span>
                        <span className="min-w-0 flex-1">
                          <span className="block" style={{ fontSize: 15, fontWeight: 600, color: "var(--bp-ink)" }}>{c.label}</span>
                          <span className="mt-1.5 block" style={{ fontSize: 14, lineHeight: 1.5, color: "var(--bp-ink-dim)" }}>{c.claim}</span>
                          <span className="mt-2.5 block truncate" style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--bp-ink-faint)" }}>{c.host}</span>
                        </span>
                        <ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" style={{ color: "var(--bp-ink-faint)" }} aria-hidden />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
