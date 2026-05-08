import type { Metadata } from "next";
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
import { EXPERTISE_AREAS, SAMPLE_PROJECTS } from "@/lib/constants/marketing";
import { getServices, getExpertiseAreas } from "@/lib/landing/services";
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
};

export default async function AboutPage() {
  const valueCards = [
    {
      title: "Domain-Specific Expert Pods",
      description: "Coding, STEM, medical, manufacturing, agent tool use, and other high-stakes domains.",
      icon: Brain,
    },
    {
      title: "Custom software & tools",
      description: "Purpose-built workflows that make expert review measurable, auditable, and fast to operate.",
      icon: Workflow,
    },
    {
      title: "Verifiable loops",
      description: "Closed-loop reinforcement learning systems for agents to self-improve from concrete outcomes.",
      icon: CheckCircle,
    },
  ];

  const projectIcons = [MessageSquare, LineChart, Mic];
  const expertiseIcons = [Database, Brain, FlaskConical, Bot, Code2, LineChart, CheckCircle];

  const [services, domains] = await Promise.all([
    getServices("service"),
    getServices("domain"),
  ]);
  // Local fallback (kept for resilience even though getServices already returns
  // DOMAIN_PODS / SERVICES constants when DB is empty).
  const expertise = EXPERTISE_AREAS;
  void getExpertiseAreas; // expertise sourced from constants below

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

        {/* How we deliver value */}
        <section className="container mx-auto mt-24 px-3">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              / how we deliver value
            </p>
            <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Optimized for <span className="gradient-text">scaling complexity</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Legacy marketplaces break on high-stakes AI work. Tbrain provides
              verifiable software systems and expert-led loops required for
              agents to self-improve.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {valueCards.map((card) => (
              <article key={card.title} className="glass-card p-6">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                  <card.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </section>

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
        <section className="container mx-auto mt-24 px-3">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              / sample projects
            </p>
            <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Programs that turn expertise into <span className="gradient-text">model signal</span>
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
            {SAMPLE_PROJECTS.map((project, index) => {
              const Icon = projectIcons[index] ?? Bot;
              return (
                <article key={project.title} className="glass-card p-6">
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

        {/* Technical Expertise */}
        <section className="container mx-auto mt-24 px-3">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              / technical expertise
            </p>
            <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Deep technical expertise across <span className="gradient-text">hard domains</span>
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
            {expertise.map((area, index) => {
              const Icon = expertiseIcons[index] ?? CheckCircle;
              return (
                <article key={area.label} className="flex gap-4 rounded-2xl border p-5" style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}>
                  <span className="mt-1 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{area.label.replace(/:$/, "")}</h3>
                    <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {area.detail}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Meet the team CTA — replaces the duplicated Leadership block */}
        <section className="container mx-auto mt-24 px-3">
          <div
            className="mx-auto flex max-w-5xl flex-col items-center gap-6 rounded-3xl border p-8 text-center md:p-10"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
              <Users className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              Built by data and engineering operators
            </h2>
            <p className="max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Tbrain&apos;s leadership combines AI training data experience,
              expert-network operations, and outsourced engineering delivery
              for programs where quality needs to be measurable.
            </p>
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
            >
              Meet the team <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
