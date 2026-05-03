import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import Analytics from "@/components/analytics/Analytics";
import { UtmCapture } from "@/components/analytics/UtmCapture";
import ChatWidget from "@/components/chat/ChatWidgetLoader";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tbrain",
    url: "/",
    title: "Tbrain — AI Training Data & Evaluation",
    description:
      "High-quality AI training data, RLHF, and evaluation services. Production-grade datasets for building better AI models.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tbrain — AI Training Data & Evaluation",
    description:
      "High-quality AI training data, RLHF, and evaluation services. Production-grade datasets for building better AI models.",
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
      availableLanguage: ["en", "vi"],
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
  var dark=t==='dark';
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
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
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
          </Suspense>
          <UtmCapture />
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
