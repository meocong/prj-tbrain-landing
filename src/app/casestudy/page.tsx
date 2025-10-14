"use client";

import React from 'react';
import { Star } from 'lucide-react';
import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import { CaseStudyContent } from "@/components/casestudy/CaseStudyContent";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from "@/assets/images/logo.svg";
import Image from "next/image";

export default function Page() {
  const pathname = usePathname();

  return (
    <div>
      {/* Header */}
      <header className="fixed right-0 top-0 z-10 w-full bg-[#FFFFFF59] p-3 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center justify-center gap-2">
  <Image 
    src={Logo} 
    width={123} 
    height={40} 
    alt="logo"
    priority
    className="object-contain"
  />
</Link>
            <div className="hidden md:block">
              <ul className="flex items-center gap-16">
                <li>
                  <Link
                    href="/"
                    className={`text-base font-medium hover:text-[#6C3CF4] ${pathname === "/" ? "text-[#6C3CF4]" : ""
                      }`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#about"
                    className="text-base font-medium hover:text-[#6C3CF4]"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#skills"
                    className="text-base font-medium hover:text-[#6C3CF4]"
                  >
                    Technical Expertise
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="text-base font-medium hover:text-[#6C3CF4]"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/news"
                    className={`text-base font-medium hover:text-[#6C3CF4] ${pathname.startsWith("/news") ? "text-[#6C3CF4]" : ""
                      }`}
                  >
                    News
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policy"
                    className={`text-base font-medium hover:text-[#6C3CF4] ${pathname.startsWith("/policy") ? "text-[#6C3CF4]" : ""
                      }`}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/casestudies"
                    className={`text-base font-medium hover:text-[#6C3CF4] ${pathname.startsWith("/casestudy") ? "text-[#6C3CF4]" : ""
                      }`}
                  >
                    Case Studies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{ backgroundImage: `url(${post_bg?.src})` }}
        className="bg-center bg-no-repeat bg-cover">
        <div className="wrap !fixed top-[400px] w-full">
          <div className="one top-0 left-0 h-80 w-80"></div>
          <div className="two top-0 right-0 h-80 w-80"></div>
        </div>

        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-[60%] left-0 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[60%] right-0 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>

        { }
        <section
          id="casestudy"
          className="container mx-auto px-3 pt-24 pb-24 relative max-w-[1128px]"
        >
          {/* Page Title */}
          <div className="relative mb-12">
            <div className="absolute -top-4 right-[15%] hidden md:block animate-bounce">
              <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
            </div>
            <h1 className="text-[#222222] text-4xl lg:text-5xl font-semibold leading-[52px] mb-8">
              Case Studies
            </h1>
          </div>

          {/* Case Study Content */}
          <CaseStudyContent />
        </section>
      </main>

      <Footer />
    </div>
  );
}