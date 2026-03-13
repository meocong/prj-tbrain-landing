'use client'
import React from "react";
import Image from "next/image";
import Link from "next/link";
import iconLinkedin from "@/assets/icons/LinkedinLogo.svg";
import Logo from "@/assets/images/logo.svg";

const Footer = () => {
  return (
    <footer className="relative mt-16 overflow-hidden bg-white">
      {/* Subtle gradient background - very light */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-50/30 to-blue-50/30"></div>

      {/* Decorative Grid Pattern - very subtle */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6C3CF4" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      {/* Decorative elements - matching page style */}
      <div className="absolute left-[10%] top-4 opacity-20">
        <div className="text-[#6C3CF4] text-2xl">✦</div>
      </div>
      <div className="absolute right-[15%] top-6 opacity-20">
        <div className="text-[#6C3CF4] text-xl">+</div>
      </div>

      {/* Main Content - Compact */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-8">
        
        {/* Top border accent */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-200 to-transparent mb-6"></div>

        {/* Logo Section - Smaller */}
        <div className="flex justify-center mb-5">
          <Link href="/" className="group">
            <div className="bg-white rounded-xl p-3 shadow-sm group-hover:shadow-md transition-all duration-300 border border-gray-100">
              <Image 
                src={Logo} 
                width={110} 
                height={36} 
                alt="Tbrain Logo"
                priority
                className="object-contain"
              />
            </div>
          </Link>
        </div>

        {/* Navigation Links - Larger Text, Single Row */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 mb-6">
          <Link
            href="/#about"
            className="text-base font-semibold text-[#78818f] hover:text-[#6C3CF4] transition-colors duration-200"
          >
            About Us
          </Link>
          <Link
            href="/policy"
            className="text-base font-semibold text-[#78818f] hover:text-[#6C3CF4] transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            href="/#skills"
            className="text-base font-semibold text-[#78818f] hover:text-[#6C3CF4] transition-colors duration-200"
          >
            Technical Expertise
          </Link>
          <Link
            href="/#contact"
            className="text-base font-semibold text-[#78818f] hover:text-[#6C3CF4] transition-colors duration-200"
          >
            Contact
          </Link>
        </div>

        {/* Divider - Thinner */}
        <div className="w-full max-w-3xl mx-auto h-[1px] bg-gray-200 mb-5"></div>

        {/* Bottom Section - Compact & Inline */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
          
          {/* Social Link - Inline */}
          <a
            href="https://www.linkedin.com/company/tbrain-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-gray-50 rounded-full transition-all duration-300 border border-gray-200 hover:border-[#6C3CF4] hover:shadow-md group"
            aria-label="Follow us on LinkedIn"
          >
            <Image src={iconLinkedin} width={22} height={22} alt="linkedin" />
            <span className="text-[15px] font-semibold text-[#0e1b2e] group-hover:text-[#6C3CF4] transition-colors">
              Follow on LinkedIn
            </span>
          </a>

          {/* Divider vertical on desktop */}
          <div className="hidden md:block w-[1px] h-8 bg-gray-200"></div>

          {/* Address - Inline */}
          <div className="flex items-center gap-2 text-[15px] font-medium text-[#78818f]">
            <svg className="w-5 h-5 text-[#6C3CF4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Sheridan, WY, USA • Hanoi, Vietnam</span>
          </div>
        </div>

        {/* Copyright - Bottom */}
        <div className="text-center mt-6 pt-5 border-t border-gray-100">
          <p className="text-base font-semibold text-[#0e1b2e]">
            © Tbrain 2026 • <span className="text-[#6C3CF4]">Human-in-the-Loop AI Validation</span>
          </p>
          <p className="text-sm text-[#78818f] mt-1">
            Empowering Smarter AI with High-Quality Data
          </p>
        </div>

      </div>

      {/* Bottom subtle accent */}
      <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#6C3CF4]/20 to-transparent"></div>
    </footer>
  );
};

export default Footer;