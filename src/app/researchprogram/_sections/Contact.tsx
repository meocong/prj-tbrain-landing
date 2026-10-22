import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { ABOUT, CONTACT, MAIL_SUBJECT } from "@/lib/landing/research";
import { CopyEmail } from "./CopyEmail";
import { Reveal } from "./motion";
import { Container, H2, SECTION_PAD, SectionMark, mailto } from "./ui";

/**
 * The close. Painted on the dark half of the blueprint tokens in BOTH themes
 * (`dark` on the section re-scopes every --bp-* inside it, and Tailwind's
 * `dark:` variant follows), so the page ends on one decisive panel instead of
 * fading out on paper.
 */
export function Contact() {
  const { person } = CONTACT;
  const [audience] = CONTACT.audienceLead.split(" robot learning");
  const ask = CONTACT.ask.split(" to Tam Le")[0];

  return (
    <section id="contact" aria-labelledby="contact-title" className="dark rs-island relative scroll-mt-32 overflow-hidden" style={{ ...SECTION_PAD, color: "var(--bp-ink)" }}>
      {/* Grid texture, masked to the centre so the edges stay clean. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(var(--bp-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--bp-grid-line) 1px, transparent 1px)",
          backgroundSize: "var(--bp-grid) var(--bp-grid)",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, #000 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 40%, #000 30%, transparent 75%)",
        }}
      />
      <Container>
        <div className="grid gap-x-16 gap-y-10 lg:grid-cols-12 lg:gap-y-0">
          <div className="lg:col-span-7 lg:row-start-1">
            <Reveal>
              <SectionMark index="05" />
              <H2 id="contact-title" className="mt-5" style={{ fontSize: "clamp(40px, 6vw, 80px)" }}>{CONTACT.title}</H2>
            </Reveal>

          </div>
          <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1 lg:pt-6">
            <Reveal delay={0.1}>
              <div className="bp-card relative overflow-hidden" style={{ borderRadius: 22, padding: "clamp(24px, 2.6vw, 34px)", background: "color-mix(in srgb, var(--bp-panel) 78%, transparent)", WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)" }}>
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--bp-cyan) 30%, transparent), transparent 70%)", filter: "blur(10px)" }} />

                <div className="relative flex items-center gap-4">
                  <Image
                    src={person.avatar}
                    alt={person.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                    style={{ boxShadow: "0 0 0 2px var(--bp-bg), 0 0 0 4px color-mix(in srgb, var(--bp-cyan) 70%, transparent)" }}
                  />
                  <div>
                    <div className="font-semibold" style={{ fontFamily: "var(--font-heading)", fontSize: 21, letterSpacing: "-0.015em", color: "var(--bp-ink)" }}>{person.name}</div>
                    <div className="bp-mono mt-1" style={{ fontSize: 10.5, color: "var(--bp-ink-faint)" }}>{person.role}</div>
                  </div>
                </div>

                <a
                  href={mailto(person.email, MAIL_SUBJECT)}
                  data-rs-track="research_email_click"
                  data-rs-where="contact_address"
                  className="relative mt-7 block break-all font-semibold"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(20px, 2.1vw, 28px)", letterSpacing: "-0.02em", color: "var(--bp-cyan)", textDecoration: "none" }}
                >
                  {person.email}
                </a>

                <div className="relative mt-6 flex flex-col gap-2.5 sm:flex-row">
                  <a href={mailto(person.email, MAIL_SUBJECT)} data-rs-track="research_email_click" data-rs-where="contact_button" className="rs-btn rs-btn-solid inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl px-5 py-3">
                    <Mail className="h-4 w-4" aria-hidden />
                    Send a short note
                  </a>
                  <CopyEmail email={person.email} />
                </div>

                <div className="relative mt-7" style={{ borderTop: "1px solid var(--bp-line)", paddingTop: 18 }}>
                  <Link href={CONTACT.samples.href} data-rs-track="research_samples_click" data-rs-where="contact" className="group flex items-center justify-between gap-4" style={{ textDecoration: "none" }}>
                    <span>
                      <span className="bp-mono block" style={{ fontSize: 10, color: "var(--bp-ink-faint)" }}>{CONTACT.samples.label}</span>
                      <span className="mt-1 block" style={{ fontFamily: "var(--font-mono)", fontSize: 15, color: "var(--bp-ink)" }}>{CONTACT.samples.display}</span>
                    </span>
                    <span className="grid h-10 w-10 place-items-center rounded-full transition-transform group-hover:translate-x-1" style={{ border: "1px solid var(--bp-line-strong)", color: "var(--bp-ink)" }}>
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
          <div className="lg:col-span-7 lg:row-start-2">
            <Reveal delay={0.08}>
              <p className="sr-only">{CONTACT.audienceLead}</p>
              <div aria-hidden>
                <p className="mt-8 max-w-xl" style={{ fontSize: "clamp(18px, 1.5vw, 21px)", lineHeight: 1.55, color: "var(--bp-ink-dim)" }}>{audience}</p>
                <ul className="mt-5 flex max-w-2xl flex-wrap gap-2">
                  {CONTACT.fields.map((f) => (
                    <li
                      key={f}
                      className="rounded-full"
                      style={{ padding: "7px 14px", fontSize: 14, fontWeight: 500, color: "var(--bp-ink)", background: "color-mix(in srgb, var(--bp-cyan) 8%, transparent)", border: "1px solid var(--bp-line)" }}
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* The exchange the brief describes: your note, then our reply. */}
            <Reveal delay={0.14}>
              <ol className="mt-12 grid gap-4 sm:grid-cols-2">
                <li className="bp-card relative h-full" style={{ padding: "20px 22px", borderRadius: 16 }}>
                  <div className="bp-mono flex items-center gap-2" style={{ fontSize: 10, color: "var(--bp-cyan)" }}>
                    <span>01</span>
                    <span aria-hidden style={{ width: 18, height: 1, background: "currentColor", opacity: 0.6 }} />
                    <span>Your lab</span>
                  </div>
                  <p className="mt-3" style={{ fontSize: 16, lineHeight: 1.5, color: "var(--bp-ink)" }}>{ask}.</p>
                </li>
                <li className="bp-card relative h-full" style={{ padding: "20px 22px", borderRadius: 16 }}>
                  <div className="bp-mono flex items-center gap-2" style={{ fontSize: 10, color: "var(--bp-purple)" }}>
                    <span>02</span>
                    <span aria-hidden style={{ width: 18, height: 1, background: "currentColor", opacity: 0.6 }} />
                    <span>Tbrain</span>
                  </div>
                  <p className="mt-3" style={{ fontSize: 16, lineHeight: 1.5, color: "var(--bp-ink)" }}>{CONTACT.next}</p>
                </li>
              </ol>
            </Reveal>
          </div>
        </div>

        {/* About Tbrain closes the island rather than opening a second
            paper band above the footer (which repeated the logo). */}
        <Reveal delay={0.05}>
          <div id="about" className="mt-16 grid scroll-mt-32 gap-x-16 gap-y-4 lg:mt-20 lg:grid-cols-12" style={{ borderTop: "1px solid var(--bp-line)", paddingTop: 36 }}>
            <h2 id="about-title" className="bp-mono lg:col-span-5" style={{ fontSize: 11, color: "var(--bp-ink-faint)" }}>{ABOUT.title}</h2>
            <div className="lg:col-span-7">
              <p style={{ fontSize: "clamp(16px, 1.3vw, 18px)", lineHeight: 1.65, color: "var(--bp-ink-dim)" }}>{ABOUT.body}</p>
              <Link href={ABOUT.site.href} className="rs-cite bp-mono mt-4 inline-block" style={{ fontSize: 11.5 }}>
                {ABOUT.site.display}
              </Link>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
