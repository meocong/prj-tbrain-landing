import { ArrowRight, ArrowUpRight, Sparkles, ChevronDown } from "lucide-react";
import Link from "next/link";
import { INCEPTION_URL, InceptionArt } from "@/components/marketing/InceptionBadge";
import { VideoBackground } from "@/components/marketing/fx/VideoBackground";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{ background: "var(--bg-page)", minHeight: "100vh", color: "var(--text-primary)" }}
    >
      <VideoBackground
        sources={[
          {
            src: "/videos/home-cinema.webm",
            srcMp4: "/videos/home-cinema.mp4",
            poster: "/images/home-cinema-poster.jpg",
          },
          {
            src: "/videos/datacenter-cinema.webm",
            srcMp4: "/videos/datacenter-cinema.mp4",
            poster: "/images/datacenter-cinema-poster.jpg",
          },
          {
            src: "/videos/platform-robotic-cinema.webm",
            srcMp4: "/videos/platform-robotic-cinema.mp4",
            poster: "/images/platform-robotic-poster.jpg",
          },
          {
            src: "/videos/robotics-cinema.webm",
            srcMp4: "/videos/robotics-cinema.mp4",
            poster: "/images/robotics-cinema-poster.jpg",
          },
          {
            src: "/videos/physical-ambient.webm",
            srcMp4: "/videos/physical-ambient.mp4",
            poster: "/images/physical-poster.jpg",
          },
          {
            src: "/videos/hero-ambient.webm",
            srcMp4: "/videos/hero-ambient.mp4",
            poster: "/images/hero-poster.jpg",
          },
        ]}
        overlay="var(--home-hero-video-overlay)"
      />

      {/* Animated pastel blob gradients (like /casestudy) */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 20% 30%, rgba(108,60,244,0.10) 0%, transparent 55%)," +
            "radial-gradient(ellipse 80% 60% at 80% 70%, rgba(16,185,129,0.08) 0%, transparent 55%)",
        }}
      />

      {/* Subtle grid pattern */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--hero-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--hero-grid-line) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="container mx-auto relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-24 pb-12">
        <div
          className="hero-reveal hero-reveal-0 mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
          style={{
            background: "var(--hero-chip-bg)",
            border: "1px solid var(--hero-chip-border)",
            WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full" style={{ background: "#10B981", opacity: 0.6 }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
          </span>
          <span style={{ color: "var(--text-secondary)" }}>Trusted by frontier AI labs</span>
          <Sparkles className="h-3 w-3" style={{ color: "#A78BFA" }} />
        </div>

        <h1
          className="hero-reveal hero-reveal-1 text-center font-semibold text-[44px] md:text-[80px] leading-[1.05]"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "0", maxWidth: "1100px" }}
        >
          <span>Trusted </span>
          <GradientWord>Human Infrastructure</GradientWord>{" "}
          <span>for </span>
          <GradientWord>Agentic AI.</GradientWord>
        </h1>

        <p
          className="hero-reveal hero-reveal-2 mx-auto mt-8 max-w-2xl text-center text-lg md:text-xl leading-relaxed"
          style={{ color: "var(--hero-muted)" }}
        >
          The data factory behind coding, robotics, agentic workflows,
          <br className="hidden md:block" />
          world models, evaluation, and post-training programs for frontier AI teams.
        </p>

        <div
          className="hero-reveal hero-reveal-3 mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs md:text-sm uppercase tracking-wider"
          style={{ color: "var(--hero-subtle)" }}
        >
          <span>Coding</span>
          <Divider />
          <span>Agentic workflows</span>
          <Divider />
          <span>Robotics</span>
          <Divider />
          <span>World models</span>
          <Divider />
          <span>Model evaluation</span>
          <Divider />
          <span>RLHF / SFT</span>
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
            href="/services"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: "rgba(15,23,42,0.04)",
              border: "1px solid rgba(15,23,42,0.12)",
              color: "var(--text-primary)",
              WebkitBackdropFilter: "blur(10px)", backdropFilter: "blur(10px)",
            }}
          >
            Explore our services
          </Link>
        </div>

        {/* NVIDIA Inception membership: the badge in a small credential card
            under the calls to action, as member startups show it (Gatsby's
            hero badges, Trust3's row under the CTAs). The card borrows the
            site's card surface and top accent line, in NVIDIA green; the
            badge artwork itself is untouched (see InceptionBadge). */}
        <a
          href={INCEPTION_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Tbrain is a member of the NVIDIA Inception Program (opens nvidia.com)"
          className="hero-reveal hero-reveal-5 group relative mt-10 inline-flex items-center gap-4 overflow-hidden rounded-2xl py-3 pl-3 pr-5 transition-transform duration-300 hover:-translate-y-0.5"
          style={{
            background: "var(--product-card-bg)",
            border: "1px solid var(--product-card-border)",
            boxShadow: "var(--product-card-shadow)",
            WebkitBackdropFilter: "blur(12px)", backdropFilter: "blur(12px)",
          }}
        >
          <span aria-hidden className="absolute inset-x-0 top-0 h-[2px]" style={{ background: "linear-gradient(90deg, #76B900, #76B90000 80%)" }} />
          <InceptionArt height={40} />
          <span aria-hidden className="h-8 w-px" style={{ background: "var(--border-default)" }} />
          <span aria-hidden className="text-left">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
              Program member
            </span>
            <span className="mt-0.5 flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              NVIDIA Inception
              <ArrowUpRight className="h-3.5 w-3.5 opacity-50 transition-opacity group-hover:opacity-100" />
            </span>
          </span>
        </a>

        <div
          className="hero-reveal hero-reveal-5 absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 md:flex [@media(max-height:960px)]:hidden"
          style={{ color: "var(--hero-scroll)", animationIterationCount: 1 }}
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
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return <span className="h-3 w-px" style={{ background: "var(--hero-divider)" }} />;
}
