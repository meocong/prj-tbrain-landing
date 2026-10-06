import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";

// SVG → PNG for agent charts. Fonts are bundled (Inter, OFL) and system fonts
// are off, so a chart renders identically on a laptop and on Vercel.
const FONT_DIR = join(process.cwd(), "src/assets/fonts");
const FONT_FILES = ["Inter-Regular.ttf", "Inter-SemiBold.ttf", "Inter-Bold.ttf"].map((f) => join(FONT_DIR, f));

export function svgToPng(svg: string, width: number): Buffer {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: "Inter" },
    // Embedded images must be data: URIs we built ourselves; never fetch.
    imageRendering: 0,
  });
  return Buffer.from(resvg.render().asPng());
}
