"use client";

import { useState, useEffect, type CSSProperties } from "react";
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { categoryHeroIsDark } from "@/lib/samples/categories";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Platform", href: "/platform" },
  // The samples surface. Master's list does not carry it — this branch is where
  // /samples was built, so the entry arrives with it rather than being an
  // upstream omission to argue about.
  { label: "Samples", href: "/samples" },
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
  // The samples hero is a full-bleed wall of footage under a dark scrim in BOTH
  // themes, so without this the light-theme nav sits dark on dark over it.
  "/samples",
  // physical-ai has a hardcoded-dark HERO but a theme-aware body — header must
  // be white over the hero, then flip to light (coloured logo) on scroll in
  // light mode. (Was in ALWAYS_DARK, which kept a dark bar + white logo over the
  // light body when scrolled.)
  "/data/physical-ai",
]);

// Pages where the entire wrapper is hardcoded dark — header always white.
const ALWAYS_DARK_PAGES = new Set<string>([]);

/**
 * A set of exact paths cannot answer for `/samples/<category>`, because those
 * six pages do not agree with each other: `CategoryHeader` opens on a full-bleed
 * reel where the category has clips (egocentric, gaming, teleoperation, mocap)
 * and on a light hatched drawing band where it does not (exocentric,
 * coding-stem). A blanket `/samples` prefix would put a white nav on the two
 * light ones; leaving them out, as before, put an ink nav on the four dark ones.
 */
function heroIsDarkFor(pathname: string): boolean {
  if (HERO_DARK_PAGES.has(pathname)) return true;
  const category = /^\/samples\/([^/]+)$/.exec(pathname)?.[1];
  // `/samples/enter` and `/samples/s` match that shape without being
  // categories. The lookup returns false for both, which is the answer they
  // want anyway — neither has a hero, they open straight onto the page base.
  return category ? categoryHeroIsDark(category) : false;
}

/**
 * Routes painted in the blueprint language (`src/app/blueprint.css`) rather than
 * the marketing palette: warm paper / indigo-black base, teal accent, hairlines.
 * The chrome has to follow them, or a `bg-white/80` bar with #6C3CF4 violet
 * links sits on top of a #F6F6F2 page with a teal body.
 *
 * `/casestudy/` keeps its trailing slash on purpose: the detail page is
 * blueprint, the listing page above it is not.
 */
const BLUEPRINT_PREFIXES = ["/samples", "/data/physical-ai", "/casestudy/"];
const isBlueprintRoute = (pathname: string) =>
  BLUEPRINT_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : `${p}/`)
  );

/** Every field the bar actually reads. The `dropdown*` keys the old pair
    carried had no consumer — there is no dropdown in this header. */
