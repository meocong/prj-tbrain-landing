import type { Metadata } from "next";
import { DM_Sans, Alumni_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import Analytics from "@/components/analytics/Analytics";
import Ga4 from "@/components/analytics/Ga4";
import { UtmCapture } from "@/components/analytics/UtmCapture";
import ChatWidget from "@/components/chat/ChatWidgetLoader";
import CookieConsent from "@/components/common/CookieConsent";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

/* Alumni Sans — high-contrast display face with weights 100→900.
   Enables Impeccable weight-inversion (hero H1 100/200, section H2 500/600)
   and adds gravitas Space Grotesk cannot match. */
const alumniSans = Alumni_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const DEFAULT_OG_IMAGE = {
  url: "/images/hero-poster.jpg",
  width: 1920,
  height: 1080,
  alt: "Tbrain — AI Training Data & Evaluation",
};

export const metadata: Metadata = {
  title: {
    default: "Tbrain — AI Training Data & Evaluation",
    template: "%s | Tbrain",
  },
  description:
    "High-quality AI training data, RLHF, and evaluation services. Production-grade datasets for building better AI models.",
  metadataBase: new URL(
    process.env.PUBLIC_BASE_URL || "https://tbrain.ai"
  ),
  alternates: { canonical: "/" },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tbrain",
    url: "/",
    title: "Tbrain — AI Training Data & Evaluation",
    description:
      "High-quality AI training data, RLHF, and evaluation services. Production-grade datasets for building better AI models.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tbrain — AI Training Data & Evaluation",
    description:
      "High-quality AI training data, RLHF, and evaluation services. Production-grade datasets for building better AI models.",
    images: [DEFAULT_OG_IMAGE.url],
  },
};

const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tbrain",
  url: process.env.PUBLIC_BASE_URL || "https://tbrain.ai",
  logo: `${process.env.PUBLIC_BASE_URL || "https://tbrain.ai"}/favicon.ico`,
  sameAs: [
    "https://www.linkedin.com/company/tbrain-ai",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "info@tbrain.ai",
      areaServed: "Worldwide",
      availableLanguage: ["en"],
    },
  ],
};

const WEBSITE_JSONLD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tbrain",
  url: process.env.PUBLIC_BASE_URL || "https://tbrain.ai",
};

const THEME_INIT = `
(function(){try{
  var key='tbrain-theme';
  var t=localStorage.getItem(key);
  var dark = t==='dark' || (t==null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      data-scroll-behavior="smooth"
      className={`${dmSans.variable} ${alumniSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSONLD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSONLD) }}
        />
        <Providers>
          <Suspense fallback={null}>
            <Analytics />
            <Ga4 />
          </Suspense>
          <UtmCapture />
          {children}
          <ChatWidget />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}
