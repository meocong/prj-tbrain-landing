import { ImageResponse } from "next/og";
import { CAREERS, POSITIONS } from "@/lib/landing/careers";
import { OG_MUTED, OG_SIZE, OgFrame, OgRole, OgStatus, OgTitle, ogLogo, ogOptions } from "./_sections/og";

export const alt = `${CAREERS.title} — ${CAREERS.openTitle}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [options, logo] = await Promise.all([ogOptions(), ogLogo()]);
  const n = POSITIONS.length;
  return new ImageResponse(
    (
      <OgFrame logo={logo}>
        <OgTitle size={96}>{CAREERS.title}</OgTitle>
        <OgStatus>{`${n} open position${n === 1 ? "" : "s"}`}</OgStatus>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 52 }}>
          {POSITIONS.slice(0, 2).map((p, i) => (
            <OgRole key={p.slug} first={i === 0} title={p.title} meta={[p.employment, p.location, p.reportsTo].join(" · ")} />
          ))}
        </div>
        <div style={{ display: "flex", marginTop: "auto", fontSize: 22, color: OG_MUTED }}>tbrain.ai/careers</div>
      </OgFrame>
    ),
    options,
  );
}
