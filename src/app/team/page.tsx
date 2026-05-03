import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { EXPERTS, FEATURED_CASE_STUDIES, LEADERSHIP } from "@/lib/constants/marketing";

export const metadata: Metadata = {
  title: "Team — Tbrain",
  description:
    "Meet the operators, engineering leaders, and expert network behind Tbrain's AI training data and evaluation programs.",
  alternates: { canonical: "/team" },
  openGraph: {
    title: "Team — Tbrain",
    description:
      "The operators, engineering leaders, and experts behind Tbrain's AI training data and evaluation programs.",
    url: "/team",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Team — Tbrain",
    description:
      "The operators, engineering leaders, and experts behind Tbrain's AI training data and evaluation programs.",
  },
};

const CORE_PROFILES = LEADERSHIP.map((person, index) => ({
  ...person,
  role: index === 0 ? "AI training data strategy" : "Engineering delivery leadership",
  projects:
    index === 0
      ? ["Expert-led data programs", "Model evaluation", "Global expert network"]
      : ["Engineering operations", "Enterprise delivery", "Managed expert teams"],
}));

export default function TeamPage() {
  return (
    <div style={{ background: "var(--bg-page)" }}>
      <Header />
      <main className="pt-32 pb-24">
        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>
              / team
            </p>
            <h1
              className="mt-5 text-4xl font-semibold leading-tight md:text-6xl"
              style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
            >
              The operators behind <span className="gradient-text">Tbrain programs</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: "var(--text-secondary)" }}>
              Tbrain combines AI training data operators, engineering delivery
              leaders, and domain experts to build evaluation, annotation, and
              human-feedback programs for high-stakes AI work.
            </p>
          </div>
        </section>

        <section className="container mx-auto mt-20 px-4">
          <div className="grid gap-5 md:grid-cols-2">
            {CORE_PROFILES.map((person) => (
              <article
                key={person.name}
                className="rounded-3xl p-6 md:p-8"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <div className="flex items-start gap-5">
                  <Image
                    src={person.avatar}
                    width={96}
                    height={96}
                    alt={person.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "#6C3CF4" }}>
                      {person.role}
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                      {person.name}
                    </h2>
                  </div>
                </div>
                <p className="mt-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {person.bio}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {person.projects.map((project) => (
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
            ))}
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-family_avt text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
                / project focus
              </p>
              <h2 className="mt-3 text-3xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                Programs this team can run
              </h2>
            </div>
            <Link
              href="/casestudy"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: "#6C3CF4" }}
            >
              View case studies <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CASE_STUDIES.slice(0, 4).map((project) => (
              <article
                key={project.title}
                className="rounded-2xl p-5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl">
                  <Image src={project.image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 25vw" />
                </div>
                <h3 className="text-lg font-semibold leading-snug" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                  {project.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {project.shortDescription}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="container mx-auto mt-24 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-family_avt text-xs uppercase tracking-[0.22em]" style={{ color: "var(--text-muted)" }}>
              / expert network
            </p>
            <h2 className="mt-3 text-3xl font-semibold md:text-5xl" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
              Domain experts when accuracy depends on depth
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Tbrain works with specialized contributors across STEM, medical,
              coding, data science, robotics, and other technical domains where
              generic labeling teams are not enough.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERTS.map((expert) => (
              <article key={expert.name} className="text-center">
                <Image
                  src={expert.avatar}
                  width={128}
                  height={128}
                  alt={expert.name}
                  className="mx-auto h-32 w-32 rounded-3xl object-cover"
                />
                <h3 className="mt-4 text-lg font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}>
                  {expert.name}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: "#6C3CF4" }}>
                  {expert.domain}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {expert.title}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
