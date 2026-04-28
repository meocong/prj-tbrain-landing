"use client";

import { useState, useRef, useEffect } from "react";
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";

const DATA_ITEMS = [
  { label: "Terminal Bench", href: "/data/terminal-bench", description: "AI Agent Evaluation" },
  { label: "Physical AI", href: "/data/physical-ai", description: "Robot Training Data" },
];

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/casestudy" },
  { label: "Data", href: "/data", isDropdown: true },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dataOpen, setDataOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pages that keep a dark hero need the dark header variant. Homepage
  // converted to light theme; only physical-ai still uses dark layout.
  const isDarkPage = pathname === "/data/physical-ai";

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDataOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!isDarkPage) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isDarkPage]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Color tokens per page theme
  const tokens = isDarkPage
    ? {
        wrapper: scrolled
          ? "bg-[rgba(2,6,23,0.8)] border-b border-white/[0.08] backdrop-blur-md"
          : "bg-transparent border-b border-transparent",
        link: "text-white/75 hover:text-white",
        linkActive: "text-white",
        accent: "#A78BFA",
        icon: "text-white",
        dropdown: "bg-[rgba(15,23,42,0.95)] border border-white/10 backdrop-blur-md",
        dropdownText: "text-white",
        dropdownSub: "text-white/55",
        dropdownHover: "hover:bg-white/5",
        mobileMenu: "bg-[rgba(15,23,42,0.95)] border border-white/10 backdrop-blur-md",
        logoFilter: "brightness(0) invert(1)",
      }
    : {
        wrapper: "bg-white/80 border-b border-gray-100/50 backdrop-blur-md",
        link: "text-[#0e1b2e] hover:text-[#6C3CF4]",
        linkActive: "text-[#6C3CF4]",
        accent: "#6C3CF4",
        icon: "text-[#0e1b2e]",
        dropdown: "bg-white border border-gray-200 shadow-lg",
        dropdownText: "text-[#0e1b2e]",
        dropdownSub: "text-[#78818f]",
        dropdownHover: "hover:bg-gray-50",
        mobileMenu: "bg-white shadow-lg",
        logoFilter: "none",
      };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 w-full p-3 transition-[background-color,border-color,backdrop-filter] duration-300 ${tokens.wrapper}`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={Logo}
              width={123}
              height={40}
              alt="Tbrain"
              priority
              className="object-contain"
              style={{ filter: tokens.logoFilter }}
            />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) =>
              item.isDropdown ? (
                <div key={item.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDataOpen(!dataOpen)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                      isActive(item.href) ? tokens.linkActive : tokens.link
                    }`}
                    style={isActive(item.href) ? { color: tokens.accent } : undefined}
                  >
                    {item.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dataOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dataOpen && (
                    <div
                      className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-xl p-2 min-w-[240px] ${tokens.dropdown}`}
                    >
                      {DATA_ITEMS.map((d) => (
                        <Link
                          key={d.href}
                          href={d.href}
                          onClick={() => setDataOpen(false)}
                          className={`block rounded-lg px-4 py-2.5 transition-colors ${tokens.dropdownHover}`}
                        >
                          <div className={`text-sm font-medium ${tokens.dropdownText}`}>{d.label}</div>
                          <div className={`text-xs ${tokens.dropdownSub}`}>{d.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href) ? tokens.linkActive : tokens.link
                  }`}
                  style={isActive(item.href) ? { color: tokens.accent } : undefined}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className={`h-6 w-6 ${tokens.icon}`} /> : <Menu className={`h-6 w-6 ${tokens.icon}`} />}
          </button>
        </div>

        {mobileOpen && (
          <nav className={`mt-4 rounded-2xl p-4 lg:hidden ${tokens.mobileMenu}`}>
            {NAV_ITEMS.filter((i) => !i.isDropdown).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? isDarkPage
                      ? "bg-white/10 text-white"
                      : "bg-[#6C3CF4]/5 text-[#6C3CF4]"
                    : isDarkPage
                      ? "text-white/80 hover:bg-white/5"
                      : "text-[#0e1b2e] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div
              className="mt-2 pt-2"
              style={{ borderTop: isDarkPage ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(243,244,246,1)" }}
            >
              <p
                className={`px-4 py-1 text-xs font-medium ${tokens.dropdownSub}`}
              >
                Data Products
              </p>
              {DATA_ITEMS.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(d.href)
                      ? isDarkPage
                        ? "bg-white/10 text-white"
                        : "bg-[#6C3CF4]/5 text-[#6C3CF4]"
                      : isDarkPage
                        ? "text-white/80 hover:bg-white/5"
                        : "text-[#0e1b2e] hover:bg-gray-50"
                  }`}
                >
                  {d.label}
                  <span className={`ml-2 text-xs ${tokens.dropdownSub}`}>{d.description}</span>
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
