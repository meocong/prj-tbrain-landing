"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { SectionHeading } from "@/components/terminal-bench/shared/SectionHeading";

const STEPS = [
  {
    n: "01",
    title: "Spec declared",
    body: "task.toml pins the environment: CPUs, memory, timeouts, difficulty, author. Every run reproduces the same box.",
    snippet: "# task.toml\ncpus = 4  mem = 2G\nagent_timeout = 600s",
  },
  {
    n: "02",
    title: "Task issued",
    body: "The agent receives instruction.md plus a clean repo tree. No hidden context, no test leakage.",
    snippet: "$ cat instruction.md\n# Fix asyncio REPL leaking tasks on Ctrl-C…",
  },
  {
    n: "03",
    title: "Container spawns",
    body: "A fresh Docker environment boots with exactly the CPU, memory, and timeout caps declared in the spec.",
    snippet: "→ docker run  4cpu  2G  timeout=600s\n→ /workspace  ready",
  },
  {
    n: "04",
    title: "Agent acts",
    body: "The agent edits source, runs commands, inspects output. Every action flows through a real shell, every shell line is recorded.",
    snippet: "✎ patch src/repl.py\n$ python -m pytest -q tests/",
  },
  {
    n: "05",
    title: "Tests run",
    body: "A deterministic pytest harness executes against the final filesystem. Assertions are concrete — no LLM-as-judge, no subjective scoring.",
    snippet: "$ pytest -q\n✓ 18 passed  0 failed  142s",
  },
  {
    n: "06",
    title: "Artifacts delivered",
    body: "PASS/FAIL plus the full trace: commands, diffs, stdout, timings. Everything is versioned and auditable.",
    snippet: "result: PASS\nlog.jsonl · diff.patch · trace.tar",
  },
];

export function TaskLifecycle() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement | null>(null);

  // Drive the track progress off the track element itself, so it advances
  // while the user scrolls the cards into view — no tall sticky container,
  // no wasted whitespace.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start 80%", "end 30%"],
  });
  const trackWidth = useTransform(scrollYProgress, [0, 1], ["4%", "100%"]);

  return (
    <section className="relative bg-white dark:bg-[#020617]">
      <div className="container mx-auto max-w-7xl px-6 py-24 md:py-32">
        <SectionHeading label="task lifecycle" centered>
          From prompt to verdict, <span className="gradient-text">reproducibly</span>.
        </SectionHeading>

        <div ref={trackRef} className="relative">
          {/* Progress track on desktop */}
          <div className="relative mb-10 hidden md:block">
            <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#E5E7EB]" />
            <motion.div
              className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[#6C3CF4]"
              style={{ width: reduced ? "100%" : trackWidth }}
            />
            <div className="relative grid grid-cols-6">
              {STEPS.map((_, i) => (
                <div key={i} className="flex justify-center">
                  <motion.span
                    className="h-3 w-3 rounded-full bg-[#6C3CF4]"
                    initial={{ scale: 0.55, opacity: 0.35 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.6, margin: "0px 0px -20% 0px" }}
                    transition={{ duration: 0.35, delay: i * 0.12 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
                className="flex min-w-0 flex-col rounded-2xl border border-[#E5E7EB] bg-white p-6 transition-colors hover:border-[#6C3CF4]/40"
              >
                <p className="font-family_avt text-xs uppercase tracking-widest text-[#6C3CF4]">
                  step {s.n}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-[#0e1b2e]">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#78818f] md:flex-1">
                  {s.body}
                </p>
                <pre className="mt-5 flex w-full items-start whitespace-pre-wrap break-words rounded-lg bg-[#0D1117] px-3 py-3 font-mono text-[11px] leading-relaxed text-[#c9d1d9] md:h-[88px] md:overflow-hidden">
                  {s.snippet}
                </pre>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
