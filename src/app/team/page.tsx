import type { Metadata } from "next";
import Image from "next/image";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { EXPERTS, LEADERSHIP } from "@/lib/constants/marketing";

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
          <div
            className="mx-auto grid max-w-6xl gap-0 overflow-hidden rounded-3xl md:grid-cols-[0.9fr_1.1fr]"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div className="relative aspect-[3/4] md:aspect-auto md:min-h-[440px]">
              <Image
                src="/images/office.png"
                alt="Tbrain office in Hanoi"
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p
                className="font-family_avt text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--text-muted)" }}
              >
                / our office
              </p>
              <h2
                className="mt-3 text-3xl font-semibold md:text-4xl"
                style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
              >
                Built in <span className="gradient-text">Hanoi</span>, shipping for frontier AI
              </h2>
              <p
                className="mt-5 text-base leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Engineers, expert ops, and program managers work side by side from
                our Hanoi headquarters. Daily standups, shared review queues, and
                domain pods keep delivery tight across timezones.
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-4">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    HQ
                  </dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Hanoi, Vietnam
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Working hours
                  </dt>
                  <dd className="mt-1 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Cross‑TZ delivery
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
