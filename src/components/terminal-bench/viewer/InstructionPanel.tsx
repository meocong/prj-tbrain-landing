import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

export async function InstructionPanel({ markdown }: { markdown: string | null }) {
  if (!markdown) {
    return (
      <div className="container mx-auto max-w-3xl px-6 py-20 text-center text-[#78818f]">
        No instructions provided.
      </div>
    );
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeShiki, { theme: "github-light" })
    .use(rehypeStringify)
    .process(markdown);

  return (
    <div className="container mx-auto max-w-3xl px-6 py-12">
      <article
        className="prose prose-slate max-w-none prose-headings:font-medium prose-headings:text-[#0e1b2e] prose-a:text-[#6C3CF4] prose-code:rounded prose-code:bg-[#F3F4F6] prose-code:px-1 prose-code:py-0.5 prose-code:text-[#6C3CF4] prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-xl prose-pre:border prose-pre:border-[#E5E7EB] prose-pre:bg-white"
        dangerouslySetInnerHTML={{ __html: String(file) }}
      />
    </div>
  );
}
