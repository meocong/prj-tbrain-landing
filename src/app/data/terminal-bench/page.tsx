import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/terminal-bench/shared/SectionHeading";
import { NumberedBlock } from "@/components/terminal-bench/shared/NumberedBlock";
import { Hero } from "@/components/terminal-bench/landing/Hero";
import { TrustStrip } from "@/components/terminal-bench/landing/TrustStrip";
import { TaskLifecycle } from "@/components/terminal-bench/landing/TaskLifecycle";
import { LiveSolveDiff } from "@/components/terminal-bench/landing/LiveSolveDiff";
import { SampleGalleryPreview } from "@/components/terminal-bench/landing/SampleGalleryPreview";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Terminal Bench — Real Terminal Tasks for Coding Agents",
  description:
    "Reproducible terminal benchmark tasks with deterministic verification — designed to expose where coding agents actually break in real Linux/Python/Node environments.",
  alternates: { canonical: "/data/terminal-bench" },
  openGraph: {
    title: "Terminal Bench — Real Terminal Tasks for Coding Agents",
    description:
      "Reproducible terminal benchmark tasks with deterministic verification — designed to expose where coding agents actually break.",
    url: "/data/terminal-bench",
  },
};

const FEATURES: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Difficulty engineering",
    body: "Each task is designed to fall inside the expert-yet-solvable band — hard enough to separate strong agents from weak ones, tractable enough that human experts can verify outcomes deterministically.",
  },
  {
    n: "02",
    title: "Verification pipeline",
    body: "Every sample ships with a reproducible test harness that boots a fresh Docker environment, runs the agent-produced solution, and asserts concrete outcomes — no LLM-as-judge handwaving.",
  },
  {
    n: "03",
    title: "Environment design",
    body: "Real-world software stacks: Linux, Python, Node, bash, systemd-style services, database fixtures. Agents operate in a terminal, not a toy sandbox.",
  },
  {
    n: "04",
    title: "Task strategy",
    body: "A deliberate spread across debugging, devops, library work, and API integration — calibrated to surface capability gaps rather than piling on tasks of one flavor.",
  },
  {
    n: "05",
    title: "Expert authoring",
    body: "Each sample is authored by a PhD or senior engineer in its domain and peer-reviewed. Instructions are written to be precise and unambiguous under terminal-only observation.",
  },
  {
    n: "06",
    title: "Delivery guarantees",
    body: "Full provenance: author, review notes, time estimates for expert vs. junior, resource caps. Every artifact is versioned; every change is auditable.",
  },
];

const ARTIFACTS = [
  {
    name: "task.toml",
    desc: "Metadata: author, difficulty, tags, time estimates, resource caps, verifier timeout.",
  },
  {
    name: "instruction.md",
    desc: "Full narrative task brief with code fragments, constraints, and examples — the exact prompt the agent sees.",
  },
  {
    name: "solution/solve.sh",
    desc: "Reference expert solution — a bash script that produces a passing run against the verifier.",
  },
  {
    name: "tests/",
    desc: "Deterministic pytest harness that decides PASS/FAIL; every assertion is specific and inspectable.",
  },
];

export default function TerminalBenchLanding() {
  return (
    <main className="relative overflow-hidden bg-white dark:bg-[#020617]">
      <link
        rel="preload"
        as="image"
        href="/images/terminal-bench-cinema-poster.jpg"
        fetchPriority="high"
      />
      <Hero />
      <TrustStrip />

      {/* What it is */}
      <section className="relative bg-white dark:bg-[#020617]">
        <div className="container mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <p className="font-family_avt text-center text-xs uppercase tracking-[0.2em] text-[#78818f]">
              / what is terminal bench
            </p>
            <h2 className="mt-4 mx-auto max-w-4xl text-center text-4xl font-medium leading-tight text-[#0e1b2e] md:text-6xl">
              LLM evals miss the terminal. <span className="gradient-text">Agents live there.</span>
            </h2>
            <div className="mt-10 grid gap-8 text-base leading-relaxed text-[#78818f] md:grid-cols-2 md:gap-12 md:text-lg">
              <p>
                Benchmarks that score agents on static code snippets or single-turn
                QA miss the actual job: executing commands, reading output, editing
                files, and recovering from errors — at the shell prompt, across
                long-running sessions.
              </p>
              <p>
                Terminal Bench samples are expert-authored tasks with a
                deterministic verifier. They boot the agent into a real Docker
                environment, hand it <code className="font-mono text-[#0e1b2e]">instruction.md</code>,
                and then score the final state of the filesystem — not the LLM&apos;s
                self-report.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TaskLifecycle />

      {/* Anatomy */}
      <section className="container mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionHeading label="anatomy of a sample" centered>
            Four artifacts. <span className="gradient-text">Every sample.</span>
          </SectionHeading>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {ARTIFACTS.map((it) => (
              <div
                key={it.name}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-all hover:border-[#6C3CF4]/40 hover:shadow-lg"
              >
                <p className="font-family_avt text-xs uppercase tracking-widest text-[#6C3CF4]">
                  file
                </p>
                <p className="mt-3 font-mono text-lg text-[#0e1b2e]">{it.name}</p>
                <p className="mt-4 text-sm leading-relaxed text-[#78818f]">
                  {it.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LiveSolveDiff />

      <SampleGalleryPreview />

      {/* Why terminal bench */}
      <section className="container mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <SectionHeading label="why terminal bench" centered>
            We build the hardest tasks your agents{" "}
            <span className="gradient-text">haven&apos;t seen yet</span>.
          </SectionHeading>
          <div>
            {FEATURES.map((f) => (
              <NumberedBlock key={f.n} n={f.n} title={f.title}>
                {f.body}
              </NumberedBlock>
            ))}
            <div className="border-t border-[#E5E7EB]" />
          </div>
        </div>
      </section>

      {/* How to access */}
      <section className="bg-[#FAFAF7] dark:bg-[#020617]">
        <div className="container mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-5xl">
            <SectionHeading label="how to access" centered>
              Two paths in. <span className="gradient-text">Zero guesswork.</span>
            </SectionHeading>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8">
                <p className="font-family_avt text-xs uppercase tracking-widest text-[#6C3CF4]">
                  path one
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-[#0e1b2e]">
                  Have a passcode?
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[#78818f]">
                  If our sales team has sent you a{" "}
                  <code className="font-mono">TB-XXXX-XXXX</code> passcode, enter
                  it to open the current batch.
                </p>
                <div className="mt-6">
                  <Link
                    href="/data/terminal-bench/enter"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3] hover:shadow-lg"
                  >
                    Enter showcase →
                  </Link>
                </div>
              </div>
              <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8">
                <p className="font-family_avt text-xs uppercase tracking-widest text-[#6C3CF4]">
                  path two
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-[#0e1b2e]">
                  Request access
                </h3>
                <p className="mt-4 text-base leading-relaxed text-[#78818f]">
                  Tell us about your team and intended use. Our sales team
                  reviews each request and usually responds within one business day.
                </p>
                <div className="mt-6">
                  <Link
                    href="/data/terminal-bench/request-access"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#0e1b2e] px-6 py-3 text-sm font-semibold text-[#0e1b2e] transition-all hover:bg-[#0e1b2e] hover:text-white"
                  >
                    Request access +
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
