import type { Metadata } from "next";
import { DM_Sans, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import Analytics from "@/components/analytics/Analytics";
import { ChatWidget } from "@/components/chat/ChatWidget";
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Tbrain",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${dmSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>
          <Suspense fallback={null}>
            <Analytics />
          </Suspense>
          {children}
          <ChatWidget />
        </Providers>
      </body>
    </html>
  );
}
