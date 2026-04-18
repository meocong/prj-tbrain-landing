import { PlusIconLink } from "@/components/terminal-bench/shared/PlusIconLink";
import { TerminalDevice } from "./TerminalDevice";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="wrap pointer-events-none absolute inset-0 opacity-70">
        <div className="one left-[8%] top-24 h-80 w-80" />
        <div className="two right-[10%] top-40 h-80 w-80" />
      </div>
      <div className="container relative mx-auto max-w-7xl px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="font-family_avt text-xs uppercase tracking-[0.25em] text-[#78818f]">
              / terminal-bench · april 2026 batch
            </p>
            <h1 className="mt-6 text-5xl font-medium leading-[1.04] text-[#0e1b2e] md:text-6xl lg:text-[76px]">
              Agentic data that <span className="gradient-text">actually runs</span>.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-[#78818f] md:text-lg">
              Expert-authored terminal tasks with Docker-reproducible verifiers
              and reference solutions. Every sample boots in a real container,
              every pass/fail is a concrete test — no LLM-as-judge.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <PlusIconLink href="/data/terminal-bench/enter" variant="solid">
                Enter showcase
              </PlusIconLink>
              <PlusIconLink href="/data/terminal-bench/request-access">
                Request access
              </PlusIconLink>
            </div>
          </div>

          <div className="relative lg:pl-4">
            <TerminalDevice />
          </div>
        </div>
      </div>
    </section>
  );
}
