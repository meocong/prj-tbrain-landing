"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';

interface CaseStudySearchProps {
  onSearch: (query: string) => void;
}

export function CaseStudySearch({ onSearch }: CaseStudySearchProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (
    e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="relative mb-12">
      <div className="absolute -bottom-8 left-[40%] hidden md:block animate-bounce" style={{ animationDelay: '0.5s' }}>
        <Sparkles className="w-8 h-8 text-purple-400 fill-purple-400" />
      </div>
      <div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
          <div className="relative w-full sm:w-auto">
            <input
              className="w-full sm:w-80 h-12 pl-12 pr-4 bg-white rounded-xl border-2 border-gray-200 focus:border-[#6c3cf4] outline-none text-gray-700 text-base transition-all"
              placeholder="Search case studies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-8 h-12 bg-[#6c3cf4] hover:bg-[#5a2fd3] text-white text-base font-semibold rounded-xl transition-all hover:shadow-lg"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}