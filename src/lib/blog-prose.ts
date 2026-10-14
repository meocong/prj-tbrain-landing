/** Typography for blog bodies — shared by the public post page and the admin preview. */
export const BLOG_PROSE_CLASS =
  "prose prose-lg mt-12 max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-[20px] prose-h3:mt-8 prose-p:text-[18px] prose-p:leading-[1.8] prose-p:text-[#374151] prose-li:text-[18px] prose-li:leading-[1.8] prose-a:text-[#6C3CF4] prose-img:rounded-xl prose-img:my-8 prose-blockquote:border-l-[#6C3CF4] prose-blockquote:text-[#6b7280] prose-blockquote:italic " +
  // "Key takeaways" box: the first blockquote becomes a styled callout only when it
  // wraps a list (plain pull-quotes keep the default italic/border-left treatment).
  "[&_blockquote:has(ul)]:not-italic [&_blockquote:has(ul)]:border-l-0 [&_blockquote:has(ul)]:rounded-2xl [&_blockquote:has(ul)]:bg-[#F3EEFD] [&_blockquote:has(ul)]:px-6 [&_blockquote:has(ul)]:py-5 [&_blockquote:has(ul)]:text-[#4C2A99] [&_blockquote:has(ul)_p]:mt-0 [&_blockquote:has(ul)_ul]:mt-2 [&_blockquote:has(ul)_ul]:mb-0 " +
  // Image captions: a paragraph that is only an <em>, right after an <img>, reads as
  // a small centered caption instead of body copy.
  "[&_img+p:has(>em:only-child)]:mt-3! [&_img+p:has(>em:only-child)]:text-center [&_img+p:has(>em:only-child)]:text-sm! [&_img+p:has(>em:only-child)]:text-[#6b7280]! [&_img+p:has(>em:only-child)]:leading-snug " +
  // Embedded videos (YouTube, nocookie): full width 16:9; a caption after one is styled like an image caption.
  "[&_[data-youtube-video]]:my-8 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:h-auto [&_iframe]:rounded-xl [&_iframe]:bg-black " +
  "[&_[data-youtube-video]+p:has(>em:only-child)]:mt-3! [&_[data-youtube-video]+p:has(>em:only-child)]:text-center [&_[data-youtube-video]+p:has(>em:only-child)]:text-sm! [&_[data-youtube-video]+p:has(>em:only-child)]:text-[#6b7280]! " +
  // Tables: bordered cells, shaded header, horizontal scroll on narrow screens.
  "[&_table]:block [&_table]:w-max [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:border-collapse [&_th]:border [&_th]:border-[#e5e7eb] [&_th]:bg-[#F3EEFD] [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#0e1b2e] [&_td]:border [&_td]:border-[#e5e7eb] [&_td]:px-4 [&_td]:py-2";
