"use client";

import React from 'react';
import { Star } from 'lucide-react';
import Header from '@/components/common/Header';
import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import { CaseStudyContent } from "@/components/casestudy/CaseStudyContent";
import { usePathname } from 'next/navigation';

export default function Page() {
  const pathname = usePathname();

  return (
    <div>
           <Header />


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