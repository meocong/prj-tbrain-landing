import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  Brain,
  CheckCircle2,
  Cpu,
  Database,
  GitBranch,
  Layers3,
  Network,
  Scale,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { getExpertOsFeatures } from "@/lib/landing/expert-os";

export const metadata: Metadata = {
  title: "Technology",
  description:
    "Tbrain technology for platform capabilities, Labelbox-style operations, model integration, workflow automation, and AI-native quality control.",
  alternates: { canonical: "/technology" },
  openGraph: {
    title: "Tbrain Technology",
    description:
      "The operating layer behind Tbrain data programs: expert workflows, model integrations, QA gates, and delivery automation.",
    url: "/technology",
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
  Bot,
};

const PLATFORM_LAYERS = [
  {
    title: "Program schema",
    description:
      "Task taxonomies, rubrics, reviewer rules, acceptance criteria, and delivery formats are versioned before production starts.",
    icon: Layers3,
    accent: "#6C3CF4",
  },
  {
    title: "Expert operations",
    description:
      "Assignment, calibration, review queues, dispute handling, and throughput monitoring keep every batch accountable.",
    icon: Network,
    accent: "#0EA5E9",
  },
  {
    title: "AI-native QC",
    description:
      "Model checks screen submissions, detect edge cases, and route uncertain work to senior reviewers before delivery.",
    icon: ShieldCheck,
    accent: "#10B981",
  },
  {
    title: "Delivery automation",
    description:
      "Exports, metadata, audit trails, and customer handoff packages are generated from the same operating system.",
    icon: Boxes,
    accent: "#F59E0B",
  },
];

const PARITY_ITEMS = [
  "Project setup, ontology, instructions, and task routing",
  "Reviewer queues, consensus review, benchmark tasks, and gold sets",
  "Batch-level acceptance checks, sampling plans, and quality reports",
  "Exports with labels, metadata, issue history, and delivery notes",
];

const INTEGRATIONS = [
  {
    title: "Model evaluation",
    body: "LLM judges, rule checks, and deterministic validators score outputs before final human review.",
    icon: Scale,
  },
  {
    title: "Data stores",
    body: "Program data can sync through Supabase, object storage, and customer-specific export targets.",
    icon: Database,
  },
  {
    title: "Agent workflows",
    body: "Automated nodes handle QC, routing, notifications, retries, and approval gates for complex programs.",
    icon: GitBranch,
  },
];

const WORKFLOW_STEPS = [
  { title: "Scope", body: "Define task, rubric, domain, and quality bar.", icon: Brain, color: "#6C3CF4" },
  { title: "Route", body: "Assign work to calibrated experts and reviewers.", icon: Network, color: "#0EA5E9" },
  { title: "Check", body: "Run AI QC, gold tests, and sampling review.", icon: ShieldCheck, color: "#10B981" },
  { title: "Integrate", body: "Package outputs for model teams and feedback loops.", icon: Cpu, color: "#F59E0B" },
];

export default async function TechnologyPage() {
  const capabilities = await getExpertOsFeatures();

  return (
    <div>
      <Header />
      <main className="pt-28 pb-24" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
        <section className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#6C3CF4" }}>
            Technology
          </p>
          <h1
            className="mx-auto mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}
          >
            The operating layer behind{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #6C3CF4, #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              managed AI data
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-secondary)" }}>
            Tbrain combines platform tooling, expert operations, model checks,
            and delivery automation so data programs can move from ambiguous
            scope to auditable output.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/platform"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
            >
              Explore platform <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#workflow"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:border-[#6C3CF4]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            >
              View workflow
            </Link>
          </div>
        </section>

        <section className="container mx-auto mt-20 px-4">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {PLATFORM_LAYERS.map((layer) => {
              const Icon = layer.icon;
              return (
                <article
                  key={layer.title}
                  className="rounded-2xl border p-6"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <span
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: `${layer.accent}18`, border: `1px solid ${layer.accent}33`, color: layer.accent }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                    {layer.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {layer.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                Platform capability
              </p>
              <h2 className="mt-4 text-3xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                CMS-backed capabilities with production fallbacks
              </h2>
              <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                The capability list is loaded from the same Expert OS content
                source used by the platform page, with a local fallback so the
                public page stays stable during CMS or network issues.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {capabilities.map((capability) => {
                const Icon = (ICON_MAP[capability.icon] || Sparkles) as React.ComponentType<{ className?: string }>;
                return (
                  <article
                    key={capability.id}
                    className="rounded-2xl border p-5"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                      {capability.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {capability.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div
              className="rounded-2xl border p-6 md:p-8"
              style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#10B981" }}>
                Labelbox parity
              </p>
              <h2 className="mt-4 text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                Annotation operations without locking the workflow to one tool
              </h2>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Tbrain can operate with Labelbox-style controls where customers
                need familiar annotation governance, while still keeping custom
                model checks, expert sourcing, and delivery automation inside
                the broader Tbrain workflow.
              </p>
              <ul className="mt-6 space-y-3">
                {PARITY_ITEMS.map((item) => (
                  <li key={item} className="flex gap-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4">
              {INTEGRATIONS.map((integration) => {
                const Icon = integration.icon;
                return (
                  <article
                    key={integration.title}
                    className="rounded-2xl border p-5"
                    style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
                  >
                    <div className="flex gap-4">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6C3CF4]/10 text-[#6C3CF4]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                          {integration.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {integration.body}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="container mx-auto mt-24 scroll-mt-28 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              Workflow diagram
            </p>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
              From scope to model feedback
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The diagram below shows the core loop behind Tbrain programs:
              define the work, route it to the right people, verify with models
              and humans, then integrate the outputs into customer model systems.
            </p>
          </div>

          <div
            className="relative mt-12 overflow-hidden rounded-2xl border p-5 md:p-8"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            <div className="grid gap-4 md:grid-cols-4">
              {WORKFLOW_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="relative">
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div
                        aria-hidden
                        className="absolute left-[calc(100%-8px)] top-10 hidden h-px w-8 md:block"
                        style={{ background: "linear-gradient(90deg, rgba(108,60,244,0.35), rgba(16,185,129,0.35))" }}
                      />
                    )}
                    <article className="h-full rounded-xl border p-5 text-center" style={{ borderColor: "var(--border-subtle)" }}>
                      <span
                        className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl"
                        style={{ background: `${step.color}18`, border: `1px solid ${step.color}33`, color: step.color }}
                      >
                        <Icon className="h-6 w-6" />
                      </span>
                      <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: step.color }}>
                        Step {index + 1}
                      </div>
                      <h3 className="mt-1 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                        {step.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {step.body}
                      </p>
                    </article>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4 text-center">
          <h2 className="text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
            Need the stack behind the data program?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Tbrain can scope the workflow, tooling, model checks, and delivery
            path around the exact data your team needs.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-8 py-3 text-base font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            Talk to an expert <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}