interface ChromeTokens {
  wrapper: string;
  wrapperStyle?: CSSProperties;
  link: string;
  linkActive: string;
  accent: string;
  icon: string;
  mobileMenu: string;
  mobileActive: string;
  mobileIdle: string;
}

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const pathname = usePathname();
  const heroIsDark = heroIsDarkFor(pathname);
  const alwaysDark = ALWAYS_DARK_PAGES.has(pathname);

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

  /* Colour tokens.

     Three sets rather than two, because "the bar is dark" turned out to be two
     different situations that want different answers.

     Over a dark hero the backdrop is FOOTAGE, not the page, so that set stays
     literal white in both themes. It cannot read `--bp-ink`: that token is
     #16171C in light mode, which would put dark ink on dark video — the exact
     bug the category pages had.

     The other two sit on the page and follow it. Blueprint routes read the teal
     palette so the bar matches the body it is bolted to; everything else keeps
     the marketing violet.

     `wrapperStyle` exists because these backgrounds are `color-mix` over a
     custom property, which is a value Tailwind's arbitrary-value syntax can
     carry but not legibly. The class keeps the blur and the border width; the
     colours come through style. */
  const overDarkHero = alwaysDark || (heroIsDark && !scrolled);
  const blueprint = isBlueprintRoute(pathname);

  const OVER_VIDEO: ChromeTokens = {
    wrapper: "bg-transparent border-b border-transparent",
    link: "text-white/75 hover:text-white",
    linkActive: "text-white",
    accent: "#A78BFA",
    icon: "text-white",
    mobileMenu: "bg-[rgba(15,23,42,0.95)] border border-white/10 backdrop-blur-md",
    mobileActive: "bg-white/10 text-white",
    mobileIdle: "text-white/80 hover:bg-white/5",
  };

  const BLUEPRINT_DARK: ChromeTokens = {
    wrapper: scrolled ? "border-b backdrop-blur-md" : "bg-transparent border-b border-transparent",
    wrapperStyle: scrolled
      ? {
          background: "color-mix(in srgb, var(--bp-bg) 86%, transparent)",
          borderColor: "var(--bp-line)",
        }
      : undefined,
    link: "text-(--bp-ink-dim) hover:text-(--bp-ink)",
    linkActive: "text-(--bp-cyan)",
    accent: "var(--bp-cyan)",
    icon: "text-(--bp-ink)",
    mobileMenu: "border border-(--bp-line) bg-(--bp-panel) backdrop-blur-md",
    mobileActive: "bg-(--bp-surface-2) text-(--bp-cyan)",
    mobileIdle: "text-(--bp-ink-dim) hover:bg-(--bp-surface-2)",
  };

  const BLUEPRINT_LIGHT: ChromeTokens = {
    ...BLUEPRINT_DARK,
    wrapper: "border-b backdrop-blur-md",
    wrapperStyle: {
      background: "color-mix(in srgb, var(--bp-bg) 82%, transparent)",
      borderColor: "var(--bp-line)",
    },
    mobileMenu: "border border-(--bp-line) bg-(--bp-panel) shadow-lg",
  };

  const MARKETING_DARK: ChromeTokens = {
    wrapper: scrolled
      ? "bg-[rgba(2,6,23,0.8)] border-b border-white/[0.08] backdrop-blur-md"
      : "bg-transparent border-b border-transparent",
    link: "text-white/75 hover:text-white",
    linkActive: "text-white",
    accent: "#A78BFA",
    icon: "text-white",
    mobileMenu: "bg-[rgba(15,23,42,0.95)] border border-white/10 backdrop-blur-md",
    mobileActive: "bg-white/10 text-white",
    mobileIdle: "text-white/80 hover:bg-white/5",
  };

  const MARKETING_LIGHT: ChromeTokens = {
    wrapper: "bg-white/80 border-b border-gray-100/50 backdrop-blur-md",
    link: "text-[#0e1b2e] hover:text-[#6C3CF4]",
    linkActive: "text-[#6C3CF4]",
    accent: "#6C3CF4",
    icon: "text-[#0e1b2e]",
    mobileMenu: "bg-white shadow-lg",
    mobileActive: "bg-[#6C3CF4]/5 text-[#6C3CF4]",
    mobileIdle: "text-[#0e1b2e] hover:bg-gray-50",
  };

  const tokens = overDarkHero
    ? OVER_VIDEO
    : isDarkTheme
      ? blueprint
        ? BLUEPRINT_DARK
        : MARKETING_DARK
      : blueprint
        ? BLUEPRINT_LIGHT
        : MARKETING_LIGHT;

  // Logo follows the THEME, not the hero/scroll state: coloured brand mark in
  // light mode everywhere (incl. over dark heroes), white in dark mode.
  const logoFilter = isDarkTheme ? "brightness(0) invert(1)" : "none";

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300 ${tokens.wrapper}`}
      style={tokens.wrapperStyle}
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
              className="h-10 w-auto object-contain"
              style={{ filter: logoFilter }}
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
                  isActive(item.href) ? tokens.mobileActive : tokens.mobileIdle
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
