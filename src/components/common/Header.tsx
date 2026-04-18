"use client";

import { useState } from "react";
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Case Studies", href: "/casestudy" },
  { label: "Data", href: "/data/terminal-bench" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="fixed right-0 top-0 z-50 w-full bg-white/60 p-3 backdrop-blur-md">
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
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[#6C3CF4] ${
                  isActive(item.href) ? "text-[#6C3CF4]" : "text-[#0e1b2e]"
                }`}
              >
                {item.label}
              </Link>
            ))}
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
            {NAV_ITEMS.map((item) => (
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
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
