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
import Image from "next/image";
import Link from "next/link";
// import post_banner from "@/assets/images/post_banner.png";
// import post_card_bg from "@/assets/images/post_card_bg.png";
import { formatDate } from "@/utils/date_utils";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post: PostDetail | null = await getPostDetail({ slug });

  if (!post) {
    return <div>Post not found</div>;
  }
  metadata.title = post.title;
  const relPosts: Post[] = [];
  const postUrl = `${process.env.NEXT_PUBLIC_HOST}news/${post.slug}`;

  return (
    <div>
      <Header />
      <main>
        <section
          id="home"
          className="container mx-auto px-3 pt-24 relative max-w-[1128px]"
        >
          <div className="w-full h-[75px] justify-center items-center gap-[11px] flex">
            <div className="text-[#8b90a7] text-base font-medium leading-snug">
              <Link href="/news">News</Link>
            </div>
            <div className="text-[#8b90a7] text-base font-medium leading-snug">
              /
            </div>
            <div className="text-[#6c3cf4] text-base font-medium leading-snug">
              {post.title}
            </div>
          </div>
          <div className="w-full flex-col justify-start items-start gap-2.5 flex mb-[24px]">
            <div className="w-full text-center text-[#0e1b2e] text-4xl lg:text-[42px] font-normal ">
              {post.title}
            </div>
            <div className="self-stretch text-[#78818f] text-base font-medium pb-[24px] border-b border-b-[#d8e9f3]">
              {formatDate(post.date)}
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="justify-start items-center gap-2 flex mt-[48px] mb-[12px]">
            <div className="text-[#5a5d71] text-base font-medium leading-snug">
              Categories:
            </div>
            <div>
              {post.categories.edges.map((edge, index) => {
                return (
                  <span key={edge.node.name}>
                    <Link
                      href={`/news?c=${edge.node.slug}`}
                      className="text-[#6c3cf4] text-base font-medium leading-snug"
                    >
                      {edge.node.name}
                    </Link>
                    {index < post.categories.edges.length - 1 && ", "}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="w-full h-[50px] flex-col justify-start items-start gap-[26px] flex border-b border-b-[#d8e9f3]">
            <div className="justify-start items-center gap-2 flex">
              <div className="text-[#5a5d71] text-base font-medium leading-snug">
                Share:
              </div>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
                className="w-6 h-6 relative"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="w-full h-full object-cover"
                  src={facebook}
                  alt=""
                />
              </Link>
              <Link
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}`}
                className="w-6 h-6 relative"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  className="w-full h-full object-cover"
                  src={linkedin}
                  alt=""
                />
              </Link>
              <Link
                href={`https://twitter.com/intent/tweet?url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 relative"
              >
                <Image
                  className="w-full h-full object-cover"
                  src={twitter}
                  alt=""
                />
              </Link>
            </div>
          </div>
          {/* <div className="w-full mt-[48px]"> */}
          {/* <div className="w-full flex justify-between items-center mb-[24px]">
              <div className="text-[#222222] text-2xl font-semibold">
                Related news
              </div>
              <div className="text-[#6c3cf4] text-sm font-normal">
                <Link href="/news">Read all</Link>
              </div>
            </div> */}
          {/* <div className="w-full flex-col justify-start items-center gap-8 flex">
              <div className="self-stretch justify-start items-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relPosts.map((post) => (
                  <div
                    key={post.id}
                    className="h-full p-5 bg-white rounded-[28px] shadow flex-col flex relative overflow-hidden bg-center bg-no-repeat bg-cover"
                    style={{ backgroundImage: `url(${post_card_bg?.src})` }}
                  >
                    <div className="self-stretch h-full flex-col justify-between items-start gap-5 flex relative z-1">
                      <div className="self-stretch flex-col justify-start items-start gap-3.5 flex">
                        <div className="relative w-full">
                          <Image
                            className="w-full h-[196px] rounded-3xl object-cover"
                            src={post_banner}
                            alt=""
                          />
                        </div>
                        <div className="self-stretch text-black text-xs font-normal uppercase text-ellipsis overflow-hidden line-clamp-1">
                          02 January 2020
                        </div>
                        <div className="text-[#0e1b2e] text-xl font-medium text-ellipsis overflow-hidden line-clamp-2">
                          <Link href={`/news/${post.slug}`}>{post.title}</Link>
                        </div>
                        <div
                          dangerouslySetInnerHTML={{ __html: post.excerpt }}
                          className="text-[#79828f] text-base font-normal leading-tight text-ellipsis overflow-hidden line-clamp-5"
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
            </div> */}
          {/* </div> */}
        </section>
      </main>
      <Footer />
    </div>
  );
}
