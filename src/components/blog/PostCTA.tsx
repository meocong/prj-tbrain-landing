import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ROBOTICS_CATEGORIES = new Set(["physical ai", "robotics data", "data quality"]);

/**
 * Category-aware end-of-post contact block. Robotics/Physical AI posts point at the
 * capture/QC/delivery pipeline; LLM-track posts (RLHF, eval, benchmarks, engineering)
 * point at Terminal Bench. Anything else falls back to the robotics copy.
 */
function ctaCopy(category: string | null) {
  const key = (category ?? "").trim().toLowerCase();
  if (!ROBOTICS_CATEGORIES.has(key) && key !== "") {
    return {
      heading: "Need LLM training or eval data?",
      body: "Tell us the model and the task. We'll scope prompts, RLHF or eval sets with you.",
      secondaryHref: "/data/terminal-bench",
    };
  }
  return {
    heading: "Building a robotics dataset?",
    body: "Tell us the task and the robot. We'll scope capture, QC and delivery (LeRobot / RLDS) with you.",
    secondaryHref: "/data/physical-ai",
  };
}

export default function PostCTA({ category }: { category: string | null }) {
  const copy = ctaCopy(category);

  return (
    <div
      className="relative mt-12 overflow-hidden rounded-3xl p-8 md:p-10"
      style={{
        background:
          "radial-gradient(ellipse 90% 80% at 20% 0%, rgba(108,60,244,0.10) 0%, transparent 60%)," +
          "radial-gradient(ellipse 70% 60% at 100% 100%, rgba(16,185,129,0.08) 0%, transparent 55%), #f8f7fd",
        border: "1px solid rgba(108,60,244,0.12)",
      }}
    >
      <h2
        className="text-2xl md:text-[28px] font-bold tracking-tight"
        style={{ fontFamily: "var(--font-heading)", color: "#0e1b2e", letterSpacing: "-0.02em" }}
      >
        {copy.heading}
      </h2>
      <p className="mt-3 max-w-lg text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {copy.body}
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 rounded-full bg-[#6C3CF4] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5a2fd3]"
        >
          Talk to our team <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={copy.secondaryHref}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#6C3CF4] transition-all hover:gap-2"
        >
          How our pipeline works <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
