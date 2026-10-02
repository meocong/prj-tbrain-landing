import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/server/list";

export const runtime = "nodejs";

/**
 * POST { slug } — refresh the blog's ISR cache right after a publish /
 * unpublish from the admin, instead of waiting out the 300s window.
 */
export async function POST(req: NextRequest) {
  await requireAdmin("content.edit");
  const body = (await req.json().catch(() => null)) as { slug?: unknown } | null;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog/feed.xml");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ ok: true });
}
