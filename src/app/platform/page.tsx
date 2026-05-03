import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import { ArrowRight, Brain, Scale, Workflow, Sparkles, Cpu, ShieldCheck, Database, BarChart3 } from "lucide-react";
import { getExpertOsFeatures } from "@/lib/landing/expert-os";
import { VideoBackground } from "@/components/marketing/fx/VideoBackground";

export const metadata: Metadata = {
  title: "Platform — Expert OS",
  description:
    "The platform behind Tbrain — AI-native operations for managing agents, knowledge, and quality at scale.",
  alternates: { canonical: "/platform" },
  openGraph: {
    title: "Platform — Expert OS by Tbrain",
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
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="block md:inline">The operating</span>{" "}
              <span className="block md:inline">system for agents</span>{" "}
              <span className="gradient-text block md:inline">that improve</span>{" "}
              <span className="gradient-text block">agents</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: "var(--hero-muted)" }}>
              Tbrain&apos;s platform powers our delivery — from one-to-one agent
              training to LLM-as-a-judge evaluation. The same infrastructure is
              available to enterprise teams running agentic workflows at scale.
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
            Built for <span className="gradient-text">agentic teams</span>
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-base text-[#78818f]">
            Four capabilities that ship together — knowledge, evaluation, workflow, and identity.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((f) => {
              const Icon = (ICON_MAP[f.icon] || Sparkles) as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
              return (
                <div
                  key={f.id}
                  className="rounded-2xl p-6 md:p-8"
                  style={{ background: "white", border: "1px solid rgba(15,23,42,0.06)", boxShadow: "0 6px 24px -8px rgba(15,23,42,0.10)" }}
                >
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: "rgba(108,60,244,0.08)", border: "1px solid rgba(108,60,244,0.14)" }}
                  >
                    <Icon className="h-6 w-6" style={{ color: "#6C3CF4" }} />
                  </div>
                  <h3
                    className="mt-4 text-xl font-semibold"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#78818f]">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="container mx-auto mt-24 max-w-4xl px-3">
          <div className="rounded-3xl p-8 md:p-12" style={{ background: "linear-gradient(135deg, rgba(108,60,244,0.04), rgba(16,185,129,0.04))", border: "1px solid rgba(15,23,42,0.06)" }}>
            <h2
              className="text-center text-3xl font-semibold"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              How <span className="gradient-text">Expert OS</span> works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-base text-[#78818f]">
              Three layers that make agentic systems coherent, evaluatable, and improvable.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { n: "01", title: "Knowledge", body: "Curated, versioned reference content tied to each agent's identity." },
                { n: "02", title: "Evaluation", body: "Automated LLM-as-judge first, expert review for the edge cases." },
                { n: "03", title: "Iteration", body: "Workflow loops where agents learn from agents — measurable improvement over time." },
              ].map((step) => (
                <div key={step.n} className="text-center">
                  <span className="text-3xl font-bold" style={{ fontFamily: "var(--font-heading)", color: "rgba(108,60,244,0.4)" }}>
                    {step.n}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#78818f]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto mt-24 px-3 text-center">
          <h2
            className="text-3xl font-semibold"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Want to see it in action?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-[#78818f]">
            Get a guided tour of Expert OS and see how it can plug into your team&apos;s agentic workflows.
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
