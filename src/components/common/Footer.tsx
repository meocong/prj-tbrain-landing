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
    return (
      <p className="text-sm text-[#6C3CF4] font-medium">
        Thanks for subscribing!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-[#6C3CF4]"
        style={{ minWidth: "200px" }}
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#6C3CF4] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5a2fd3]"
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
    <footer className="relative mt-16 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-blue-50/30" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-200 to-transparent mb-8" />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/">
              <Image
                src={Logo}
                width={110}
                height={36}
                alt="Tbrain"
                className="object-contain"
              />
            </Link>
            <p className="mt-3 text-sm text-[#78818f]">
              The improvement layer for agentic AI training data & evaluation.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#0e1b2e]">Quick Links</h4>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-[#78818f] transition-colors hover:text-[#6C3CF4]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-[#0e1b2e]">
              Stay Updated
            </h4>
            <p className="mt-2 text-sm text-[#78818f]">
              Get the latest on AI training data and insights.
            </p>
            <div className="mt-3">
              <NewsletterForm />
            </div>
          </div>
        </div>

        <div className="mt-8 w-full h-[1px] bg-gray-200" />

        {/* Bottom */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/tbrain-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-medium text-[#0e1b2e] transition-all hover:border-[#6C3CF4] hover:text-[#6C3CF4]"
            >
              <Image src={iconLinkedin} width={18} height={18} alt="LinkedIn" />
              LinkedIn
            </a>
            <span className="text-sm text-[#78818f]">
              Sheridan, WY, USA &bull; Hanoi, Vietnam
            </span>
          </div>
          <p className="text-sm text-[#78818f]">
            &copy; Tbrain {new Date().getFullYear()} &bull;{" "}
            <span className="text-[#6C3CF4]">Human-in-the-Loop AI Validation</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
