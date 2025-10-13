"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Image from "next/image";
import Link from "next/link";

const caseStudies = [
  {
    id: 1,
    path: '/casestudy/details/agent',
    title: 'AI Agent Development Platform',
    excerpt: 'Building intelligent AI agents that can understand context, make decisions, and execute complex tasks autonomously. Our platform enables seamless integration of multiple AI models for enhanced performance.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop',
    category: 'AI Development',
    featured: true
  },
  {
    id: 2,
    
    title: "Xometry Manufacturing Intelligence",
    excerpt: "Revolutionizing manufacturing processes with AI-powered analytics and predictive modeling. Smart resource allocation and quality control systems that reduce costs and improve efficiency.",
    path: "/casestudy/details/xometry",
    featuredImage: {
      node: {
        sourceUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop",
        altText: "Manufacturing Intelligence"
      }
    },
    category: "Manufacturing AI"
  },
  {
    id: 3,
    path: '/casestudy/details/scalable',
    title: 'Scalable Multimodal AI System',
    excerpt: 'Advanced multimodal AI architecture that processes text, images, audio, and video simultaneously. Designed for enterprise-scale applications with real-time processing capabilities.',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=500&fit=crop',
    category: 'Enterprise AI'
  }
];

export function CaseStudyContent() {
  const [filteredStudies, setFilteredStudies] = React.useState(caseStudies);

  const handleSearch = (query: string) => {
    const filtered = caseStudies.filter(study =>
      study.title.toLowerCase().includes(query.toLowerCase()) ||
      study.excerpt.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredStudies(filtered);
  };

  const featuredStudy = caseStudies.find(s => s.featured);
  const regularStudies = filteredStudies.filter(s => !s.featured);

  return (
    <>
      {/* Featured Case Study */}
      {featuredStudy && (
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 flex p-6 md:p-8 gap-6 md:gap-8 flex-col lg:flex-row mb-12">
          <div className="lg:w-[58%] relative group overflow-hidden rounded-[24px] h-[300px] md:h-[415px]">
            <Image
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              src={featuredStudy.image ?? ""}
              alt={featuredStudy.title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute top-4 left-4 bg-[#6c3cf4] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Featured
            </div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#6c3cf4] px-3 py-1 rounded-full text-xs font-medium">
              {featuredStudy.category}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <Link href={featuredStudy.path}>
                <h2 className="text-[#0e1b2e] text-2xl md:text-3xl font-semibold leading-tight mb-4 hover:text-[#6c3cf4] transition-colors">
                  {featuredStudy.title}
                </h2>
              </Link>
              <p className="text-[#78818f] text-base font-normal leading-relaxed mb-6">
                {featuredStudy.excerpt}
              </p>
            </div>
            <Link
              href='/casestudy/details/agent'
              className="inline-flex items-center gap-2 text-[#6c3cf4] text-base font-semibold hover:gap-3 transition-all group"
            >
              View Case Study
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
                  src={study.image ?? study.featuredImage?.node.sourceUrl ?? ""}
                  alt={study.title}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#6c3cf4] px-3 py-1 rounded-full text-xs font-medium">
                  {study.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <Link href={study.path}>
                  <h3 className="text-[#0e1b2e] text-xl font-semibold leading-tight mb-3 hover:text-[#6c3cf4] transition-colors">
                    {study.title}
                  </h3>
                </Link>
                <p className="text-[#78818f] text-sm font-normal leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {study.excerpt}
                </p>
                <Link
                  href={study.path}
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