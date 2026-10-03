import sanitizeHtml from "sanitize-html";

/**
 * The public blog renders content_html with dangerouslySetInnerHTML, so
 * anything the agent writes is reduced to a small editorial tag set first.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "br", "hr",
    "ul", "ol", "li",
    "strong", "em", "b", "i", "u", "s", "sub", "sup", "mark",
    "a", "img", "figure", "figcaption",
    "blockquote", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "title", "width", "height"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    code: ["class"],
  },
  allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
  allowedSchemes: ["https", "http", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  // h1 belongs to the page title; demote any the model emits.
  transformTags: {
    h1: "h2",
    a: (tagName, attribs) => {
      const href = attribs.href ?? "";
      const external = /^https?:\/\//i.test(href) && !/^https?:\/\/(www\.)?tbrain\.ai(\/|$)/i.test(href);
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : { ...attribs, target: "", rel: "" },
      };
    },
    img: (tagName, attribs) => {
      const src = sanitizeImageUrl(attribs.src);
      return { tagName, attribs: src ? { ...attribs, src } : {} };
    },
  },
  exclusiveFilter: (frame) =>
    (frame.tag === "a" && !frame.attribs.href) || (frame.tag === "img" && !frame.attribs.src),
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, OPTIONS)
    .replace(/ target="" rel=""/g, "")
    .trim();
}

/** Site-relative image paths (/images/..., /samples/posters/..., /api/asset/cms/...) are allowed too. */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.trim();
  if (/^\/(images|samples\/posters|api\/asset\/cms)\/[\w./-]+$/.test(u) && !u.includes("..")) return u;
  if (/^https:\/\/[\w.-]+\/\S+$/.test(u)) return u;
  return null;
}

/**
 * Plain-text body for content_md: the blog computes reading time from it.
 * The public page falls back to rendering content_md as HTML when
 * content_html is empty, so this must never contain markup: entities are
 * left encoded and any angle bracket is dropped.
 */
export function htmlToPlainText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&nbsp;/g, " ")
    .replace(/&(lt|gt);/g, " ")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export { slugify } from "@/lib/slugify";
