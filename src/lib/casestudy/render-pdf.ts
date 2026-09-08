import "server-only";
import type { Browser } from "puppeteer-core";

/**
 * Render an HTML string to a PDF Buffer using a headless Chromium.
 *
 * Resolution order for the Chromium binary:
 *   1. PUPPETEER_EXECUTABLE_PATH env (Docker image, dev with system Chrome)
 *   2. @sparticuz/chromium (works on AWS Lambda / Vercel Functions)
 */
async function launchBrowser() {
  const explicit = process.env.PUPPETEER_EXECUTABLE_PATH;
  const puppeteer = (await import("puppeteer-core")).default;

  let executablePath: string;
  let args: string[];

  if (explicit) {
    executablePath = explicit;
    args = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"];
  } else {
    const chromium = (await import("@sparticuz/chromium")).default;
    executablePath = await chromium.executablePath();
    args = chromium.args;
  }

  return puppeteer.launch({
    args,
    executablePath,
    headless: true,
  });
}

export async function renderUrlToPdf(url: string): Promise<Buffer> {
  let browser: Browser | null = null;
  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 1800, deviceScaleFactor: 1 });
    await page.emulateMediaType("screen");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 45_000 });
    await page.addStyleTag({
      content: `
        @page { size: A4; margin: 12mm; }
        html, body { background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        header, footer, .wrap, [data-pdf-hidden="true"] { display: none !important; }
        main { padding-top: 0 !important; padding-bottom: 0 !important; background-image: none !important; }
        section, article, .case-study-widget, .case-study-body, .case-study-body > * { break-inside: avoid; page-break-inside: avoid; }
        img, svg, canvas { max-width: 100% !important; break-inside: avoid; page-break-inside: avoid; }
      `,
    });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}
