import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tbrain",
  description: "Full-service human resource agency for AI training experts",
};

import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { getPostDetail } from "@/lib/api";
import facebook from "@/assets/images/facebook.png";
import linkedin from "@/assets/images/linkedin.png";
import twitter from "@/assets/images/twitter.png";
import StarFill from "@/assets/icons/3star-fill.svg";
import Star from "@/assets/icons/3star.svg";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/utils/date_utils";

type PostPageProps = {
  params: {
    slug: string;
  };
};

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = params;
  const post: PostDetail | null = await getPostDetail({ slug });

  if (!post) {
    return <div>Post not found</div>;
  }
  metadata.title = post.title;
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}news/${post.slug}`;

  // Achievement stats - customize based on actual data
  const achievements = [
    { number: "500+", label: "AI Experts" },
    { number: "100+", label: "Projects Delivered" },
    { number: "98%", label: "Client Satisfaction" },
    { number: "24/7", label: "Support Available" },
  ];

  return (
    <div className="relative bg-gradient-to-b from-purple-50/30 via-white to-purple-50/30">
      <Header />
      
      {/* Animated Background */}
      <div className="wrap">
        <div className="one top-0 left-1/4 h-80 w-80"></div>
        <div className="two top-0 right-1/4 h-80 w-80"></div>
      </div>

      <main className="relative z-10">
        {/* Breadcrumb Section */}
        <section className="container mx-auto px-3 pt-28 max-w-[1128px] relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Link 
              href="/news" 
              className="text-[#8b90a7] text-base font-medium hover:text-[#6c3cf4] transition-colors"
            >
              News
            </Link>
            <span className="text-[#8b90a7]">/</span>
            <span className="text-[#6c3cf4] text-base font-medium line-clamp-1">
              {post.title}
            </span>
          </div>
        </section>

        {/* Hero Section */}
        <section className="container mx-auto px-3 max-w-[1128px] relative z-10 mb-8">
          {/* Floating Star Icons */}
          <div className="absolute -top-8 right-[10%] hidden md:block">
            <div className="up-down">
              <Image src={Star} width={38} height={38} alt="Floating Icon" />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories.edges.map((edge) => (
              <Link
                key={edge.node.name}
                href={`/news?c=${edge.node.slug}`}
                className="px-5 py-2 bg-white rounded-3xl text-[#6c3cf4] text-sm font-medium shadow hover:shadow-lg transition-all"
              >
                {edge.node.name}
              </Link>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-[#0e1b2e] mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-[#78818f] text-base font-medium pb-6 border-b border-[#d8e9f3] mb-12">
            <time className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(post.date)}
            </time>
          </div>
        </section>

        {/* Background for middle sections */}
        <div className="wrap">
          <div className="one top-[40%] left-0 h-80 w-80"></div>
          <div className="two top-[40%] right-0 h-80 w-80"></div>
        </div>

        {/* Achievement Stats */}
        <section className="py-16 my-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6c3cf4] to-[#8b5cf6] opacity-95"></div>
          <div className="container mx-auto px-3 max-w-[1128px] relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group"
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                >
                  <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-white/90 text-sm md:text-base font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Floating Star */}
          <div className="absolute bottom-8 left-[45%] hidden md:block">
            <div className="down-up">
              <Image src={StarFill} width={38} height={38} alt="Floating Icon" />
            </div>
          </div>
        </section>

        {/* Article Content with Enhanced Styling */}
        <section className="py-16 relative z-10 bg-white/60 backdrop-blur-sm">
          <div className="container mx-auto px-3 max-w-[820px]">
            <article 
              className="post-content
                [&>h1]:text-4xl [&>h1]:md:text-5xl [&>h1]:font-bold [&>h1]:text-[#0e1b2e] [&>h1]:mt-12 [&>h1]:mb-6 [&>h1]:leading-tight
                [&>h2]:text-3xl [&>h2]:md:text-4xl [&>h2]:font-bold [&>h2]:text-[#0e1b2e] [&>h2]:mt-10 [&>h2]:mb-5 [&>h2]:leading-tight
                [&>h3]:text-2xl [&>h3]:md:text-3xl [&>h3]:font-semibold [&>h3]:text-[#0e1b2e] [&>h3]:mt-8 [&>h3]:mb-4
                [&>h4]:text-xl [&>h4]:md:text-2xl [&>h4]:font-semibold [&>h4]:text-[#0e1b2e] [&>h4]:mt-6 [&>h4]:mb-3
                [&>p]:text-[#222222] [&>p]:text-base [&>p]:md:text-lg [&>p]:leading-relaxed [&>p]:mb-6
                [&>p>strong]:text-[#0e1b2e] [&>p>strong]:font-semibold [&>p>strong]:bg-gradient-to-r [&>p>strong]:from-[#6c3cf4]/10 [&>p>strong]:to-transparent [&>p>strong]:px-1
                [&>blockquote]:border-l-4 [&>blockquote]:border-[#6c3cf4] [&>blockquote]:pl-6 [&>blockquote]:py-4 [&>blockquote]:my-8 [&>blockquote]:bg-[#6c3cf4]/5 [&>blockquote]:rounded-r-lg [&>blockquote]:italic [&>blockquote]:text-[#222222]
                [&>ul]:my-6 [&>ul]:space-y-3 [&>ul]:ml-6
                [&>ol]:my-6 [&>ol]:space-y-3 [&>ol]:ml-6
                [&>li]:text-[#222222] [&>li]:text-base [&>li]:md:text-lg [&>li]:leading-relaxed
                [&>ul>li]:list-disc [&>ul>li]:marker:text-[#6c3cf4]
                [&>ol>li]:list-decimal [&>ol>li]:marker:text-[#6c3cf4] [&>ol>li]:marker:font-semibold
                [&>a]:text-[#6c3cf4] [&>a]:font-medium [&>a]:no-underline [&>a]:hover:underline [&>a]:transition-all
                [&>img]:rounded-2xl [&>img]:shadow-xl [&>img]:my-8 [&>img]:w-full [&>img]:h-auto
                [&>pre]:bg-[#0e1b2e] [&>pre]:text-white [&>pre]:p-6 [&>pre]:rounded-xl [&>pre]:my-8 [&>pre]:overflow-x-auto [&>pre]:shadow-lg
                [&>code]:bg-[#6c3cf4]/10 [&>code]:text-[#6c3cf4] [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono
                [&>table]:w-full [&>table]:my-8 [&>table]:border-collapse
                [&>table>thead]:bg-[#6c3cf4] [&>table>thead]:text-white
                [&>table>thead>tr>th]:px-4 [&>table>thead>tr>th]:py-3 [&>table>thead>tr>th]:text-left [&>table>thead>tr>th]:font-semibold
                [&>table>tbody>tr]:border-b [&>table>tbody>tr]:border-gray-200
                [&>table>tbody>tr>td]:px-4 [&>table>tbody>tr>td]:py-3 [&>table>tbody>tr>td]:text-[#222222]
                [&>table>tbody>tr:hover]:bg-[#6c3cf4]/5
                [&>.highlight]:bg-gradient-to-r [&>.highlight]:from-[#6c3cf4]/20 [&>.highlight]:to-transparent [&>.highlight]:px-4 [&>.highlight]:py-2 [&>.highlight]:rounded-lg [&>.highlight]:my-4 [&>.highlight]:border-l-4 [&>.highlight]:border-[#6c3cf4]"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </section>

        {/* Share & Categories */}
        <section className="py-12 border-t border-[#d8e9f3] bg-white/60 backdrop-blur-sm relative z-10">
          <div className="container mx-auto px-3 max-w-[820px]">
            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-[#5a5d71] text-base font-medium">Categories:</span>
              {post.categories.edges.map((edge, index) => (
                <span key={edge.node.name}>
                  <Link
                    href={`/news?c=${edge.node.slug}`}
                    className="inline-flex items-center px-4 py-2 bg-white rounded-full text-[#6c3cf4] text-base font-medium shadow hover:shadow-lg transition-all"
                  >
                    {edge.node.name}
                  </Link>
                  {index < post.categories.edges.length - 1 && " "}
                </span>
              ))}
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-4 pt-6 border-t border-[#d8e9f3]">
              <span className="text-[#5a5d71] text-base font-medium">Share:</span>
              <div className="flex items-center gap-3">
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
                  className="w-10 h-10 flex items-center justify-center bg-[#1877f2] hover:bg-[#0d65d9] rounded-full transition-all hover:scale-110 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on Facebook"
                >
                  <Image className="w-5 h-5 brightness-0 invert" src={facebook} alt="Facebook" />
                </Link>
                <Link
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}`}
                  className="w-10 h-10 flex items-center justify-center bg-[#0077b5] hover:bg-[#006399] rounded-full transition-all hover:scale-110 shadow-md"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                >
                  <Image className="w-5 h-5 brightness-0 invert" src={linkedin} alt="LinkedIn" />
                </Link>
                <Link
                  href={`https://twitter.com/intent/tweet?url=${postUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-[#1da1f2] hover:bg-[#0d8bd9] rounded-full transition-all hover:scale-110 shadow-md"
                  aria-label="Share on Twitter"
                >
                  <Image className="w-5 h-5 brightness-0 invert" src={twitter} alt="Twitter" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Background for CTA */}
        <div className="wrap">
          <div className="three top-[85%] left-[30%] h-80 w-80"></div>
          <div className="two top-[85%] right-[30%] h-80 w-80"></div>
        </div>

        {/* CTA Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6c3cf4] to-[#8b5cf6] opacity-95"></div>
          <div className="container mx-auto px-3 max-w-[820px] text-center relative z-10">
            <div className="flex justify-center mb-6">
              <div className="up-down">
                <Image src={StarFill} width={48} height={48} alt="Floating Icon" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-white mb-6 leading-tight">
              Ready to Transform Your AI Training?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Our team of experts is ready to deliver high-quality AI training solutions tailored to your needs
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/contact"
                className="px-8 py-4 bg-white text-[#6c3cf4] rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg text-base"
              >
                Get Started Today
              </Link>
              <Link
                href="/news"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all text-base"
              >
                Read More News
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}