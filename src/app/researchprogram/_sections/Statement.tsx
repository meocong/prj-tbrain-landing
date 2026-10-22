import { RESEARCH_HERO } from "@/lib/landing/research";
import { ScrollWords } from "./ScrollWords";
import { Container } from "./ui";
import { Reveal } from "./motion";

/** "We bring … You bring …" — the brief's opening deal, set as one statement. */
export function Statement() {
  return (
    <section
      aria-label="How a collaboration works"
      className="relative"
      style={{ background: "var(--bp-bg)", borderTop: "1px solid var(--bp-line)" }}
    >
      <Container style={{ paddingTop: "clamp(72px, 9vw, 136px)", paddingBottom: "clamp(72px, 9vw, 136px)" }}>
        <div className="grid items-end gap-x-14 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-9">
            <div className="mb-8 flex items-center gap-3" aria-hidden>
              <span className="bp-mono rounded-full px-2.5 py-1" style={{ fontSize: 10, color: "var(--bp-ink-dim)", border: "1px solid var(--bp-line-strong)" }}>Tbrain</span>
              <span style={{ width: 28, height: 1, background: "var(--bp-line-strong)" }} />
              <span className="bp-mono" style={{ fontSize: 12, color: "var(--bp-ink-faint)" }}>+</span>
              <span style={{ width: 28, height: 1, background: "var(--bp-line-strong)" }} />
              <span className="bp-mono rounded-full px-2.5 py-1" style={{ fontSize: 10, color: "var(--bp-cyan)", border: "1px solid color-mix(in srgb, var(--bp-cyan) 50%, transparent)", background: "color-mix(in srgb, var(--bp-cyan) 7%, transparent)" }}>Your lab</span>
            </div>
            <ScrollWords
              className="font-semibold"
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(30px, 4.3vw, 60px)",
                lineHeight: 1.08,
                letterSpacing: "-0.032em",
                textWrap: "balance",
              }}
              parts={[
                { text: RESEARCH_HERO.weBring, color: "var(--bp-ink)" },
                { text: RESEARCH_HERO.youBring, color: "var(--bp-cyan)" },
              ]}
            />
          </div>
          <Reveal className="lg:col-span-3" delay={0.1}>
            <p className="lg:pb-3" style={{ fontSize: 17, lineHeight: 1.6, color: "var(--bp-ink-dim)", borderLeft: "2px solid var(--bp-cyan)", paddingLeft: 18 }}>
              {RESEARCH_HERO.shape}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
