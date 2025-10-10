
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tbrain",
  description: "Full-service human resource agency for AI training experts",
};

import Header from "@/components/common/Header";
import { getPosts } from "@/lib/api";
import PostsList from "./posts-list";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import post_banner from "@/assets/images/post_banner.png";
import StarFill from "@/assets/icons/3star-fill.svg";
import Star from "@/assets/icons/3star.svg";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/constants";

export default async function Page({
  searchParams,
}: {
  searchParams: { first?: string; q?: string; c?: string };
}) {
  const initialFirst = Number(searchParams.first) || ITEM_PER_PAGE + 1;
  const categorySlug = searchParams.c || "";
  const search = searchParams.q || "";

  const { edges, pageInfo } = await getPosts({
    first: initialFirst,
    search,
    categorySlug,
  });
  const initialPosts = edges.map((edge) => edge.node);
  const endCursor = pageInfo.endCursor;
  const hasNextPage = pageInfo.hasNextPage;

  const firstPost = initialPosts[0];

  return (
    <div className="relative bg-gradient-to-b from-purple-50/30 via-white to-purple-50/30">
      <Header />
      
      {/* Animated Background */}
      
      <div className="wrap">
        <div className="one top-0 left-1/4 h-80 w-80"></div>
        <div className="two top-0 right-1/4 h-80 w-80"></div>
      </div>

      <main className="relative z-10">
        <section
          id="home"
          className="container mx-auto px-3 pt-24 pb-24 relative max-w-[1128px]"
        >
          {/* Page Title with Floating Star */}
          <div className="relative mb-12">
            <div className="absolute -top-4 right-[15%] hidden md:block">
              <div className="up-down">
                <Image src={Star} width={38} height={38} alt="Floating Icon" />
              </div>
            </div>
            <h1 className="text-[#222222] text-4xl lg:text-5xl font-medium leading-tight">
              Tbrain News
            </h1>
          </div>

          {/* Featured cst */}
          {firstPost && (
            <div 
              className="w-full bg-white/80 backdrop-blur-sm rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 flex p-6 md:p-8 gap-6 md:gap-8 flex-col lg:flex-row mb-12"
              data-aos="fade-up"
            >
              <div className="lg:w-[58%] relative group overflow-hidden rounded-[24px]">
                <Image
                  width={800}
                  height={415}
                  className="w-full h-[300px] md:h-[415px] object-cover transition-transform duration-300 group-hover:scale-105"
                  src={firstPost.featuredImage?.node?.sourceUrl ?? post_banner}
                  alt={firstPost.featuredImage?.node?.altText ?? firstPost.title}
                />
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 bg-[#6c3cf4] text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Featured
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-[#0e1b2e] text-2xl md:text-3xl font-semibold leading-tight mb-4 hover:text-[#6c3cf4] transition-colors">
                    <Link href={`/news/${firstPost.slug}`}>
                      {firstPost.title}
                    </Link>
                  </h2>
                  <div
                    className="text-[#78818f] text-base font-normal leading-relaxed mb-6 line-clamp-4"
                    dangerouslySetInnerHTML={{ __html: firstPost.excerpt }}
                  />
                </div>
                <Link 
                  href={`/news/${firstPost.slug}`}
                  className="inline-flex items-center gap-2 text-[#6c3cf4] text-base font-semibold hover:gap-3 transition-all group"
                >
                  Read more 
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-12">
            <div className="absolute -bottom-8 left-[40%] hidden md:block">
              <div className="down-up">
                <Image src={StarFill} width={32} height={32} alt="Floating Icon" />
              </div>
            </div>
            <form method="GET" action="/news">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-md">
                <div className="relative w-full sm:w-auto">
                  <input
                    className="w-full sm:w-80 h-12 pl-12 pr-4 bg-white rounded-xl border-2 border-gray-200 focus:border-[#6c3cf4] outline-none text-gray-700 text-base transition-all"
                    placeholder="Search articles..."
                    name="q"
                    defaultValue={search}
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
                  type="submit"
                  className="w-full sm:w-auto px-8 h-12 bg-[#6c3cf4] hover:bg-[#5a2fd3] text-white text-base font-semibold rounded-xl transition-all hover:shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Background elements for posts section */}
          <div className="wrap">
            <div className="one top-[60%] left-0 h-80 w-80"></div>
            <div className="two top-[60%] right-0 h-80 w-80"></div>
          </div>

          {/* Posts List */}
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-[#0e1b2e]">
                Latest Articles
              </h2>
              <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-[#6c3cf4]/20 to-transparent rounded-full"></div>
            </div>
            <PostsList
              initialPosts={initialPosts.slice(1)}
              initialEndCursor={endCursor}
              initialHasNextPage={hasNextPage}
            />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
