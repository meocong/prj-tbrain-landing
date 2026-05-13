import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle,
  Code,
  Code2,
  Cpu,
  Database,
  Factory,
  FlaskConical,
  Globe,
  Heart,
  Languages,
  LineChart,
  MessageSquare,
  Mic,
  ShieldCheck,
  Stethoscope,
  Tags,
  Terminal,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";
import { getAboutCardGroups } from "@/lib/landing/about-cards";
import { getAboutSections, type AboutSection } from "@/lib/landing/about-sections";
import { getServices } from "@/lib/landing/services";
import { StatsGrid } from "./stats-grid";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Tbrain — the improvement layer for agentic AI. Custom expert data, benchmark creation, evaluation, and domain pods for frontier AI teams.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Tbrain",
    description:
      "The improvement layer for agentic AI: expert data, benchmarks, evaluation, and domain pods.",
    url: "/about",
  },
};

export const revalidate = 300;

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Tags,
  BarChart3,
  Database,
  ShieldCheck,
  Users,
  Bot,
  Code,
  Terminal,
  Stethoscope,
  Heart,
  Factory,
  Wrench,
  Globe,
  Languages,
  Cpu,
  Workflow,
  CheckCircle,
  MessageSquare,
  LineChart,
  Mic,
  Code2,
  FlaskConical,
};

function SectionHeading({
  section,
  as = "h2",
  headingClassName = "mt-4 text-3xl font-medium md:text-5xl",
}: {
  section: AboutSection;
  as?: "h2" | "h3";
  headingClassName?: string;
}) {
  const Heading = as;

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
        {section.eyebrow}
      </p>
      <Heading className={headingClassName} style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
        {section.titleBefore}
        {section.titleHighlight ? (
          <>
            {" "}
            <span className="gradient-text">{section.titleHighlight}</span>
          </>
        ) : null}
        {section.titleAfter ? ` ${section.titleAfter}` : null}
      </Heading>
      {section.description ? (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {section.description}
        </p>
      ) : null}
    </div>
  );
}

