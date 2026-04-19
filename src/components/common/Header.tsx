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
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDataOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full bg-white/80 p-3 backdrop-blur-md border-b border-gray-100/50">
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
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) =>
              item.isDropdown ? (
                <div key={item.href} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDataOpen(!dataOpen)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-[#6C3CF4] ${
                      isActive(item.href) ? "text-[#6C3CF4]" : "text-[#0e1b2e]"
                    }`}
                  >
                    {item.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${dataOpen ? "rotate-180" : ""}`} />
                  </button>
                  {dataOpen && (
                    <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-2 shadow-lg min-w-[220px]">
                      {DATA_ITEMS.map((d) => (
                        <Link
                          key={d.href}
                          href={d.href}
                          onClick={() => setDataOpen(false)}
                          className="block rounded-lg px-4 py-2.5 transition-colors hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-[#0e1b2e]">{d.label}</div>
                          <div className="text-xs text-[#78818f]">{d.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-[#6C3CF4] ${
                    isActive(item.href) ? "text-[#6C3CF4]" : "text-[#0e1b2e]"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-[#0e1b2e]" />
            ) : (
              <Menu className="h-6 w-6 text-[#0e1b2e]" />
            )}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="mt-4 rounded-2xl bg-white p-4 shadow-lg lg:hidden">
            {NAV_ITEMS.filter((i) => !i.isDropdown).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-[#6C3CF4]/5 text-[#6C3CF4]"
                    : "text-[#0e1b2e] hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-gray-100 pt-2">
              <p className="px-4 py-1 text-xs font-medium text-[#78818f]">Data Products</p>
              {DATA_ITEMS.map((d) => (
                <Link
                  key={d.href}
                  href={d.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(d.href)
                      ? "bg-[#6C3CF4]/5 text-[#6C3CF4]"
                      : "text-[#0e1b2e] hover:bg-gray-50"
                  }`}
                >
                  {d.label}
                  <span className="ml-2 text-xs text-[#78818f]">{d.description}</span>
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
