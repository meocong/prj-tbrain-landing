"use client";

import { useState, useEffect } from "react";
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  { label: "Case Studies", href: "/casestudy" },
  { label: "Physical AI", href: "/data/physical-ai" },
  { label: "Terminal Bench", href: "/data/terminal-bench" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

// Pages whose hero section is hardcoded dark (background:#020617) — header
// must stay white over the hero, then flip when the user scrolls past it.
// `/` and `/platform` heroes look light in light theme (overlay ≥86% white)
// so they DON'T need dark tokens.
const HERO_DARK_PAGES = new Set([
  "/data/terminal-bench",
]);

// Pages where the entire wrapper is hardcoded dark — header always white.
const ALWAYS_DARK_PAGES = new Set([
  "/data/physical-ai",
]);

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const pathname = usePathname();
  const heroIsDark = HERO_DARK_PAGES.has(pathname);
  const alwaysDark = ALWAYS_DARK_PAGES.has(pathname);
  const useDarkTokens = isDarkTheme || alwaysDark || (heroIsDark && !scrolled);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncTheme = () =>
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Color tokens per page theme
  const tokens = useDarkTokens
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
      className={`fixed left-0 right-0 top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300 ${tokens.wrapper}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-3 md:px-8">
        <div className="flex items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src={Logo}
              width={123}
              height={40}
              alt="Tbrain"
              priority
              loading="eager"
              fetchPriority="high"
              className="object-contain"
              style={{ width: "auto", height: 40, filter: tokens.logoFilter }}
            />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex xl:gap-7">
            {NAV_ITEMS.map((item) => (
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
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className={`h-6 w-6 ${tokens.icon}`} /> : <Menu className={`h-6 w-6 ${tokens.icon}`} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className={`mt-4 rounded-2xl p-4 lg:hidden ${tokens.mobileMenu}`}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? useDarkTokens
                      ? "bg-white/10 text-white"
                      : "bg-[#6C3CF4]/5 text-[#6C3CF4]"
                    : useDarkTokens
                      ? "text-white/80 hover:bg-white/5"
                      : "text-[#0e1b2e] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
