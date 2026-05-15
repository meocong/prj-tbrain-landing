import Link from "next/link";
import { Compass, Home, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--bg-page)" }}>
      <div className="max-w-lg w-full text-center">
        <p
          className="text-7xl md:text-9xl font-bold tracking-tighter"
          style={{
            fontFamily: "var(--font-heading)",
            background: "linear-gradient(120deg, #A78BFA 0%, #6C3CF4 50%, #10B981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </p>

        <div
          className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: "rgba(108,60,244,0.08)", border: "1px solid rgba(108,60,244,0.16)" }}
        >
          <Compass className="h-6 w-6" style={{ color: "#6C3CF4" }} />
        </div>

        <h1
          className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)" }}
        >
          Page not found
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--text-secondary)" }}>
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6C3CF4] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#5a2fd3]"
          >
            <Home className="h-4 w-4" /> Go home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            style={{ background: "rgba(15,23,42,0.04)", border: "1px solid rgba(15,23,42,0.10)", color: "var(--text-primary)" }}
          >
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 max-w-sm mx-auto">
          {[
            { label: "Services", href: "/services" },
            { label: "Case Studies", href: "/casestudy" },
            { label: "Platform", href: "/platform" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-2 text-xs font-medium transition-colors"
              style={{ background: "rgba(15,23,42,0.03)", border: "1px solid rgba(15,23,42,0.06)", color: "var(--text-secondary)" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
