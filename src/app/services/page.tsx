import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Boxes,
  CheckCircle2,
  Cpu,
  Factory,
  Image as ImageIcon,
  MessageSquare,
  ShieldCheck,
  Tags,
  Terminal,
  Video,
  Workflow,
} from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Tbrain services for image labeling, video annotation, text QC, RLHF, 3D/CAD annotation, Physical AI data, and agent evaluation programs.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Tbrain Services",
    description:
      "Managed expert data operations for multimodal annotation, model evaluation, and frontier AI training programs.",
    url: "/services",
  },
};

const SERVICES = [
  {
    title: "Image labeling",
    subtitle: "Masks, boxes, classes, and edge-case review",
    description:
      "Pixel-accurate image labeling programs for detection, classification, instance segmentation, and semantic segmentation. Built for frontier vision teams that need consistent labels, review trails, and calibrated QA.",
    domains: ["Computer vision", "Retail", "Manufacturing", "Medical imaging"],
    operations: ["Guideline design", "Expert QA", "Consensus review", "Delivery reports"],
    icon: ImageIcon,
    accent: "#34D399",
    caseStudy: { label: "Multimodal annotation case study", href: "/casestudy/details/scalable" },
  },
  {
    title: "Video annotation",
    subtitle: "Temporal labels at frame precision",
    description:
      "Frame-level boxes, segmentation, event labels, action recognition, and multi-view tracking. We manage reviewer calibration and sampling so long-form video work stays consistent across batches.",
    domains: ["Robotics", "Sports", "Safety", "Autonomous workflows"],
    operations: ["Temporal QA", "Reviewer calibration", "Sampling plans", "Batch acceptance"],
    icon: Video,
    accent: "#6C3CF4",
    caseStudy: { label: "Multimodal annotation case study", href: "/casestudy/details/scalable" },
  },
  {
    title: "Text QC and RLHF",
    subtitle: "Preference data with audit trails",
    description:
      "Human preference ranking, rubric-based scoring, hallucination review, red-team evaluation, and SFT data validation. Every decision can be traced back to a rubric, reviewer, and quality checkpoint.",
    domains: ["Coding", "Healthcare", "Finance", "General reasoning"],
    operations: ["Rubric design", "Expert review", "Dispute resolution", "Model feedback loops"],
    icon: MessageSquare,
    accent: "#8B5CF6",
    caseStudy: { label: "Agent evaluation case study", href: "/casestudy/details/agent" },
  },
  {
    title: "3D, CAD, and manufacturing annotation",
    subtitle: "Industrial data with specialist review",
    description:
      "Annotation and quality review for CAD drawings, manufacturing specs, process documents, and 3D production context. Designed for workflows where domain knowledge matters as much as labeling speed.",
    domains: ["CAD", "3D printing", "CNC", "Industrial QA"],
    operations: ["Specialist sourcing", "Schema setup", "Parallel QA", "Acceptance sampling"],
    icon: Factory,
    accent: "#F59E0B",
    caseStudy: { label: "CAD annotation case study", href: "/casestudy/details/manufacturing" },
  },
  {
    title: "Physical AI data programs",
    subtitle: "Robot training data scoped to the task",
    description:
      "Motion capture, egocentric video, hand pose, scene context, manipulation traces, and robotics task data. We scope hardware, workflow, and exports around your robot body and training objective.",
    domains: ["Humanoids", "Manipulation", "Household tasks", "Commercial tasks"],
    operations: ["Capture design", "Hardware planning", "Annotation QA", "Sim-ready exports"],
    icon: Bot,
    accent: "#0EA5E9",
    caseStudy: { label: "Explore Physical AI", href: "/data/physical-ai" },
  },
  {
    title: "Terminal-Bench and agent evaluation",
    subtitle: "Ground-truth tasks for tool-using agents",
    description:
      "Multi-step terminal tasks, validation harnesses, oracle traces, and model failure analysis. We build benchmarks that expose real gaps in agent planning, execution, and recovery.",
    domains: ["Linux", "DevOps", "Security", "Databases"],
    operations: ["Task authoring", "Automated grading", "Expert validation", "Failure analysis"],
    icon: Terminal,
    accent: "#10B981",
    caseStudy: { label: "Agent benchmark case study", href: "/casestudy/details/agent" },
  },
];

