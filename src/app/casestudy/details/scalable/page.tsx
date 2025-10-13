import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tbrain - Scalable Multimodal AI Case Study",
  description: "Full-service human resource agency for AI training experts",
};

import post_bg from "@/assets/images/post_bg.png";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import Header from "@/components/common/Header";


export default async function Page() {
  return (
    <div>
      {/* Header */}
           <Header />


      <main
        style={{ backgroundImage: `url(${post_bg?.src})` }}
        className="bg-center bg-no-repeat bg-cover"
      >
        <div className="wrap !fixed top-[400px] w-full">
          <div className="one top-0 left-0 h-80 w-80"></div>
          <div className="two top-0 right-0 h-80 w-80"></div>
        </div>

        <section className="container mx-auto px-3 pt-24 pb-24 relative max-w-[1128px]">
          {/* Hero Title */}
          <div className="mb-12">
            <h1 className="text-[#222222] text-4xl lg:text-5xl font-semibold leading-[52px] mb-4">
              Scalable Multimodal Data Labeling for Advanced GenAI Training
            </h1>
            <p className="text-lg text-[#78818f] italic">
              Creating 48,000 complex visual prompts across 7 scientific disciplines
            </p>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-blue-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-blue-600 mb-2">48K</div>
              <div className="text-gray-600 text-sm font-medium">Visual Prompts</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-indigo-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-indigo-600 mb-2">7</div>
              <div className="text-gray-600 text-sm font-medium">Scientific Domains</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-purple-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-purple-600 mb-2">600</div>
              <div className="text-gray-600 text-sm font-medium">Expert Makers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-pink-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-pink-600 mb-2">90%</div>
              <div className="text-gray-600 text-sm font-medium">Pass Rate</div>
            </div>
          </div>

          {/* Project Overview */}
          <div className="mb-12 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
              Project Overview
            </h2>
            <p className="text-[#222222] leading-relaxed text-lg mb-4">
              The client aimed to develop <span className="font-bold text-blue-600">robust, contextually aware Generative AI models</span> capable of sophisticated reasoning and accurate visual comprehension across multiple scientific disciplines.
            </p>
            <p className="text-[#222222] leading-relaxed text-lg">
              This case study demonstrates how Tbrain created <span className="font-bold text-indigo-600">48,000 complex visual prompts</span> tailored for advanced undergraduate-level understanding in <span className="font-semibold">Chemistry, Biology, Medical Sciences, Mathematics, Physics, Engineering, and Economics</span>.
            </p>
          </div>

          {/* Challenge */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-red-600 rounded-full mr-4"></div>
              The Challenge
            </h2>

            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-red-500">
                <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold mr-3 text-sm">1</span>
                  Recruiting Specialized Workforce
                </h3>
                <p className="text-[#222222] ml-11">
                  Initial team of only <span className="font-bold text-red-600">50 Makers and 5 QCs</span> was insufficient. Required rapid scaling to <span className="font-bold text-red-600">600 Makers and 20 QCs</span> with postgraduate-level expertise.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
                  <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3 text-sm">2</span>
                  Complex Task Requirements
                </h3>
                <p className="text-[#222222] ml-11">
                  Each visual prompt required meeting <span className="font-bold text-orange-600">8 strict criteria</span>, demanding multi-step conceptual reasoning that challenged learners to interpret visual content and apply abstract concepts.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
                  <span className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold mr-3 text-sm">3</span>
                  Maintaining Quality at Scale
                </h3>
                <p className="text-[#222222] ml-11">
                  Required sophisticated <span className="font-bold text-yellow-600">multi-stage review process</span>: domain experts (Rv1), language verification (Rv2), and final QC - all while preventing bottlenecks and quality cascades.
                </p>
              </div>
            </div>
          </div>

          {/* Solution - Workflow Diagram */}
          <div className="mb-12 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-8 flex items-center">
              <div className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></div>
              Tbrain's Strategic Solution
            </h2>

            {/* Workflow Visual */}
            <div className="mb-8 bg-white/90 rounded-xl p-8 shadow-inner">
              <h3 className="text-2xl font-bold text-center text-[#222222] mb-8">Multi-Layer Quality Workflow</h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <div className="text-center text-white">
                      <div className="text-3xl font-bold">MAKER</div>
                      <div className="text-sm mt-1">Layer 1</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-4xl text-gray-400 hidden md:block">→</div>
                
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">REVIEW</div>
                      <div className="text-xs mt-1">RV1 + RV2</div>
                      <div className="text-sm">Layer 2</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-4xl text-gray-400 hidden md:block">→</div>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="w-32 h-32 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <div className="text-center text-white">
                      <div className="text-xl font-bold">SAMPLE 1</div>
                      <div className="text-sm">Layer 3</div>
                    </div>
                  </div>
                  <div className="w-32 h-32 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <div className="text-center text-white">
                      <div className="text-xl font-bold">SAMPLE 2</div>
                      <div className="text-sm">Layer 4</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-4xl text-gray-400 hidden md:block">→</div>
                
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">FINAL QA</div>
                      <div className="text-sm mt-1">Layer 5</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Solutions */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">👥</span>
                </div>
                <h4 className="text-lg font-bold text-[#222222] mb-2">Talent Recruitment</h4>
                <p className="text-gray-600 text-sm">Scaled from 50 to 600 Makers through academic partnerships with top-tier universities and AI research labs</p>
              </div>

              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h4 className="text-lg font-bold text-[#222222] mb-2">Real-time Dashboard</h4>
                <p className="text-gray-600 text-sm">Looker Data Studio for live progress tracking, bottleneck identification, and performance analytics</p>
              </div>

              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h4 className="text-lg font-bold text-[#222222] mb-2">Quality Assurance</h4>
                <p className="text-gray-600 text-sm">Multi-tiered review with performance-based management - underperformers retrained or removed</p>
              </div>
            </div>
          </div>

          {/* Outcome */}
          <div className="mb-12 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-8 flex items-center">
              <div className="w-2 h-8 bg-green-600 rounded-full mr-4"></div>
              Outstanding Results
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-green-700 mb-4">Before Optimization</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Personnel</span>
                    <span className="font-bold text-red-600">5 QCs, 50 Makers</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Pass Rate</span>
                    <span className="font-bold text-red-600">30%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Productivity</span>
                    <span className="font-bold text-red-600">200-300/week</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/90 rounded-xl p-6 shadow-md border-2 border-green-500">
                <h3 className="text-xl font-bold text-green-700 mb-4">After Optimization</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Personnel</span>
                    <span className="font-bold text-green-600">20 QCs, 600 Makers</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-gray-600">Pass Rate</span>
                    <span className="font-bold text-green-600">80-90%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Productivity</span>
                    <span className="font-bold text-green-600">3000-4000/week</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#222222] mb-4">Final Deliverables</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-bold text-green-700">35,401 prompts</span> delivered and final-approved with high academic and linguistic precision</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-bold text-green-700">12x growth</span> in team size without compromising quality standards</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-bold text-green-700">Dramatic reduction</span> in bottlenecks through real-time dashboards and daily sync-ups</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Need High-Quality Multimodal AI Training Data?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Let Tbrain deliver scalable, expert-driven annotation solutions
            </p>
            <Link
              href="mailto:info@tbrain.ai"
              className="inline-block bg-white text-blue-700 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Contact Us Today
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}