export default async function AboutPage() {
  const [services, domains, aboutCards, aboutSections] = await Promise.all([
    getServices("service"),
    getServices("domain"),
    getAboutCardGroups(),
    getAboutSections(),
  ]);

  const sectionByGroup = Object.fromEntries(aboutSections.map((section) => [section.groupKey, section])) as Partial<
    Record<AboutSection["groupKey"], AboutSection>
  >;
  const companyCards = aboutCards.company;
  const valueCards = aboutCards.value;
  const sampleProjects = aboutCards.sample_projects;
  const expertise = aboutCards.expertise;
  const coreProfiles = aboutCards.team;
  const experts = aboutCards.experts;

  return (
    <div>
      <Header />
      <main className="pb-24 pt-32">
        {/* Hero */}
        <section className="container mx-auto px-3 text-center">
          <h1
            className="text-4xl font-semibold md:text-6xl"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            The improvement layer for{" "}
            <span className="gradient-text">agentic AI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Expert-validated environments, data, and evaluation programs that
            make agentic AI measurably better. Run by domain pods built for
            high-stakes work.
          </p>
        </section>

        {/* Stats */}
        <section className="container mx-auto mt-20 px-3">
          <StatsGrid />
        </section>

        {/* Company, mission, and team */}
        {sectionByGroup.company && (
          <section className="container mx-auto mt-24 px-3">
          <SectionHeading section={sectionByGroup.company} />

          <div className="mx-auto mt-12 grid max-w-6xl gap-5 md:grid-cols-3">
            {companyCards.map((card) => {
              const Icon = (ICON_MAP[card.icon ?? ""] || Factory) as React.ComponentType<{ className?: string }>;
              return (
              <article
                key={card.slug}
                className="rounded-2xl border p-6"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--text-muted)" }}>
                    {card.label}
                  </p>
                </div>
                <h3 className="mt-5 text-xl font-semibold leading-snug" style={{ fontFamily: "var(--font-heading)" }}>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {card.description}
                </p>
              </article>
              );
            })}
          </div>
          </section>
        )}

        {/* How we deliver value */}
        {sectionByGroup.value && (
          <section className="container mx-auto mt-24 px-3">
          <SectionHeading section={sectionByGroup.value} />

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {valueCards.map((card) => {
              const Icon = (ICON_MAP[card.icon ?? ""] || Brain) as React.ComponentType<{ className?: string }>;
              return (
              <article key={card.slug} className="glass-card p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {card.description}
                </p>
              </article>
              );
            })}
          </div>
          </section>
        )}

        {/* What we deliver — Services (merged from /services) */}
        <section id="services" className="container mx-auto mt-24 scroll-mt-28 px-3">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              / what we deliver
            </p>
            <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Three core <span className="gradient-text">service lines</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Pre-training, post-training, fine-tuning, and agentic evaluation
              workflows — each delivered by a specialized expert pod.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc, i) => {
              const Icon = (ICON_MAP[svc.icon] || Database) as React.ComponentType<{ className?: string }>;
              return (
                <article key={i} className="glass-card-hover p-6">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: "rgba(108, 60, 244, 0.08)" }}
                  >
                    <Icon className="h-6 w-6 text-[#6C3CF4]" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    {svc.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {svc.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Domains & Expert Pods (merged from /services) */}
        {domains.length > 0 && (
          <section id="domains" className="container mx-auto mt-24 scroll-mt-28 px-3">
            <div className="mx-auto max-w-3xl text-center">
              <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                / domains &amp; expert pods
              </p>
              <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
                Where generic teams <span className="gradient-text">aren&apos;t enough</span>
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Specialized pods for the domains where accuracy depends on
                depth, not headcount.
              </p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((d, i) => {
                const Icon = (ICON_MAP[d.icon] || Globe) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
                return (
                  <article key={i} className="glass-card-hover p-6">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{ backgroundColor: "rgba(16, 185, 129, 0.08)" }}
                    >
                      <Icon className="h-6 w-6" style={{ color: "#10B981" }} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                      {d.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {d.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Sample Projects */}
        {sectionByGroup.sample_projects && (
          <section className="container mx-auto mt-24 px-3">
          <SectionHeading section={sectionByGroup.sample_projects} />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {sampleProjects.map((project) => {
              const Icon = (ICON_MAP[project.icon ?? ""] || Bot) as React.ComponentType<{ className?: string }>;
              return (
                <article key={project.slug} className="glass-card p-6">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    {project.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {project.description}
                  </p>
                </article>
              );
            })}
          </div>
          </section>
        )}

        {/* Technical Expertise */}
        {sectionByGroup.expertise && (
          <section className="container mx-auto mt-24 px-3">
          <SectionHeading section={sectionByGroup.expertise} />
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
            {expertise.map((area) => {
              const Icon = (ICON_MAP[area.icon ?? ""] || CheckCircle) as React.ComponentType<{ className?: string }>;
              return (
                <article key={area.slug} className="flex gap-4 rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
                  <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{area.title.replace(/:$/, "")}</h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {area.description}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
          </section>
        )}

        {/* Team */}
        <section className="container mx-auto mt-24 px-3">
          {sectionByGroup.team && <SectionHeading section={sectionByGroup.team} />}

          {sectionByGroup.team && (
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-2">
            {coreProfiles.map((person) => {
              const projects = Array.isArray(person.meta.projects)
                ? person.meta.projects.filter((item): item is string => typeof item === "string")
                : [];
              return (
              <article
                key={person.slug}
                className="rounded-3xl p-6 md:p-8"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-start gap-5">
                  <Image
                    src={person.imageUrl || "/images/avt-tamle.png"}
                    width={96}
                    height={96}
                    alt={person.title}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#6C3CF4" }}>
                      {person.label}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                      {person.title}
                    </h3>
                  </div>
                </div>
                <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {person.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {projects.map((project) => (
                    <span
                      key={project}
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: "var(--hero-chip-bg)",
                        border: "1px solid var(--hero-chip-border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {project}
                    </span>
                  ))}
                </div>
              </article>
              );
            })}
          </div>
          )}

          <div
            className="mx-auto mt-12 grid max-w-6xl gap-0 overflow-hidden rounded-3xl md:grid-cols-[0.9fr_1.1fr]"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[440px]">
              <Image
                src="/images/office.png"
                alt="Tbrain office in Wilmington, DE"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="font-family_avt text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                / our office
              </p>
              <h3
                className="mt-3 text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
              >
                Built in <span className="gradient-text">Wilmington, DE</span>, shipping for frontier AI
              </h3>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Engineers, expert ops, and program managers work side by side from
                our Wilmington headquarters. Daily standups, shared review queues, and
                domain pods keep delivery tight across timezones.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    HQ
                  </dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Wilmington, DE
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Working hours
                  </dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Cross-TZ delivery
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Network
                  </dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Global experts
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {sectionByGroup.experts && (
            <>
          <SectionHeading
            section={sectionByGroup.experts}
            as="h3"
            headingClassName="mt-3 text-3xl font-semibold md:text-5xl"
          />

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {experts.map((expert) => (
              <article key={expert.slug} className="text-center">
                <Image
                  src={expert.imageUrl || "/images/avt-1.png"}
                  width={128}
                  height={128}
                  alt={expert.title}
                  className="mx-auto h-32 w-32 rounded-3xl object-cover"
                />
                <h4 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                  {expert.title}
                </h4>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "#6C3CF4" }}>
                  {expert.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {expert.description}
                </p>
              </article>
            ))}
          </div>
            </>
          )}
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24 px-3 text-center">
          <h2 className="text-3xl font-medium" style={{ fontFamily: "var(--font-heading)" }}>
            Ready to start now?
          </h2>
          <p className="mx-auto mt-3 max-w-xl" style={{ color: "var(--text-secondary)" }}>
            Whether you need a benchmark, a training data program, or a managed
            expert workflow for a complex domain, Tbrain can help you move faster
            with higher confidence.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
