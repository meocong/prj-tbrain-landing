import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tbrain",
  description: "Full-service human resource agency for AI training experts",
};

import Header from "@/components/common/Header";
import { getPosts } from "@/lib/api"; // Gọi API từ file lib/api.ts
import PostsList from "./posts-list"; // Import Client Component
import Footer from "@/components/common/Footer";
import Image from "next/image";
import post_banner from "@/assets/images/post_banner.png";
import post_bg from "@/assets/images/post_bg.png";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/constants";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ first?: string; q?: string; c?: string }>;
}) {
  const sp = await searchParams;
  const initialFirst = Number(sp.first) || ITEM_PER_PAGE + 1; // Số lượng bài viết ban đầu
  const categorySlug = sp.c || "";
  const search = sp.q || "";

  // Fetch dữ liệu từ server
  const { edges, pageInfo } = await getPosts({
    first: initialFirst,
    search,
    categorySlug,
  });
  const initialPosts = edges.map((edge) => edge.node); // Lấy danh sách bài viết
  const endCursor = pageInfo.endCursor; // Con trỏ để phân trang
  const hasNextPage = pageInfo.hasNextPage; // Kiểm tra có còn trang tiếp theo không

  const firstPost = initialPosts[0]; // Lấy bài viết đầu tiên
  // Render Client Component và truyền dữ liệu xuống
  return (
    <div>
      <Header />
      <main
        style={{ backgroundImage: `url(${post_bg?.src})` }}
        className="bg-center bg-no-repeat bg-cover"
      >
        <div className="wrap !fixed top-[400px] w-full">
          <div className="one top-0 left-0 h-80 w-80 "></div>
          <div className="two top-0 right-0 h-80 w-80 "></div>
        </div>
        <section
          id="home"
          className="container mx-auto px-3 pt-24 pb-24 relative max-w-[1128px]"
        >
          <div className="w-full text-[#222222] text-4xl lg:text-5xl font-medium leading-[52px] mb-[32px]">
            Tbrain News
          </div>
          {firstPost && (
            <div className="w-full bg-white rounded-[28px] shadow flex p-[24px] gap-[32px] flex-col lg:flex-row">
              <Image
                width={300}
                height={196}
                className="w-full h-[415px] rounded-[34px] lg:w-[58%] object-cover"
                src={firstPost.featuredImage?.node?.sourceUrl ?? post_banner}
                alt={firstPost.featuredImage?.node?.altText ?? firstPost.title}
              />
              <div className="flex-col justify-start items-center">
                <div className="text-[#0e1b2e] text-xl font-medium leading-relaxed">
                  <Link href={`/news/${firstPost.slug}`}>
                    {firstPost.title}
                  </Link>
                </div>
                <div
                  className="text-[#78818f] text-base font-normal mt-[10px] mb-[32px] pr-[18px]"
                  dangerouslySetInnerHTML={{ __html: firstPost.excerpt }}
                ></div>
                <div className="text-[#4a8bb0] text-base font-normal leading-snug">
                  <Link href={`/news/${firstPost.slug}`}>Read more</Link>
                </div>
              </div>
            </div>
          )}
          <form method="GET" action="/news">
            <div className="flex justify-center items-center my-[32px] gap-[12px]">
              <input
                className="w-60 h-11 pl-[15px] pr-[70px] pt-3 pb-[13px] bg-white rounded-lg border border-[#e0e0e0] text-[#9f9f9f] text-base font-normal"
                placeholder="Typing in here now..."
                name="q"
                defaultValue={search}
              />
              <button
                type="submit"
                className="text-center text-white text-base font-medium w-[138px] h-11 pt-3 pb-[13px] bg-[#682ec3] rounded-lg justify-center items-center inline-flex"
              >
                Search
              </button>
            </div>
          </form>
          <PostsList
            initialPosts={initialPosts.slice(1)}
            initialEndCursor={endCursor}
            initialHasNextPage={hasNextPage}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
