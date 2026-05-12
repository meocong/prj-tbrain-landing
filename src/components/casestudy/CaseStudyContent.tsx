"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import type { CaseStudy } from "@/lib/landing/case-studies";

export function CaseStudyContent({ studies }: { studies: CaseStudy[] }) {
  const [filteredStudies, setFilteredStudies] = React.useState(studies);

  React.useEffect(() => {
    setFilteredStudies(studies);
  }, [studies]);

  const handleSearch = (query: string) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      setFilteredStudies(studies);
      return;
    }
    const filtered = studies.filter(study =>
      study.title.toLowerCase().includes(query.toLowerCase()) ||
      study.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
      study.description.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudies(filtered);
  };

  const featuredStudy = filteredStudies[0];
  const regularStudies = filteredStudies.slice(1);

  return (
    <>
      {/* Featured Case Studies */}
      {featuredStudy && (
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 flex p-6 md:p-8 gap-6 md:gap-8 flex-col lg:flex-row mb-12">
          <div className="lg:w-[58%] relative group overflow-hidden rounded-[24px] h-[300px] md:h-[415px]">
            <Image
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              src={featuredStudy.image}
              alt={featuredStudy.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4 bg-[#6c3cf4] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Featured
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#6c3cf4] px-3 py-1 rounded-full text-xs font-medium">
              {featuredStudy.shortDescription}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Link href={`/casestudy/${featuredStudy.slug}`}>
                <h2 className="text-[#0e1b2e] text-2xl md:text-3xl font-semibold leading-tight mb-4 hover:text-[#6c3cf4] transition-colors">
                  {featuredStudy.title}
                </h2>
              </Link>
              <p className="text-[#78818f] text-base font-normal leading-relaxed mb-6">
                {featuredStudy.description}
              </p>
            </div>
            <Link
              href={`/casestudy/${featuredStudy.slug}`}
              className="inline-flex items-center gap-2 text-[#6c3cf4] text-base font-semibold hover:gap-3 transition-all group"
            >
              View more details
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <CaseStudySearch onSearch={handleSearch} />

      {/* Case Studies Grid */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-[#0e1b2e]">
            All Case Studies
          </h2>
          <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-[#6c3cf4]/20 to-transparent rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularStudies.map((study) => (
            <div
              key={study.id}
              className="bg-white/80 backdrop-blur-sm rounded-[24px] shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
            >
              <div className="relative w-full h-[200px] overflow-hidden">
                <Image
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  src={study.image}
                  alt={study.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#6c3cf4] px-3 py-1 rounded-full text-xs font-medium">
                  {study.shortDescription}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <Link href={`/casestudy/${study.slug}`}>
                  <h3 className="text-[#0e1b2e] text-xl font-semibold leading-tight mb-3 hover:text-[#6c3cf4] transition-colors">
                    {study.title}
                  </h3>
                </Link>
                <p className="text-[#78818f] text-sm font-normal leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {study.description}
                </p>
                <Link
                  href={`/casestudy/${study.slug}`}
                  className="inline-flex items-center gap-2 text-[#6c3cf4] text-sm font-semibold hover:gap-3 transition-all group mt-auto"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredStudies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#78818f] text-lg">No case studies found. Try a different search term.</p>
          </div>
        )}
      </div>
    </>
  );
}

// Import this in CaseStudyContent.tsx
import { CaseStudySearch } from './CaseStudySearch';
