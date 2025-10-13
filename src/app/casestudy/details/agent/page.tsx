import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tbrain - AI Agent Creation Case Study",
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
              Agent Creation and Evaluation
            </h1>
            <p className="text-lg text-[#78818f] italic">
              Delivering enterprise-grade AI agents at unprecedented speed
            </p>
          </div>

          {/* Key Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-blue-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-blue-600 mb-2">6</div>
              <div className="text-gray-600 text-sm font-medium">Production Agents</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-indigo-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-indigo-600 mb-2">1</div>
              <div className="text-gray-600 text-sm font-medium">Month Delivery</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-purple-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-purple-600 mb-2">720</div>
              <div className="text-gray-600 text-sm font-medium">Test Queries</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center border-t-4 border-pink-600 hover:shadow-xl transition-all">
              <div className="text-5xl font-bold text-pink-600 mb-2">270</div>
              <div className="text-gray-600 text-sm font-medium">Curated Files</div>
            </div>
          </div>

          {/* About the Client */}
          <div className="mb-12 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-blue-600 rounded-full mr-4"></div>
              About the Client
            </h2>
            <p className="text-[#222222] leading-relaxed text-lg">
              A <span className="font-bold text-blue-600">global enterprise</span> operating across healthcare, finance, telecom, and education engaged Tbrain to stand up domain-specific Q&A agents and a practical evaluation framework they could operate in-house. The assignment prioritized <span className="font-semibold">realism, safety, and speed to value</span>.
            </p>
          </div>

          {/* Objective */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></div>
              Objective
            </h2>
            <div className="bg-blue-50/50 backdrop-blur-sm rounded-2xl p-8 shadow-md">
              <p className="text-[#222222] leading-relaxed text-lg mb-4">
                Deliver <span className="font-bold text-blue-600 text-xl">6 production-grade agents</span> grounded in authentic, approved knowledge and a turnkey evaluation package that the client could run immediately - achieved in <span className="font-bold text-blue-600 text-xl">1 month</span> from kickoff to handoff.
              </p>
              <p className="text-[#222222] leading-relaxed text-lg">
                Each agent would <span className="font-semibold">answer only when evidence exists</span> in its corpus and refuse clearly when evidence is absent, with every expected answer traceable to source material.
              </p>
            </div>
          </div>

          {/* Challenge */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-red-600 rounded-full mr-4"></div>
              The Challenge
            </h2>

            {/* Timeline & Scale */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-[#222222] mb-4">Timeline & Scale</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-blue-700 mb-1">4</div>
                  <div className="text-sm text-gray-700">weeks to deliver</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-indigo-700 mb-1">≥45</div>
                  <div className="text-sm text-gray-700">files per agent</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                  <div className="text-4xl font-bold text-purple-700 mb-1">120</div>
                  <div className="text-sm text-gray-700">prompts per agent</div>
                </div>
              </div>
            </div>

            {/* Evaluation Requirements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-[#222222] mb-4">Evaluation Requirements</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-lg">100</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#222222]">Answerable prompts</div>
                    <div className="text-sm text-gray-600">Strictly from corpus</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-700 font-bold text-lg">20</span>
                  </div>
                  <div>
                    <div className="font-semibold text-[#222222]">Unanswerable prompts</div>
                    <div className="text-sm text-gray-600">To validate refusal behavior</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complexity Details */}
            <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 backdrop-blur-sm rounded-xl p-6">
              <p className="text-[#222222] leading-relaxed mb-4">
                Each corpus mixed formats such as <span className="font-semibold">PDF, DOCX, PPTX, XLSX/CSV, HTML</span>, and SharePoint pages, with layout variety like nested headings, footnotes, long tables, charts, and images. Files spanned small, medium, and large sizes.
              </p>
              <p className="text-[#222222] leading-relaxed">
                The query set had to feel human - covering fact-seeking, procedural, comparison, multi-part, hypothetical queries with realistic patterns like misspellings and domain-term paraphrases. Many prompts required combining evidence across <span className="font-semibold text-red-600">2, 5, and 10+ documents</span>.
              </p>
            </div>
          </div>

          {/* Solution - Pod-Based Model */}
          <div className="mb-12 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-8 flex items-center">
              <div className="w-2 h-8 bg-indigo-600 rounded-full mr-4"></div>
              <p>{`Tbrain's Stragtic!`}</p>            </h2>

            <p className="text-[#222222] leading-relaxed text-lg mb-8">
              Tbrain executed a <span className="font-semibold text-indigo-700">pod-based operating model</span> to maximize throughput within the 1-month window. Multiple teams worked in parallel, each owning the end-to-end lifecycle for one agent under central coordination.
            </p>

            {/* Pod Structure Visual */}
            <div className="mb-8 bg-white/90 rounded-xl p-8 shadow-inner">
              <h3 className="text-2xl font-bold text-center text-[#222222] mb-8">Pod-Based Operating Model</h3>

              {/* Project Manager */}
              <div className="flex justify-center mb-6">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl p-4 shadow-lg text-white text-center max-w-md">
                  <div className="font-bold text-lg mb-1">Project Manager</div>
                  <div className="text-xs opacity-90">Timeline • Unblocking • Quality gate</div>
                </div>
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center mb-6">
                <div className="text-4xl text-gray-400">↓</div>
              </div>

              {/* Teams Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((team) => (
                  <div key={team} className="bg-white border-2 border-indigo-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-all">
                    <div className="font-bold text-indigo-600 text-center mb-2">Team {team}</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <span className="text-blue-500">•</span>
                        <span>Domain Expert</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-green-500">•</span>
                        <span>Query Writer</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-purple-500">•</span>
                        <span>Reviewer + QA</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Five-Stage Workflow */}
            <h3 className="text-2xl font-bold text-[#222222] mb-6 mt-8">Five-Stage Workflow</h3>

            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold mr-3 text-lg">1</div>
                  <h4 className="text-xl font-semibold text-[#222222]">Corpus Curation</h4>
                </div>
                <p className="text-[#222222] ml-13">Sourcing authentic documents, normalizing formats, removing duplicates - each agent holds <span className="font-semibold text-blue-600">≥45 files</span></p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-indigo-500">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold mr-3 text-lg">2</div>
                  <h4 className="text-xl font-semibold text-[#222222]">Query Generation</h4>
                </div>
                <p className="text-[#222222] ml-13">Producing <span className="font-semibold text-indigo-600">~120 realistic prompts</span> per agent covering single and cross-document reasoning</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-purple-500">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold mr-3 text-lg">3</div>
                  <h4 className="text-xl font-semibold text-[#222222]">Ground-Truth Mapping</h4>
                </div>
                <p className="text-[#222222] ml-13">Attaching span-level evidence to every answerable query and marking unanswerable prompts for safe refusal</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-pink-500">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold mr-3 text-lg">4</div>
                  <h4 className="text-xl font-semibold text-[#222222]">Quality Review</h4>
                </div>
                <p className="text-[#222222] ml-13">Enforcing rubric alignment, inter-rater checks, and policy verification for audit-ready outputs</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border-l-4 border-red-500">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold mr-3 text-lg">5</div>
                  <h4 className="text-xl font-semibold text-[#222222]">Final Packaging</h4>
                </div>
                <p className="text-[#222222] ml-13">Assembling test-ready bundles approved by Team Leads for immediate handoff</p>
              </div>
            </div>
          </div>

          {/* Evaluation Rubric */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-[#222222] mb-6 flex items-center">
              <div className="w-2 h-8 bg-purple-600 rounded-full mr-4"></div>
              Evaluation Rubric & Metrics
            </h2>

            <p className="text-[#222222] leading-relaxed text-lg mb-6">
              Every response is compared to the approved corpus with one outcome: <span className="font-semibold">Correct</span>, <span className="font-semibold">Needs Correction</span>, or <span className="font-semibold">Refusal Required</span>.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-t-4 border-green-500">
                <h3 className="text-lg font-bold text-[#222222] mb-3">✓ Correctness</h3>
                <p className="text-[#222222] text-sm">Factually accurate using approved corpus only - verified against exact source passages</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                <h3 className="text-lg font-bold text-[#222222] mb-3">✓ Instruction Following</h3>
                <p className="text-[#222222] text-sm">Respects scope, format, jurisdiction, dates, units, and length constraints</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
                <h3 className="text-lg font-bold text-[#222222] mb-3">✓ Evidence & Citation Quality</h3>
                <p className="text-[#222222] text-sm">Points to exact span, section, page, or table cell for quick verification</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-t-4 border-red-500">
                <h3 className="text-lg font-bold text-[#222222] mb-3">✓ Safety & Compliance</h3>
                <p className="text-[#222222] text-sm">Politely refuses out-of-scope queries - no speculation or external sources</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-t-4 border-purple-500">
                <h3 className="text-lg font-bold text-[#222222] mb-3">✓ Clarity & Formatting</h3>
                <p className="text-[#222222] text-sm">Concise, readable, delivered in requested structure with proper units and labels</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6 border-t-4 border-pink-500">
                <h3 className="text-lg font-bold text-[#222222] mb-3">✓ Coverage</h3>
                <p className="text-[#222222] text-sm">Measures answerable query share - signals corpus adequacy, not model score</p>
              </div>
            </div>
          </div>

          {/* Outcome */}
          <div className="mb-12 bg-gradient-to-br from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-2xl p-8 shadow-md">
            <h2 className="text-3xl font-bold text-[#222222] mb-8 flex items-center">
              <div className="w-2 h-8 bg-green-600 rounded-full mr-4"></div>
              Outcome & Impact
            </h2>

            {/* Project Deliverables */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-2xl font-bold text-green-700 mb-4">Project Deliverables</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-6xl font-bold text-green-600 mb-2">6</div>
                  <div className="text-[#222222] font-semibold">Test-Ready Agents</div>
                  <div className="text-sm text-gray-600 mt-1">Production-grade with full documentation</div>
                </div>
                <div>
                  <div className="text-6xl font-bold text-blue-600 mb-2">270</div>
                  <div className="text-[#222222] font-semibold">Curated Files</div>
                  <div className="text-sm text-gray-600 mt-1">Across all program domains</div>
                </div>
                <div>
                  <div className="text-6xl font-bold text-indigo-600 mb-2">720</div>
                  <div className="text-[#222222] font-semibold">Human-Written Prompts</div>
                  <div className="text-sm text-gray-600 mt-1">Balanced evaluation sets</div>
                </div>
                <div>
                  <div className="text-6xl font-bold text-purple-600 mb-2">160</div>
                  <div className="text-[#222222] font-semibold">Safety Prompts</div>
                  <div className="text-sm text-gray-600 mt-1">Unanswerable items for refusal testing</div>
                </div>
              </div>
            </div>

            {/* Client Benefits */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-[#222222] mb-4">Client Benefits</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Turnkey evaluation framework</span> ready to run internally for benchmarking and fine-tuning</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Every answer mapped</span> to precise supporting passages for streamlined review and audits</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Reproducible & scalable</span> - includes templates and checklists to extend the program at the same pace</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#222222]"><span className="font-semibold">Reduced time-to-value</span> while raising confidence in both grounded accuracy and refusal behavior</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">Ready to Build Enterprise-Grade AI Agents?</h2>
            <p className="text-xl text-blue-100 mb-6">
              Let Tbrain help you deliver production-ready agents on enterprise timelines
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