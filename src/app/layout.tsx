import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import Analytics from "@/components/analytics/Analytics";
import Ga4 from "@/components/analytics/Ga4";
import { UtmCapture } from "@/components/analytics/UtmCapture";
import ChatWidget from "@/components/chat/ChatWidgetLoader";
import CookieConsent from "@/components/common/CookieConsent";
import "./globals.css";

/* Inter — canonical tbrain brand face. Same variable serves body + heading. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});
const interHeading = Inter({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${inter.variable} ${interHeading.variable} ${jetbrainsMono.variable}`}
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
