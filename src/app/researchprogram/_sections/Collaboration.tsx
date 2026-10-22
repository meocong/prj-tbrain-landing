import { BookOpenCheck, GraduationCap } from "lucide-react";
import { COLLABORATION } from "@/lib/landing/research";
import { Reveal } from "./motion";
import { Container, SECTION_PAD, SectionMark } from "./ui";

/** "as light as …" / "as deep as …" → the qualifier and the thing. */
function split(s: string) {
  const m = /^(as \w+ as)\s+(.*)$/.exec(s);
  return m ? { q: m[1], v: m[2] } : { q: "", v: s };
}

export function Collaboration() {
  const light = split(COLLABORATION.light);
  const deep = split(COLLABORATION.deep);

  return (
    <section id="collaborate" aria-labelledby="collab-title" className="relative scroll-mt-32" style={{ ...SECTION_PAD, background: "var(--bp-bg-2)", borderTop: "1px solid var(--bp-line)" }}>
      <Container>
        <Reveal>
          <SectionMark index="04" />
          <h2
            id="collab-title"
            className="mt-5 max-w-5xl font-semibold"
            style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(26px, 3.3vw, 44px)", lineHeight: 1.14, letterSpacing: "-0.026em", color: "var(--bp-ink)", textWrap: "balance" }}
          >
            {COLLABORATION.sentence.split(/(co-designed)/).map((part, i) =>
              part === "co-designed" ? <span key={i} className="whitespace-nowrap">{part}</span> : part
            )}
          </h2>
        </Reveal>

        {/* The spectrum: light ←→ deep. */}
        <Reveal delay={0.08}>
          <div className="mt-14 md:mt-16" aria-hidden>
            <div className="flex items-center justify-between">
              <span className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-cyan)" }}>Light</span>
              <span className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-purple)" }}>Deep</span>
            </div>
            <div className="relative mt-3 h-[6px] rounded-full" style={{ background: "var(--bp-line)" }}>
              <div className="rs-track absolute inset-0 rounded-full" />
              {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className="absolute top-1/2 h-3 w-px -translate-y-1/2" style={{ left: `${(i + 1) * 10}%`, background: "var(--bp-bg-2)", opacity: 0.9 }} />
              ))}
              <span className="absolute left-0 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "var(--bp-bg-2)", border: "2px solid var(--bp-cyan)", boxShadow: "0 0 0 5px color-mix(in srgb, var(--bp-cyan) 14%, transparent)" }} />
              <span className="absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 translate-x-1/2 rounded-full" style={{ background: "var(--bp-bg-2)", border: "2px solid var(--bp-purple)", boxShadow: "0 0 0 5px color-mix(in srgb, var(--bp-purple) 14%, transparent)" }} />
            </div>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal delay={0.12}>
            <div className="bp-card h-full" style={{ padding: "22px 24px", borderRadius: 16, borderTop: "3px solid var(--bp-cyan)" }}>
              <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>{light.q}</div>
              <div className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px, 1.9vw, 26px)", lineHeight: 1.2, letterSpacing: "-0.018em", color: "var(--bp-ink)" }}>{light.v}</div>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="bp-card h-full md:text-right" style={{ padding: "22px 24px", borderRadius: 16, borderTop: "3px solid var(--bp-purple)" }}>
              <div className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>{deep.q}</div>
              <div className="mt-2 font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(20px, 1.9vw, 26px)", lineHeight: 1.2, letterSpacing: "-0.018em", color: "var(--bp-ink)" }}>{deep.v}</div>
            </div>
          </Reveal>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[
            { Icon: GraduationCap, text: COLLABORATION.thesis },
            { Icon: BookOpenCheck, text: COLLABORATION.open },
          ].map(({ Icon, text }, i) => (
            <Reveal key={text} delay={0.22 + i * 0.06}>
              <div className="flex h-full items-center gap-4 rounded-2xl" style={{ padding: "18px 22px", background: "var(--bp-surface-2)", border: "1px solid var(--bp-line)" }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full" style={{ color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 9%, transparent)" }}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden />
                </span>
                <p style={{ fontSize: 16.5, fontWeight: 500, lineHeight: 1.45, color: "var(--bp-ink)" }}>{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
