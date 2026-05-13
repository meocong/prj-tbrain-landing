import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import { PlatformFeatureTour } from "@/components/marketing/platform/PlatformFeatureTour";
import { PlatformKpiBand } from "@/components/marketing/platform/PlatformKpiBand";
import { WorkflowLoop } from "@/components/marketing/platform/WorkflowLoop";
import { WorkflowBuilderShowcase } from "@/components/marketing/platform/WorkflowBuilderShowcase";
import { ArrowRight, Brain, Scale, Workflow, Sparkles, Cpu, ShieldCheck, Database, BarChart3 } from "lucide-react";
import { getExpertOsFeatures } from "@/lib/landing/expert-os";
import { VideoBackground } from "@/components/marketing/fx/VideoBackground";

export const metadata: Metadata = {
  title: "Expert OS | Agent & Expert Management Platform",
  description:
    "Expert OS is Tbrain's management platform for agent knowledge, expert operations, automated evaluation, and agentic workflows.",
  alternates: { canonical: "/platform" },
  openGraph: {
    title: "Expert OS | Agent & Expert Management Platform",
    description:
      "AI-native operations for the human side of agentic AI: knowledge bases, LLM-as-judge, agentic workflows, and agent identity.",
    url: "/platform",
  },
};

export const revalidate = 300;

const ICON_MAP: Record<string, React.ElementType> = {
  Brain,
  Scale,
  Workflow,
  Sparkles,
  Cpu,
  ShieldCheck,
  Database,
  BarChart3,
};

export default async function PlatformPage() {
  const features = await getExpertOsFeatures();

  return (
    <div>
      <link
        rel="preload"
        as="image"
        href="/images/platform-robotic-poster.jpg"
        fetchPriority="high"
      />
      <Header />
      <main className="pb-24">
        {/* Hero */}
        <section className="relative overflow-hidden px-3 pt-32 pb-20 text-center md:pt-36 md:pb-28">
          <VideoBackground
            sources={[
              {
                src: "/videos/platform-robotic-cinema.webm",
                srcMp4: "/videos/platform-robotic-cinema.mp4",
                poster: "/images/platform-robotic-poster.jpg",
              },
              {
                src: "/videos/automation-cinema.webm",
                srcMp4: "/videos/automation-cinema.mp4",
                poster: "/images/automation-cinema-poster.jpg",
              },
              {
                src: "/videos/datacenter-cinema.webm",
                srcMp4: "/videos/datacenter-cinema.mp4",
                poster: "/images/datacenter-cinema-poster.jpg",
              },
            ]}
            overlay="var(--platform-hero-video-overlay)"
          />
          <div className="container relative z-10 mx-auto max-w-5xl">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium" style={{ background: "var(--hero-chip-bg)", border: "1px solid var(--hero-chip-border)", color: "#6C3CF4", backdropFilter: "blur(10px)" }}>
              <Sparkles className="h-3 w-3" />
              Expert OS Platform
            </span>
            <h1
              className="mx-auto mt-6 max-w-4xl text-[34px] font-semibold leading-[1.1] sm:text-4xl md:text-6xl"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}
            >
              <span className="block md:inline">The management</span>{" "}
              <span className="block md:inline">platform for</span>{" "}
              <span className="gradient-text block md:inline">agents, experts,</span>{" "}
              <span className="gradient-text block">and evaluation</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: "var(--hero-muted)" }}>
              Expert OS helps teams manage expert operations, agent knowledge,
              automated evaluation, and agentic workflows in one production
              system.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#6C3CF4] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
              >
                Request a demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
                style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.10)", color: "var(--text-primary)", backdropFilter: "blur(10px)" }}
              >
                Explore services
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto mt-24 max-w-5xl px-3">
          <h2
            className="text-center text-3xl font-semibold mb-3"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Built for <span className="gradient-text">agent operations</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Three capabilities that ship together: knowledge, automated
            evaluation, and agentic workflows with persistent agent identity.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((f) => {
              const Icon = (ICON_MAP[f.icon] || Sparkles) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
              return (
                <div
                  key={f.id}
                  className="rounded-2xl p-6 md:p-8"
                  style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: "rgba(108,60,244,0.08)", border: "1px solid rgba(108,60,244,0.14)" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: "#6C3CF4" }} />
                  </div>
                  <h3
                    className="mt-4 text-xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto mt-24 max-w-4xl px-3">
          <div className="rounded-3xl p-8 md:p-12" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <h2
              className="text-center text-3xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How <span className="gradient-text">Expert OS</span> works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Three layers that make agentic systems coherent, evaluatable, and
              improvable.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { n: "01", title: "Knowledge", body: "Curated, versioned reference guides tied to each agent's job and operating context." },
                { n: "02", title: "Evaluation", body: "LLM-as-a-judge checks every output before final human judgment." },
                { n: "03", title: "Iteration", body: "Agentic workflow loops route feedback back into the system for measurable improvement." },
              ].map((step) => (
                <div key={step.n} className="text-center">
                  <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "rgba(108,60,244,0.4)" }}>
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Animated KPI band — production proof at a glance */}
        <section className="container mx-auto mt-24 max-w-6xl px-3">
          <PlatformKpiBand />
        </section>

        {/* Platform in action — full-bleed feature tour */}
        <section className="container mx-auto mt-24 max-w-6xl px-3">
          <div className="text-center mb-16">
            <p className="font-family_avt text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              / platform in action
            </p>
            <h2
              className="mt-3 text-3xl font-semibold md:text-5xl leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="gradient-text">Real surfaces</span>, running today
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-secondary)" }}>
              These are not mockups. They are screenshots from production
              deployments running our internal evaluation programs. Customer
              names are redacted; the metrics are real.
            </p>
          </div>
          <PlatformFeatureTour />
        </section>

        {/* Workflow builder — drag & drop canvas, live nodes, dashed connections */}
        <section className="container mx-auto mt-32 max-w-6xl px-3">
          <div className="text-center mb-12">
            <p className="font-family_avt text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              / workflow builder
            </p>
            <h2
              className="mt-3 text-3xl font-semibold md:text-5xl leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Drag, drop, <span className="gradient-text">ship a pipeline</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-secondary)" }}>
              Visual builder backed by Temporal. 24 node types including Auto QC, AI judge, branch, human review, webhook, foreach, and subflow, all composed without code and durable to retries and pauses.
            </p>
          </div>
          <WorkflowBuilderShowcase />
        </section>

        {/* Workflow loop — the unique technical moat */}
        <section className="container mx-auto mt-32 max-w-6xl px-3">
          <WorkflowLoop />
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24 px-3 text-center">
          <h2
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Want to see it in action?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Get a guided tour of Expert OS and see how it can plug into your
            team&apos;s agentic workflows.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            Talk to an expert
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
