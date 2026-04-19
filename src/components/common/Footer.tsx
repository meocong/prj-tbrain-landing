"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import iconLinkedin from "@/assets/icons/LinkedinLogo.svg";
import Logo from "@/assets/images/logo.svg";
import { toast } from "sonner";
import { Send } from "lucide-react";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken: "footer-bypass" }),
      });
      if (res.ok) {
        setDone(true);
        toast.success("Subscribed!");
      } else {
        toast.error("Failed to subscribe");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return <p className="text-sm font-medium" style={{ color: "#A78BFA" }}>Thanks for subscribing!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="rounded-lg px-3 py-2 text-sm outline-none transition-colors"
        style={{
          minWidth: "200px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity"
        style={{
          background: "linear-gradient(135deg, #6C3CF4, #8B5CF6)",
          boxShadow: "0 8px 24px -6px rgba(108,60,244,0.45)",
          opacity: loading ? 0.7 : 1,
        }}
      >
        <Send className="h-3.5 w-3.5" />
        {loading ? "..." : "Subscribe"}
      </button>
    </form>
  );
}

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/casestudy" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/policy" },
];

const Footer = () => {
  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "#020617",
        color: "white",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(108,60,244,0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src={Logo}
                width={110}
                height={36}
                alt="Tbrain"
                className="object-contain"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.55)" }}>
              The data factory for robotics, agents, and post-training.
              Ground-truth data, purpose-built for frontier AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(226,232,240,0.45)" }}>
              Quick links
            </h4>
            <div className="mt-4 grid grid-cols-2 gap-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(226,232,240,0.7)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(226,232,240,0.45)" }}>
              Stay updated
            </h4>
            <p className="mt-4 text-sm" style={{ color: "rgba(226,232,240,0.6)" }}>
              The latest on AI training data and evaluation.
            </p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-10 h-px w-full" style={{ background: "rgba(255,255,255,0.08)" }} />

        <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="https://www.linkedin.com/company/tbrain-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(226,232,240,0.85)",
              }}
            >
              <Image src={iconLinkedin} width={16} height={16} alt="LinkedIn" style={{ filter: "brightness(0) invert(1)", opacity: 0.8 }} />
              LinkedIn
            </a>
            <span className="text-xs" style={{ color: "rgba(226,232,240,0.5)" }}>
              Sheridan, WY &bull; Hanoi
            </span>
          </div>
          <p className="text-xs" style={{ color: "rgba(226,232,240,0.5)" }}>
            &copy; Tbrain {new Date().getFullYear()} &bull;{" "}
            <span style={{ color: "#A78BFA" }}>Human-in-the-Loop AI Validation</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
