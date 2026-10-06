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
    "iframe",
  ],
  allowedAttributes: {
    a: ["href", "title", "rel", "target"],
    img: ["src", "alt", "title", "width", "height"],
    th: ["colspan", "rowspan", "scope"],
    td: ["colspan", "rowspan"],
    code: ["class"],
    iframe: ["src", "width", "height", "title", "allowfullscreen", "loading", "allow", "frameborder", "referrerpolicy"],
  },
  allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
  allowedSchemes: ["https", "http", "mailto"],
  allowedSchemesByTag: { img: ["https"], iframe: ["https"] },
  allowedIframeHostnames: ["www.youtube-nocookie.com"],
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
    // Only YouTube, always via youtube-nocookie, with fixed attributes.
    iframe: (tagName, attribs): sanitizeHtml.Tag => {
      const src = youtubeEmbedUrl(attribs.src);
      if (!src) return { tagName, attribs: {} };
      return {
        tagName,
        attribs: {
          src,
          width: "640",
          height: "360",
          title: (attribs.title || "Video").slice(0, 200),
          allowfullscreen: "true",
          loading: "lazy",
          frameborder: "0",
          referrerpolicy: "strict-origin-when-cross-origin",
          allow: "accelerometer; encrypted-media; gyroscope; picture-in-picture",
        },
      };
    },
  },
  exclusiveFilter: (frame) =>
    (frame.tag === "a" && !frame.attribs.href) ||
    (frame.tag === "img" && !frame.attribs.src) ||
    (frame.tag === "iframe" && !frame.attribs.src),
};

/**
 * youtube.com/watch?v=ID, youtu.be/ID, /embed/ID or /shorts/ID (optionally
 * with t= or start=) → https://www.youtube-nocookie.com/embed/ID[?start=N].
 * Anything else → null.
 */
export function youtubeEmbedUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^(www\.|m\.)/, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/]+)/);
      if (m) id = m[2];
    }
  }
  if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
  const t = u.searchParams.get("start") ?? u.searchParams.get("t");
  const start = t && /^\d{1,6}s?$/.test(t) ? `?start=${parseInt(t, 10)}` : "";
  return `https://www.youtube-nocookie.com/embed/${id}${start}`;
}

export function sanitizePostHtml(html: string): string {
  return (
    // An iframe's children are never rendered; drop them before sanitizing.
    sanitizeHtml(html.replace(/(<iframe\b[^>]*>)[\s\S]*?<\/iframe>/gi, "$1</iframe>"), OPTIONS)
      .replace(/ target="" rel=""/g, "")
      // The editor's YouTube node parses iframes inside this wrapper.
      .replace(/<iframe [^>]*><\/iframe>/g, (m) => `<div data-youtube-video="">${m}</div>`)
      .trim()
  );
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
