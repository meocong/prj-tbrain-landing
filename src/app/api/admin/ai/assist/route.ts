import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/server/list";
import { completeText } from "@/lib/ai/complete";
import { TBRAIN_EDITOR_SYSTEM } from "@/lib/ai/brand-voice";
import { checkRateLimit } from "@/lib/rate-limit";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";
export const maxDuration = 60;

const input = z.object({
  action: z.enum(["rewrite", "shorten", "expand", "fix", "seo"]),
  text: z.string().trim().min(1).max(20_000),
  title: z.string().max(300).optional(),
  instruction: z.string().max(500).optional(),
});

const EDIT_PROMPTS: Record<string, string> = {
  rewrite: "Rewrite the passage in Tbrain's voice: clearer, tighter, more concrete. Same meaning, similar length.",
  shorten: "Cut the passage to roughly half its length. Keep the key claim, facts and links.",
  expand:
    "Expand the passage with more explanation or a concrete example, using only facts already present or common technical knowledge. Do not add statistics, names or sources that are not in the text. About 1.5-2x length.",
  fix: "Fix grammar, spelling, punctuation and awkward phrasing only. Change as little as possible.",
};

/**
 * POST — in-editor AI help for admins: rewrite/shorten/expand/fix a selected
 * passage, or propose SEO fields for the whole post.
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin("content.edit");
  const limit = checkRateLimit(`ai-assist:${admin.id}`, { maxRequests: 30, windowSeconds: 300 });
  if (!limit.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  const { action, text, title, instruction } = parsed.data;

  try {
    if (action === "seo") {
      const raw = await completeText({
        system: TBRAIN_EDITOR_SYSTEM,
        maxTokens: 800,
        prompt: `Propose SEO metadata for this blog post. Reply with ONLY a JSON object, no prose, no code fence:
{"seo_title": "50-60 characters, primary keyword near the front", "seo_description": "120-155 characters promising a concrete takeaway", "excerpt": "1-2 sentences for the blog index", "tags": ["3-6 lowercase tags"], "slug": "short-keyword-slug"}

Title: ${title ?? "(none)"}

Post:
${text.slice(0, 12_000)}`,
      });
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      const data = z
        .object({
          seo_title: z.string(),
          seo_description: z.string(),
          excerpt: z.string(),
          tags: z.array(z.string()).max(12),
          slug: z.string(),
        })
        .parse(JSON.parse(json));
      return NextResponse.json({
        seo: {
          seo_title: data.seo_title.slice(0, 60),
          seo_description: data.seo_description.slice(0, 160),
          excerpt: data.excerpt.slice(0, 400),
          tags: data.tags.map((t) => t.toLowerCase().trim()).filter(Boolean).slice(0, 6),
          slug: slugify(data.slug || title || ""),
        },
      });
    }

    const result = await completeText({
      system: TBRAIN_EDITOR_SYSTEM,
      maxTokens: action === "expand" ? 2000 : 1500,
      prompt: `${EDIT_PROMPTS[action]}${instruction ? `\nExtra instruction from the editor: ${instruction}` : ""}

Reply with ONLY the revised passage as plain text (blank line between paragraphs), no preamble, no quotes, no markdown.

Passage:
${text}`,
    });
    return NextResponse.json({ text: result.replace(/^```[a-z]*\n?|```$/g, "").trim() });
  } catch (err) {
    console.error("[ai-assist]", String(err).slice(0, 300));
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}
