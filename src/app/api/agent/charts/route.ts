import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireAgent } from "@/lib/agent/auth";
import { zodError } from "@/lib/agent/posts";
import { chartSpec, renderChart } from "@/lib/agent/charts";
import { uploadBuffer } from "@/lib/terminal-bench/gcs";

export const runtime = "nodejs";

const input = z.object({
  filename: z.string().trim().min(1).max(80).optional(),
  spec: chartSpec,
});

/**
 * POST — render a chart or diagram from a JSON spec (bar, line, timeline,
 * flow, quadrant) and store it as SVG under cms/. The SVG is built here from
 * escaped text only, so nothing the agent sends can become markup.
 */
export async function POST(req: NextRequest) {
  const denied = requireAgent(req);
  if (denied) return denied;

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json(zodError(parsed.error), { status: 400 });

  const svg = renderChart(parsed.data.spec);
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const name = (parsed.data.filename ?? parsed.data.spec.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  const gcsObject = `cms/${now.getFullYear()}/${month}/${uuid}_chart_${name || "chart"}.svg`;
  await uploadBuffer(gcsObject, Buffer.from(svg, "utf8"), "image/svg+xml");

  return NextResponse.json(
    { url: `/api/asset/${gcsObject}`, gcsObject, alt: parsed.data.spec.title },
    { status: 201 },
  );
}
