import { Check, CookingPot, Database, Factory, FileBox, Hammer, SlidersHorizontal, Video, Wrench } from "lucide-react";
import { OFFER } from "@/lib/landing/research";
import { ENVIRONMENTS } from "@/lib/landing/physical-ai";
import { CountFigure } from "./CountFigure";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { Container, H2, SECTION_PAD, SectionMark, sentenceCase } from "./ui";

const PLACE_ICON = { factories: Factory, workshops: Hammer, kitchens: CookingPot, "repair shops": Wrench } as const;

/* Stills from the same ops footage as the hero, different stations, so the
   data card shows range rather than repeating the reel. */
const STRIP = ["dong_goi", "sap_xep_vai", "in_ma_so", "gan_tag"]
  .map((k) => ENVIRONMENTS.items.find((i) => i.key === k))
  .filter((x): x is (typeof ENVIRONMENTS.items)[number] => Boolean(x));

function CardHead({ n, icon: Icon, title, badge }: { n: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <span
          className="grid shrink-0 place-items-center"
          style={{ width: 42, height: 42, borderRadius: 12, color: "var(--bp-cyan)", background: "color-mix(in srgb, var(--bp-cyan) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--bp-cyan) 22%, transparent)" }}
        >
          <Icon className="h-[19px] w-[19px]" />
        </span>
        <h3 className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(19px, 1.6vw, 22px)", lineHeight: 1.2, letterSpacing: "-0.015em", color: "var(--bp-ink)" }}>
          {title}
        </h3>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
        <span className="bp-mono" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }} aria-hidden>{n}</span>
        {badge}
      </div>
    </div>
  );
}

export function Offer() {
  const { data, collection, partner, formats } = OFFER;
  return (
    <section id="offer" aria-labelledby="offer-title" className="relative scroll-mt-32" style={{ ...SECTION_PAD, background: "var(--bp-bg)", borderTop: "1px solid var(--bp-line)" }}>
      <Container>
        <Reveal>
          <SectionMark index="03" />
          <H2 id="offer-title" className="mt-5 max-w-3xl">{OFFER.title}</H2>
        </Reveal>

        <Stagger className="mt-14 grid gap-4 lg:grid-cols-12 lg:gap-5">
          {/* 01 · Real-world data — the anchor tile */}
          <StaggerItem i={0} className="lg:col-span-7 lg:row-span-3">
            <article className="bp-card rs-lift flex h-full flex-col overflow-hidden" style={{ borderRadius: 18 }}>
              <div className="grid grid-cols-4 gap-px" style={{ background: "var(--bp-line)" }} aria-hidden>
                {STRIP.map((c) => (
                  <div key={c.key} className="group relative overflow-hidden" style={{ aspectRatio: "4 / 5", background: "#0B0B14" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.poster} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    <div className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(to top, rgba(6,6,14,0.7), transparent 55%)" }} />
                    <span className="bp-mono absolute bottom-2.5 left-3 right-2 truncate" style={{ fontSize: 8.5, color: "rgba(255,255,255,0.85)", letterSpacing: "0.1em" }}>{c.name}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-1 flex-col" style={{ padding: "26px 28px 28px" }}>
                <CardHead n="01" icon={Database} title={data.topic} />

                <dl className="rs-figs mt-8 grid sm:grid-cols-3" style={{ borderTop: "1px solid var(--bp-line)", borderBottom: "1px solid var(--bp-line)" }}>
                  {data.figures.map((f) => (
                    <div key={f.unit} className="rs-fig flex flex-row-reverse items-baseline justify-between gap-4 sm:flex-col-reverse sm:items-start sm:justify-end sm:gap-0">
                      <dt className="bp-mono sm:mt-2.5" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>{f.unit}</dt>
                      <dd
                        className="font-semibold"
                        style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(34px, 4vw, 54px)", lineHeight: 1, letterSpacing: "-0.04em", color: "var(--bp-ink)" }}
                      >
                        <CountFigure value={f.n} prefix={f.prefix} suffix={f.suffix} />
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-6" style={{ fontSize: 16, lineHeight: 1.65, color: "var(--bp-ink-dim)" }}>{data.body}</p>

                <ul className="mt-auto flex flex-wrap gap-2 pt-7" aria-label="Environments include">
                  {data.places.map((p) => {
                    const Icon = PLACE_ICON[p];
                    return (
                      <li
                        key={p}
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ padding: "7px 13px 7px 11px", fontSize: 13.5, fontWeight: 500, color: "var(--bp-ink)", background: "var(--bp-surface-2)", border: "1px solid var(--bp-line)" }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: "var(--bp-cyan)" }} aria-hidden />
                        {sentenceCase(p)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          </StaggerItem>

          {/* 02 · Free collection */}
          <StaggerItem i={1} className="lg:col-span-5">
            <article className="bp-card rs-lift flex h-full flex-col" style={{ padding: "24px 26px 26px", borderRadius: 18 }}>
              <CardHead
                n="02"
                icon={Video}
                title={collection.topic}
                badge={
                  <span
                    className="bp-mono rounded-full"
                    style={{ fontSize: 9.5, fontWeight: 700, padding: "3px 9px", color: "var(--bp-green)", background: "color-mix(in srgb, var(--bp-green) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--bp-green) 35%, transparent)" }}
                    aria-hidden
                  >
                    Free
                  </span>
                }
              />
              <p className="mt-4" style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{sentenceCase(collection.body)}</p>
            </article>
          </StaggerItem>

          {/* 03 · Data design partner — the four choices as a checklist */}
          <StaggerItem i={2} className="lg:col-span-5">
            <article className="bp-card rs-lift flex h-full flex-col" style={{ padding: "24px 26px 26px", borderRadius: 18 }}>
              <CardHead n="03" icon={SlidersHorizontal} title={partner.topic} />
              <p className="mt-4" style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{sentenceCase(partner.body)}</p>
              <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Choices we help with">
                {partner.choices.map((c) => (
                  <li
                    key={c}
                    className="bp-mono flex items-center gap-1.5 rounded-lg"
                    style={{ fontSize: 10, padding: "8px 10px", color: "var(--bp-ink)", background: "var(--bp-surface-2)", border: "1px solid var(--bp-line)" }}
                  >
                    <Check className="h-3 w-3 shrink-0" style={{ color: "var(--bp-cyan)" }} aria-hidden />
                    {c}
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>

          {/* 04 · Formats */}
          <StaggerItem i={3} className="lg:col-span-5">
            <article className="bp-card rs-lift flex h-full flex-col" style={{ padding: "24px 26px 26px", borderRadius: 18 }}>
              <CardHead n="04" icon={FileBox} title={formats.topic} />
              <p className="mt-4" style={{ fontSize: 15.5, lineHeight: 1.6, color: "var(--bp-ink-dim)" }}>{sentenceCase(formats.body)}</p>
              <ul className="mt-5 flex flex-wrap gap-2.5" aria-label="Formats">
                {formats.names.map((f) => (
                  <li
                    key={f}
                    className="inline-flex items-center gap-2 rounded-lg"
                    style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600, padding: "8px 12px", color: "var(--bp-code-ink)", background: "var(--bp-code-bg)", border: "1px solid var(--bp-code-line)" }}
                  >
                    <span aria-hidden style={{ width: 7, height: 7, borderRadius: 2, background: "var(--bp-cyan)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </article>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
