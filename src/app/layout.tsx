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

/* Inter — canonical tbrain brand face. One instance · aliased to
   both --font-body and --font-heading via CSS (no dedup waste). */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
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
  /* /samples defaults to dark, the rest of the site to the OS preference.
     Tam, 2026-09-12: "để default page màu đen nhé". Only the DEFAULT — an
     explicit choice in the toggle is stored under this key and still wins,
     which is what "default" means and why the light half of .samples-scope
     stays. Runs here rather than in the samples layout so the first paint is
     already dark; a client effect alone flashes white. */
  var p=location.pathname;
  var samples = p==='/samples' || p.indexOf('/samples/')===0;
  var dark = t==='dark' || (t==null && (samples || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)));
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
}catch(e){}})();
`;

/**
 * IAB US Privacy API (`__uspapi`), answered from the site's own consent state.
 *
 * Scanners and ad-tech read a site's CCPA opt-out through this standard call
 * rather than by reading its banner, so a site with a working opt-out but no
 * API reads as "no consent management platform" — which is what Cookiebot's
 * scan reported (2026-09-28). The string is "1" (spec version), notice given,
 * opted out of sale/sharing, LSPA not signed: opted out when the visitor
 * rejected analytics or their browser sends Global Privacy Control, the same
 * rule `getConsent` in `lib/consent.ts` applies. Defined inline so it answers
 * before any script loads.
 */
const USP_API = `
(function(){
  function usp(){
    var v=null; try{v=localStorage.getItem('tbrain-cookie-consent');}catch(e){}
    var gpc=navigator.globalPrivacyControl===true;
    var out = v==='rejected' || (v==null && gpc);
    return '1Y' + (out?'Y':'N') + 'N';
  }
  window.__uspapi=function(cmd,ver,cb){
    if(typeof cb!=='function')return;
    if(cmd==='getUSPData'&&ver===1){cb({version:1,uspString:usp()},true);}
    else{cb(null,false);}
  };
})();
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
      className={`${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <script dangerouslySetInnerHTML={{ __html: USP_API }} />
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
