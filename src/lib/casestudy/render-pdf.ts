import "server-only";
import type { Browser } from "puppeteer-core";

/**
 * Render an HTML string to a PDF Buffer using a headless Chromium.
 *
 * Resolution order for the Chromium binary:
 *   1. PUPPETEER_EXECUTABLE_PATH env (Docker image, dev with system Chrome)
 *   2. @sparticuz/chromium (works on AWS Lambda / Vercel Functions)
 */
export async function renderHtmlToPdf(html: string): Promise<Buffer> {
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

  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      args,
      executablePath,
      headless: true,
    });
    const page = await browser.newPage();
    await page.emulateMediaType("print");
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 });
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
