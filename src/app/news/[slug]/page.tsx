import { Metadata } from "next";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { getPostDetail } from "@/lib/api";
import facebook from "@/assets/images/facebook.png";
import linkedin from "@/assets/images/linkedin.png";
import twitter from "@/assets/images/twitter.png";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/utils/date_utils";

type PostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function readingTime(html: string): number {
  const words = stripHtml(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostDetail({ slug });
  if (!post) {
    return {
      title: "Article not found · Tbrain",
      description: "Full-service human resource agency for AI training experts",
    };
  }
  const description = post.excerpt ? stripHtml(post.excerpt).slice(0, 160) : undefined;
  return {
    title: `${post.title} · Tbrain`,
    description,
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post: PostDetail | null = await getPostDetail({ slug });

  if (!post) {
    return (
      <div>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#0e1b2e] mb-2">Article not found</h1>
            <Link href="/news" className="text-[#6c3cf4] font-medium">← Back to news</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const postUrl = `${process.env.NEXT_PUBLIC_HOST}news/${post.slug}`;
  const minutes = readingTime(post.content);
  const heroImage = post.featuredImage?.node?.sourceUrl;
  const heroAlt = post.featuredImage?.node?.altText ?? post.title;

  return (
    <div>
      <Header />
      <main>
        <article className="container mx-auto px-4 pt-24 relative max-w-[800px]">
          <nav className="w-full py-6 flex items-center gap-2 text-sm text-[#8b90a7]">
            <Link href="/news" className="hover:text-[#6c3cf4] transition-colors">News</Link>
            <span>/</span>
            <span className="text-[#6c3cf4] truncate">{post.title}</span>
          </nav>

          {post.categories.edges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {post.categories.edges.map((edge) => (
                <Link
                  key={edge.node.slug}
                  href={`/news?c=${edge.node.slug}`}
                  className="inline-flex items-center gap-0.5 rounded-full bg-[#6c3cf4]/10 hover:bg-[#6c3cf4]/15 text-[#6c3cf4] px-3 py-1 text-xs font-semibold tracking-wide transition-colors"
                >
                  <span className="opacity-70">#</span>
                  {edge.node.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl md:text-[44px] leading-tight font-semibold text-[#0e1b2e] tracking-tight mb-5">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#78818f] pb-6 mb-8 border-b border-[#d8e9f3]">
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium uppercase tracking-wide text-xs">{formatDate(post.date)}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{minutes} min read</span>
            </span>
          </div>

          {heroImage && (
            <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-[0_30px_80px_-30px_rgba(108,60,244,0.3)]">
              <Image
                src={heroImage}
                alt={heroAlt}
                fill
                sizes="(min-width: 800px) 800px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-[#0e1b2e] prose-headings:tracking-tight prose-p:text-[#3d4659] prose-p:leading-[1.75] prose-a:text-[#6c3cf4] prose-a:font-medium hover:prose-a:text-[#5a2fd3] prose-strong:text-[#0e1b2e] prose-img:rounded-2xl prose-img:shadow-md prose-blockquote:border-l-[#6c3cf4] prose-blockquote:text-[#5a5d71] prose-li:text-[#3d4659] prose-code:text-[#6c3cf4] prose-code:bg-[#6c3cf4]/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-12 pt-6 border-t border-[#d8e9f3] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[#5a5d71] text-sm font-medium">Share</span>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${postUrl}`}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#f4f6fb] hover:bg-[#6c3cf4]/10 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
              >
                <Image className="w-5 h-5 object-contain" src={facebook} alt="" />
              </Link>
              <Link
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}`}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#f4f6fb] hover:bg-[#6c3cf4]/10 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <Image className="w-5 h-5 object-contain" src={linkedin} alt="" />
              </Link>
              <Link
                href={`https://twitter.com/intent/tweet?url=${postUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-[#f4f6fb] hover:bg-[#6c3cf4]/10 transition-colors"
                aria-label="Share on Twitter"
              >
                <Image className="w-5 h-5 object-contain" src={twitter} alt="" />
              </Link>
            </div>

            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-[#6c3cf4] text-sm font-semibold hover:gap-3 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              All articles
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
