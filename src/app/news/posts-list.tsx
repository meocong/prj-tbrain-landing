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
  const [posts, setPosts] = useState<Post[]>(initialPosts); // Quản lý danh sách bài viết
  const [endCursor, setEndCursor] = useState<string | null>(initialEndCursor); // Con trỏ phân trang
  const [hasNextPage, setHasNextPage] = useState<boolean>(initialHasNextPage); // Kiểm tra có còn trang tiếp theo không
  const [loading, setLoading] = useState<boolean>(false); // Quản lý trạng thái đang tải

  const loadMorePosts = async () => {
    if (!endCursor || loading) return; // Ngăn chặn việc tải nếu không có con trỏ hoặc đang tải
    setLoading(true); // Bắt đầu tải

    const { edges, pageInfo } = await getPosts({
      first: ITEM_PER_PAGE,
      after: endCursor,
    });

    setPosts((prevPosts: Post[]) => [
      ...prevPosts,
      ...edges.map((edge) => edge.node),
    ]); // Cập nhật danh sách bài viết
    setEndCursor(pageInfo.endCursor); // Cập nhật con trỏ
    setHasNextPage(pageInfo.hasNextPage); // Cập nhật trạng thái trang tiếp theo
    setLoading(false); // Kết thúc tải
  };

  return (
    <div className="w-full flex-col justify-start items-center gap-8 flex">
      <div className="self-stretch justify-start items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: Post) => (
          <div
            key={post.id}
            className="h-full p-5 bg-white rounded-[28px] shadow flex-col flex relative overflow-hidden bg-center bg-no-repeat bg-cover"
            style={{ backgroundImage: `url(${post_card_bg?.src})` }}
          >
            <div className="self-stretch h-full flex-col justify-between items-start gap-5 flex relative z-1">
              <div className="self-stretch flex-col justify-start items-start gap-3.5 flex">
                <div className="relative w-full">
                  <Image
                    width={300}
                    height={196}
                    className="w-full h-[196px] rounded-3xl object-cover"
                    src={post.featuredImage?.node?.sourceUrl ?? post_banner}
                    alt={post.featuredImage?.node?.altText ?? post.title}
                  />
                </div>
                <div className="self-stretch text-black text-xs font-normal uppercase text-ellipsis overflow-hidden line-clamp-1">
                  {formatDate(post.date)}
                </div>
                <div className="text-[#0e1b2e] text-xl font-medium text-ellipsis overflow-hidden line-clamp-2">
                  <Link href={`/news/${post.slug}`}>{post.title}</Link>
                </div>
                <div
                  className="text-[#79828f] text-base font-normal leading-tight text-ellipsis overflow-hidden line-clamp-5"
                  dangerouslySetInnerHTML={{ __html: post.excerpt ?? "" }}
                />
              </div>
              <div className="self-stretch justify-end items-center gap-[15px] flex mt-auto">
                <div className="text-[#6c3cf4] text-base font-normal leading-snug">
                  <Link href={`/news/${post.slug}`}>Read more</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Nút Load More */}
      {hasNextPage && !loading && (
        <button
          onClick={loadMorePosts}
          className="text-center text-white text-base font-medium w-[138px] h-11 pt-3 pb-[13px] bg-[#682ec3] rounded-lg justify-center items-center inline-flex"
        >
          Load more
        </button>
      )}

      {/* Hiển thị trạng thái đang tải */}
      {loading && <p>Loading...</p>}
    </div>
  );
}
