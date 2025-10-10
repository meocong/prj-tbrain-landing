"use client";

import { getPosts } from "@/lib/api";
import Link from "next/link";
import { useState } from "react";
import post_banner from "@/assets/images/post_banner.png";
import post_card_bg from "@/assets/images/post_card_bg.png";
import Image from "next/image";
import { ITEM_PER_PAGE } from "@/constants";
import { formatDate } from "@/utils/date_utils";

type PostsListProps = {
  initialPosts: Post[];
  initialEndCursor: string | null;
  initialHasNextPage: boolean;
};

export default function PostsList({
  initialPosts,
  initialEndCursor,
  initialHasNextPage,
}: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor);
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage);
  const [loading, setLoading] = useState<boolean>(false);

  const loadMorePosts = async () => {
    if (!endCursor || loading) return;
    setLoading(true);

    try {
      const { edges, pageInfo } = await getPosts({
        first: ITEM_PER_PAGE,
        after: endCursor,
      });

      setPosts((prevPosts: Post[]) => [
        ...prevPosts,
        ...edges.map((edge) => edge.node),
      ]);
      setEndCursor(pageInfo.endCursor);
      setHasNextPage(pageInfo.hasNextPage);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex-col justify-start items-center gap-8 flex">
      {/* Posts Grid */}
      <div className="self-stretch justify-start items-stretch grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: Post) => (
          <div
            key={post.id}
            className="h-full p-5 bg-white/80 backdrop-blur-sm rounded-[28px] shadow hover:shadow-xl transition-all duration-300 flex-col flex relative overflow-hidden bg-center bg-no-repeat bg-cover group"
            style={{ backgroundImage: `url(${post_card_bg?.src})` }}
            data-aos="fade-up"
          >
            <div className="self-stretch h-full flex-col justify-between items-start gap-5 flex relative z-10">
              <div className="self-stretch flex-col justify-start items-start gap-3.5 flex">
                <div className="relative w-full overflow-hidden rounded-3xl">
                  <Image
                    width={300}
                    height={196}
                    className="w-full h-[196px] rounded-3xl object-cover transition-transform duration-300 group-hover:scale-105"
                    src={post.featuredImage?.node?.sourceUrl ?? post_banner}
                    alt={post.featuredImage?.node?.altText ?? post.title}
                  />
                </div>
                
                <div className="self-stretch text-[#78818f] text-xs font-medium uppercase tracking-wide flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(post.date)}
                </div>
                
                <h3 className="text-[#0e1b2e] text-xl font-semibold leading-tight line-clamp-2 group-hover:text-[#6c3cf4] transition-colors">
                  <Link href={`/news/${post.slug}`}>{post.title}</Link>
                </h3>
                
                <div
                  className="text-[#78818f] text-sm font-normal leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: post.excerpt ?? "" }}
                />
              </div>
              
              <Link 
                href={`/news/${post.slug}`}
                className="inline-flex items-center gap-2 text-[#6c3cf4] text-base font-semibold hover:gap-3 transition-all mt-auto group/link"
              >
                Read more
                <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="w-full text-center py-16">
          <div className="inline-flex flex-col items-center gap-4">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-xl font-semibold text-[#0e1b2e] mb-2">No articles found</h3>
              <p className="text-[#78818f]">Try adjusting your search or filters</p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Section */}
      {posts.length > 0 && (
        <div className="flex flex-col items-center gap-6 pt-4">
          {/* Load More Button */}
          {hasNextPage && (
            <button
              onClick={loadMorePosts}
              disabled={loading}
              className="group px-8 py-3 bg-[#6c3cf4] hover:bg-[#5a2fd3] text-white text-base font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[180px] justify-center"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More Articles</span>
                  <svg
                    className="w-5 h-5 transition-transform group-hover:translate-y-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          )}

          {/* Page Info */}
          <div className="flex items-center gap-3 text-[#78818f] text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">{posts.length}</span>
              <span>articles displayed</span>
            </div>
            
            {hasNextPage && (
              <>
                <span>•</span>
                <span className="text-[#6c3cf4] font-medium">More available</span>
              </>
            )}
          </div>

          {/* End Message */}
          {!hasNextPage && (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6c3cf4]/10 to-transparent rounded-full border border-[#6c3cf4]/20">
              <svg className="w-5 h-5 text-[#6c3cf4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[#0e1b2e] font-medium">
                {`You've reached the end`}
              </span>
              <span className="text-[#78818f]">•</span>
              <span className="text-[#78818f]">
                All {posts.length} articles loaded
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