const OPERATING_MODEL = [
  {
    title: "Scope the work",
    description:
      "We turn model goals into task taxonomies, quality bars, domain requirements, and acceptance criteria.",
    icon: Tags,
  },
  {
    title: "Run the pod",
    description:
      "Tbrain manages expert sourcing, onboarding, reviewer calibration, throughput, and issue escalation.",
    icon: Workflow,
  },
  {
    title: "Verify every batch",
    description:
      "AI-native checks, human QA, sampling, and audit trails keep output quality visible before delivery.",
    icon: ShieldCheck,
  },
  {
    title: "Ship usable data",
    description:
      "Final exports include labels, metadata, review notes, and delivery context your training team can act on.",
    icon: Boxes,
  },
];

export default function ServicesPage() {
  return (
    <div>
      <Header />
      <main className="pt-28 pb-24" style={{ background: "var(--bg-page)", color: "var(--text-primary)" }}>
        <section className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "#6C3CF4" }}>
            Services
          </p>
          <h1
            className="mx-auto mt-4 max-w-4xl text-4xl font-semibold leading-tight md:text-6xl"
            style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}
          >
            Managed data programs for{" "}
            <span
              style={{
                background: "linear-gradient(120deg, #6C3CF4, #10B981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              frontier AI teams
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-secondary)" }}>
            Image, video, text, 3D, robotics, and agent evaluation work delivered
            by managed expert pods with clear QA, review, and case-study-backed
            operating patterns.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
            >
              Start an inquiry <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#service-lines"
              className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:border-[#6C3CF4]"
              style={{ borderColor: "var(--border-default)", color: "var(--text-primary)" }}
            >
              View service lines
            </Link>
          </div>
        </section>

        <section id="service-lines" className="container mx-auto mt-20 scroll-mt-28 px-4">
          <div className="grid gap-5 lg:grid-cols-2">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className="rounded-2xl border p-6 transition-transform duration-300 hover:-translate-y-1 md:p-7"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-subtle)",
                    boxShadow: "0 18px 48px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `${service.accent}18`, color: service.accent, border: `1px solid ${service.accent}33` }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <Link
                      href={service.caseStudy.href}
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{ color: service.accent }}
                    >
                      {service.caseStudy.label} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
                    {service.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                    {service.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {service.description}
                  </p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                        Domains
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {service.domains.map((domain) => (
                          <span
                            key={domain}
                            className="rounded-full px-2.5 py-1 text-xs"
                            style={{ background: "var(--bg-input)", color: "var(--text-secondary)" }}
                          >
                            {domain}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "var(--text-muted)" }}>
                        Managed by Tbrain
                      </h3>
                      <ul className="mt-2 space-y-1.5">
                        {service.operations.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: service.accent }} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              Operating model
            </p>
            <h2 className="mt-4 text-3xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
              One workflow from scope to delivery
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {OPERATING_MODEL.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="rounded-2xl border p-5"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "#6C3CF4" }}>
                      0{index + 1}
                    </span>
                    <Icon className="h-5 w-5" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <h3 className="mt-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4 text-center">
          <div
            className="mx-auto max-w-4xl rounded-3xl border px-6 py-10"
            style={{ background: "var(--bg-card)", borderColor: "var(--border-subtle)" }}
          >
            <Cpu className="mx-auto h-10 w-10" style={{ color: "#10B981" }} />
            <h2 className="mt-5 text-3xl font-semibold md:text-4xl" style={{ fontFamily: "var(--font-heading)", letterSpacing: "0" }}>
              Need a service line scoped to your model?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed md:text-base" style={{ color: "var(--text-secondary)" }}>
              Tell us the task type, domain, quality bar, and delivery format.
              We will map the expert pod, QA model, and first milestone.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-7 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
