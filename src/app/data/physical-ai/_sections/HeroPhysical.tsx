import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { VideoBackground } from "@/components/marketing/fx/VideoBackground";

export function HeroPhysical() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "#020617", minHeight: "100vh", color: "white" }}
    >
      <VideoBackground
        sources={[
          {
            src: "/videos/physical-ambient.webm",
            srcMp4: "/videos/physical-ambient.mp4",
            poster: "/images/physical-poster.jpg",
          },
          {
            src: "/videos/platform-robotic-cinema.webm",
            srcMp4: "/videos/platform-robotic-cinema.mp4",
            poster: "/images/platform-robotic-poster.jpg",
          },
        ]}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(16,185,129,0.26) 0%, transparent 55%)," +
            "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(108,60,244,0.22) 0%, transparent 55%)",
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

      <div className="container mx-auto relative z-10 min-h-screen px-4 pt-28 pb-16">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_420px] md:gap-12 md:pt-12">
          <div>
            <div
              className="hero-reveal hero-reveal-0 mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.24)",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: "#10B981", opacity: 0.6 }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
              </span>
              <span style={{ color: "rgba(226,232,240,0.92)" }}>Physical AI &amp; Robotics</span>
              <Sparkles className="h-3 w-3" style={{ color: "#34D399" }} />
            </div>

            <h1
              className="hero-reveal hero-reveal-1 font-medium tracking-tight text-4xl md:text-6xl leading-[1.08]"
              style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
            >
              Human motion data for training{" "}
              <span
                style={{
                  background: "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 40%, #10B981 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 42px rgba(108,60,244,0.55)",
                }}
              >
                humanoids.
              </span>
            </h1>

            <p
              className="hero-reveal hero-reveal-2 mt-6 max-w-xl text-base md:text-lg leading-relaxed"
              style={{ color: "rgba(226,232,240,0.72)" }}
            >
              Custom demonstration data programs for teams training humanoids
              to cook, clean, fold laundry, and work warehouse floors. Tell us
              the target tasks, robot body, and export format — we scope the
              capture pipeline around your training run.
            </p>

            <div className="hero-reveal hero-reveal-3 mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform hover:scale-[1.03]"
                style={{
                  background: "linear-gradient(120deg, #6C3CF4 0%, #A78BFA 100%)",
                  color: "white",
                  boxShadow: "0 10px 30px -10px rgba(108,60,244,0.6)",
                }}
              >
                Scope a data program <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#modalities"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                }}
              >
                Explore modalities
              </Link>
            </div>

            <div
              className="hero-reveal hero-reveal-4 mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs md:text-sm uppercase tracking-wider"
              style={{ color: "rgba(226,232,240,0.55)" }}
            >
              <span>Optical MOCAP</span>
              <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
              <span>Multi-modal</span>
              <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
              <span>Scene-aware</span>
              <span className="h-3 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
              <span>Sim-ready exports</span>
            </div>
          </div>

          <div className="hero-reveal hero-reveal-2 hidden md:block">
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 40px 80px -20px rgba(16,185,129,0.35), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              <Image
                src="/images/humanoid-ai.jpg"
                alt="Humanoid motion capture"
                width={860}
                height={1040}
                className="aspect-[4/5] w-full object-cover"
                priority
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(2,6,23,0) 40%, rgba(2,6,23,0.6) 100%)" }}
              />
              <div
                className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl px-3.5 py-2.5 backdrop-blur-md"
                style={{ background: "rgba(15,23,42,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={{ background: "rgba(16,185,129,0.18)", color: "#10B981" }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v6m-4 4l4-4 4 4m-6 4l2-4m4 4l-2-4" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(226,232,240,0.6)" }}>
                    Capture example
                  </p>
                  <p className="text-sm font-medium truncate" style={{ color: "white" }}>
                    Kitchen · folding laundry · mocap + IMU
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="hero-reveal hero-reveal-5 absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1"
          style={{ color: "rgba(226,232,240,0.4)", animationIterationCount: 1 }}
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
}
