import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tbrain - CAD Annotation Case Study",
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
              High-Accuracy CAD Annotation and Review Project
            </h1>
            <p className="text-lg text-[#78818f] italic">
              Delivering mission-critical data for AI-powered manufacturing intelligence
            </p>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-emerald-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-emerald-600 mb-2">500</div>
              <div className="text-gray-600 text-sm font-medium">CAD Drawings</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-blue-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-blue-600 mb-2">15</div>
              <div className="text-gray-600 text-sm font-medium">Annotation Fields</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-purple-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-purple-600 mb-2">95%+</div>
              <div className="text-gray-600 text-sm font-medium">Accuracy Rate</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-pink-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-pink-600 mb-2">30</div>
              <div className="text-gray-600 text-sm font-medium">Days Delivery</div>
            </div>
          </div>

          {/* About the Client */}
          <div className="mb-12 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
              About the Client
            </h2>
            <div className="space-y-4">
              <p className="text-[#222222] leading-relaxed text-lg">
                Tbrain partnered with a <span className="font-bold text-blue-600">leading AI-powered manufacturing company</span> valued at nearly <span className="font-bold text-blue-600">$3 billion on NASDAQ</span>.
              </p>
              <p className="text-[#222222] leading-relaxed text-lg">
                This industry leader connects businesses with a vast network of manufacturing partners worldwide, offering services ranging from <span className="font-semibold">CNC machining and 3D printing to injection molding, sheet metal fabrication</span>, serving industries including aerospace, automotive, healthcare, robotics, and consumer products.
              </p>
            </div>
          </div>

          {/* Objective */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></div>
              Project Objective
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#222222] mb-2">Accuracy</h3>
                  <p className="text-gray-600 text-sm">At least <span className="font-bold text-indigo-600">95%</span> accuracy rate required</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">⚡</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#222222] mb-2">Speed</h3>
                  <p className="text-gray-600 text-sm">Strict <span className="font-bold text-blue-600">30-day</span> timeline</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔧</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#222222] mb-2">Solution</h3>
                  <p className="text-gray-600 text-sm">Complete <span className="font-bold text-purple-600">turnkey process</span> from scratch</p>
                </div>
              </div>
            </div>
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
                  <span className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold mr-3">⏱️</span>
                  Intense Time Pressure & Scale
                </h3>
                <p className="text-[#222222] ml-13">
                  Process and annotate <span className="font-bold text-red-600">500 complex CAD drawings</span> across <span className="font-bold text-red-600">15 annotation fields</span> within just one month. Manual approaches would cause unacceptable delays and high error rates.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-orange-500">
                <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
                  <span className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold mr-3">🚫</span>
                  No Established Process
                </h3>
                <p className="text-[#222222] ml-13">
                  Client had <span className="font-bold text-orange-600">no formalized annotation platform or workflow</span>, requiring Tbrain to engineer a dedicated solution from the ground up.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-yellow-500">
                <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
                  <span className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold mr-3">👨‍🔧</span>
                  Specialized Talent Shortage
                </h3>
                <p className="text-[#222222] ml-13">
                  Required <span className="font-bold text-yellow-600">deep mechanical engineering expertise</span> for CAD drawing interpretation. Client lacked sufficient in-house subject matter experts.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 border-l-4 border-purple-500">
                <h3 className="text-xl font-semibold text-[#222222] mb-3 flex items-center">
                  <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold mr-3">✓</span>
                  High Quality Standard
                </h3>
                <p className="text-[#222222] ml-13">
                  Strict mandate requiring <span className="font-bold text-purple-600">minimum 95% accuracy rate</span> to be deemed acceptable for AI training purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Solution - 5-Layer QA Framework */}
          <div className="mb-12 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-8 flex items-center">
              <div className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></div>
              Tbrain's Strategic Solution
            </h2>

            <p className="text-[#222222] leading-relaxed text-lg mb-8">
              We designed a comprehensive strategy built on <span className="font-bold text-indigo-600">three foundational pillars</span>: Multi-Layer Quality Assurance, Strategic Platform Integration, and Elite Subject Matter Experts.
            </p>

            {/* 5-Layer QA Visual */}
            <div className="mb-8 bg-white/90 rounded-xl p-8 shadow-inner">
              <h3 className="text-2xl font-bold text-center text-[#222222] mb-8">5-Layer Quality Assurance Framework</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">Layer 1</div>
                      <div className="text-xs">MAKER</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-bold text-[#222222] mb-1">Annotation Execution</h4>
                    <p className="text-sm text-gray-600">Domain-trained makers perform detailed interpretation and initial annotation across all 15 fields</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-4xl text-gray-400">↓</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">Layer 2</div>
                      <div className="text-xs">REVIEW</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-green-50 rounded-lg p-4">
                    <h4 className="font-bold text-[#222222] mb-1">100% Peer Review</h4>
                    <p className="text-sm text-gray-600">Expert mechanical engineer validates technical accuracy and provides actionable feedback</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-4xl text-gray-400">↓</div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-6 border-2 border-yellow-400">
                  <h4 className="font-bold text-[#222222] mb-4 text-center">Parallel Statistical Quality Gates</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <div className="text-center text-white">
                          <div className="text-xl font-bold">Layer 3</div>
                          <div className="text-xs">SAMPLE 1</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Independent QA analyst validates random sample</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                        <div className="text-center text-white">
                          <div className="text-xl font-bold">Layer 4</div>
                          <div className="text-xs">SAMPLE 2</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Concurrent second QA analyst validates separate sample</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 bg-red-100 rounded p-3 text-center">
                    <p className="text-sm font-semibold text-red-700">⚠️ If either sample fails → Entire batch rejected</p>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div className="text-4xl text-gray-400">↓</div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <div className="text-center text-white">
                      <div className="text-2xl font-bold">Layer 5</div>
                      <div className="text-xs">FINAL QA</div>
                    </div>
                  </div>
                  <div className="flex-1 bg-purple-50 rounded-lg p-4">
                    <h4 className="font-bold text-[#222222] mb-1">Client Acceptance</h4>
                    <p className="text-sm text-gray-600">Seamless validation of pre-polished, high-quality data by client team</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Solutions Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h4 className="text-lg font-bold text-[#222222] mb-2">Platform Integration</h4>
                <p className="text-gray-600 text-sm">Leveraged <span className="font-semibold">Labelbox</span> for intelligent workload distribution, collaborative annotation, and complete audit trails</p>
              </div>

              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <h4 className="text-lg font-bold text-[#222222] mb-2">Elite Team Assembly</h4>
                <p className="text-gray-600 text-sm">University lecturers, top-10 US engineering graduates, and Associate Professors with 20+ years experience</p>
              </div>

              <div className="bg-white/90 rounded-xl p-6 shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h4 className="text-lg font-bold text-[#222222] mb-2">Quality First</h4>
                <p className="text-gray-600 text-sm">Proprietary validation tools and batched delivery to ensure zero surprises at project conclusion</p>
              </div>
            </div>
          </div>

          {/* Implementation Process */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
              Implementation Process
            </h2>

            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xl">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-[#222222] mb-2">Project Kick-off & Setup</h3>
                    <p className="text-gray-600 text-sm">Deep-dive requirements meetings, Statement of Work (SOW) development, Labelbox configuration, and comprehensive team onboarding</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-indigo-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xl">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-[#222222] mb-2">Annotation & Review Cycle</h3>
                    <p className="text-gray-600 text-sm">Continuous high-velocity loop: Task distribution → Maker annotation (100 drawings/week) → Expert review → Parallel sample testing → QA validation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold flex-shrink-0 text-xl">3</div>
                  <div>
                    <h3 className="text-lg font-bold text-[#222222] mb-2">Finalization & Delivery</h3>
                    <p className="text-gray-600 text-sm">Batched submission (5 batches of 100), proprietary tool validation, secure data export, and complete project handover with detailed reporting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome */}
          <div className="mb-12 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-8 flex items-center">
              <div className="w-2 h-8 bg-green-600 rounded-full mr-4"></div>
              Outstanding Outcome
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/90 rounded-xl p-6 shadow-lg border-t-4 border-green-500">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-green-600">95%+</div>
                  <div className="text-gray-600 font-semibold mt-2">High Pass Rate Achieved</div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Exceeded the ambitious 95% requirement with exceptionally high accuracy validated by client's rigorous internal checks
                </p>
              </div>

              <div className="bg-white/90 rounded-xl p-6 shadow-lg border-t-4 border-blue-500">
                <div className="text-center mb-4">
                  <div className="text-6xl font-bold text-blue-600">30</div>
                  <div className="text-gray-600 font-semibold mt-2">Days On-Time Delivery</div>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  All 500 complex drawings completed precisely within strict timeline, preventing costly downstream delays
                </p>
              </div>
            </div>

            <div className="bg-white/90 rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-[#222222] mb-4">Client Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Scalable & Replicable Workflow:</span> Established validated process serves as powerful benchmark for ongoing business needs</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Zero Strain on Internal Resources:</span> Client's engineering team remained focused on core innovation and revenue-generating activities</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Turnkey Solution Delivered:</span> Complete end-to-end process from scratch with zero rework required</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">AI Initiative Protected:</span> Strategic timeline preserved with absolute confidence in data foundation</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-emerald-600 to-blue-700 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Need Expert CAD Annotation Services?</h2>
            <p className="text-xl text-emerald-100 mb-6">
              Let Tbrain deliver precision-engineered data solutions on enterprise timelines
            </p>
            <Link
              href="mailto:info@tbrain.ai"
              className="inline-block bg-white text-emerald-700 font-bold py-3 px-8 rounded-lg hover:bg-emerald-50 transition-colors shadow-lg"
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