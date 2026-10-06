import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { ANNOTATE_SRC, PNG_ONLY, chartSpec, renderChart, type EmbeddedImage } from "@/lib/agent/charts";
import { svgToPng } from "@/lib/agent/raster";
import { detectImageType } from "@/lib/admin/image-type";
import { downloadBuffer, uploadBuffer } from "@/lib/terminal-bench/gcs";

export const runtime = "nodejs";

const input = z.object({
  filename: z.string().trim().min(1).max(80).optional(),
  spec: chartSpec,
});

/**
 * POST — render a chart, diagram, cover card or annotated figure from a JSON
 * spec. The SVG is built here from escaped text only, so nothing the agent
 * sends can become markup; annotate embeds only an image we already host.
 * Returns the SVG url (inline use) and a PNG (covers, OG, social).
 */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });
  const spec = parsed.data.spec;

  let img: EmbeddedImage | undefined;
  if (spec.type === "annotate") {
    const objectPath = spec.image_url.replace(/^\/api\/asset\//, "");
    if (!ANNOTATE_SRC.test(spec.image_url) || objectPath.includes("..")) {
      return NextResponse.json({ error: "bad_image_url" }, { status: 400 });
    }
    let buf: Buffer;
    try {
      buf = await downloadBuffer(objectPath);
    } catch {
      return NextResponse.json({ error: "image_not_found" }, { status: 404 });
    }
    if (buf.length > 8 * 1024 * 1024) return NextResponse.json({ error: "image_too_large" }, { status: 413 });
    const type = detectImageType(buf);
    if (!type || type === "image/gif") return NextResponse.json({ error: "not_a_still_image" }, { status: 400 });
    // Normalise to PNG ≤ 2000px wide; resvg reads PNG/JPEG data URIs.
    const png = await sharp(buf).resize({ width: 2000, withoutEnlargement: true }).png().toBuffer();
    const meta = await sharp(png).metadata();
    if (!meta.width || !meta.height) return NextResponse.json({ error: "not_a_still_image" }, { status: 400 });
    img = { dataUri: `data:image/png;base64,${png.toString("base64")}`, width: meta.width, height: meta.height };
  }

  const svg = renderChart(spec, img);
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const name = (parsed.data.filename ?? ("title" in spec && spec.title ? spec.title : spec.type))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const base = `cms/${now.getFullYear()}/${month}/${uuid}_${spec.type === "cover" ? "cover" : "chart"}_${name || "chart"}`;

  const png = svgToPng(svg, spec.type === "cover" ? 1200 : 2400);
  await uploadBuffer(`${base}.png`, png, "image/png");
  const pngUrl = `/api/asset/${base}.png`;
  let svgUrl: string | null = null;
  if (!PNG_ONLY.has(spec.type)) {
    await uploadBuffer(`${base}.svg`, Buffer.from(svg, "utf8"), "image/svg+xml");
    svgUrl = `/api/asset/${base}.svg`;
  }

  return NextResponse.json(
    {
      url: svgUrl ?? pngUrl,
      png_url: pngUrl,
      alt: "title" in spec && spec.title ? spec.title : "Annotated figure",
    },
    { status: 201 },
  );
}
