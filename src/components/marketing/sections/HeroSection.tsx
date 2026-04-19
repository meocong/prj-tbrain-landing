import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { VideoBackground } from "@/components/marketing/fx/VideoBackground";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ background: "#020617", minHeight: "100vh", color: "white" }}
    >
      <VideoBackground
        src="/videos/hero-ambient.webm"
        srcMp4="/videos/hero-ambient.mp4"
        poster="/images/hero-poster.jpg"
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(108,60,244,0.28) 0%, transparent 55%)," +
            "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(16,185,129,0.18) 0%, transparent 55%)",
          mixBlendMode: "screen",
        }}
      />

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="container mx-auto relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12">
        <div
          className="hero-reveal hero-reveal-0 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(10px)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: "#10B981", opacity: 0.6 }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
          </span>
          <span style={{ color: "#E2E8F0" }}>Trusted by frontier AI labs</span>
          <Sparkles className="h-3 w-3" style={{ color: "#A78BFA" }} />
        </div>

        <h1
          className="hero-reveal hero-reveal-1 text-center font-medium tracking-tight text-[44px] md:text-[80px] leading-[1.05]"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em", maxWidth: "1100px" }}
        >
          <span>The data factory for </span>
          <GradientWord>robotics,</GradientWord>{" "}
          <GradientWord>agents</GradientWord> &{" "}
          <GradientWord>post-training.</GradientWord>
        </h1>

        <p
          className="hero-reveal hero-reveal-2 mx-auto mt-8 max-w-2xl text-center text-lg md:text-xl leading-relaxed"
          style={{ color: "rgba(226,232,240,0.78)" }}
        >
          From ground-truth motion capture to multi-step agent benchmarks —
          <br className="hidden md:block" />
          purpose-built data for the models no one else can train.
        </p>

        <div
          className="hero-reveal hero-reveal-3 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm uppercase tracking-wider"
          style={{ color: "rgba(226,232,240,0.55)" }}
        >
          <span>Lab-grade precision</span>
          <Divider />
          <span>AI-native QC</span>
          <Divider />
          <span>Global expert network</span>
          <Divider />
          <span>Custom data programs</span>
        </div>

        <div className="hero-reveal hero-reveal-4 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]"
            style={{
              background: "linear-gradient(120deg, #6C3CF4 0%, #A78BFA 100%)",
              color: "white",
              boxShadow: "0 10px 30px -10px rgba(108,60,244,0.6)",
            }}
          >
            Talk to an expert <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/data/physical-ai"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "white",
              backdropFilter: "blur(10px)",
            }}
          >
            Explore robotics data
          </Link>
        </div>

        <div
          className="hero-reveal hero-reveal-5 absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ color: "rgba(226,232,240,0.4)", animationIterationCount: 1 }}
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}

function GradientWord({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 40%, #10B981 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        textShadow: "0 0 42px rgba(108,60,244,0.55)",
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />;
}
