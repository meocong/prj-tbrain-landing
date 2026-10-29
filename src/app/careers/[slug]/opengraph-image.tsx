import { ImageResponse } from "next/og";
import { POSITIONS, positionBySlug } from "@/lib/landing/careers";
import { OG_INK, OG_MUTED, OG_SIZE, OgChips, OgFrame, OgStatus, OgTitle, ogLogo, ogOptions } from "../_sections/og";

export const alt = "Tbrain job posting";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return POSITIONS.map((p) => ({ slug: p.slug }));
}

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const p = positionBySlug((await params).slug);
  if (!p) return new Response("Not found", { status: 404 });
  const [options, logo] = await Promise.all([ogOptions(), ogLogo()]);
  return new ImageResponse(
    (
      <OgFrame logo={logo}>
        <OgTitle size={68}>{p.title}</OgTitle>
        <OgStatus>Open position</OgStatus>
        <div style={{ display: "flex", marginTop: 52, borderTop: `3px solid ${OG_INK}`, paddingTop: 24 }}>
          <OgChips items={[p.employment, p.location, p.reportsTo]} />
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: OG_MUTED }}>{`tbrain.ai/careers/${p.slug}`}</div>
      </OgFrame>
    ),
    options,
  );
}
