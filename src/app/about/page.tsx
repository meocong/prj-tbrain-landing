import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bot, Brain, CheckCircle, Code2, Database, FlaskConical, LineChart, MessageSquare, Mic, Users, Workflow } from "lucide-react";
import { EXPERTISE_AREAS, LEADERSHIP, SAMPLE_PROJECTS } from "@/lib/constants/marketing";
import { StatsGrid } from "./stats-grid";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Tbrain — the improvement layer for agentic AI training data, evaluation, and expert-led validation systems.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Tbrain",
    description:
      "Tbrain provides expert-validated environments and data to measure and improve agent performance.",
    url: "/about",
  },
};

export default function AboutPage() {
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
            Expert-validated environments and data to measure and improve
            agent performance. Fast, scalable, and reliable.
          </p>
        </section>

        {/* Stats */}
        <section className="container mx-auto mt-20 px-3">
          <StatsGrid />
        </section>

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

        <section className="container mx-auto mt-24 px-3">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              / sample projects
            </p>
            <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Data programs that turn expertise into model signal
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

        <section className="container mx-auto mt-24 px-3">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              / technical expertise
            </p>
            <h2 className="mt-4 text-3xl font-medium md:text-5xl" style={{ fontFamily: "var(--font-heading)" }}>
              Deep technical expertise across hard domains
            </h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
            {EXPERTISE_AREAS.map((area, index) => {
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

        <section className="container mx-auto mt-24 px-3">
          <div
            className="mx-auto grid max-w-5xl gap-8 rounded-3xl border p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                <Users className="h-6 w-6" />
              </span>
              <p className="mt-6 font-family_avt text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                / leadership
              </p>
              <h2 className="mt-4 text-3xl font-medium md:text-4xl" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                Built by data and engineering operators
              </h2>
              <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Tbrain&apos;s leadership combines AI training data experience,
                expert-network operations, and outsourced engineering delivery
                for programs where quality needs to be measurable.
              </p>
              <Link
                href="/team"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: "#6C3CF4" }}
              >
                Meet the team <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4">
              {LEADERSHIP.map((person) => (
                <article
                  key={person.name}
                  className="flex gap-4 rounded-2xl border p-5"
                  style={{ background: "var(--bg-page)", borderColor: "var(--border-subtle)" }}
                >
                  <Image
                    src={person.avatar}
                    width={64}
                    height={64}
                    alt={person.name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                      {person.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {person.bio}
                    </p>
                  </div>
                </article>
              ))}
            </div>
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
