"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense, useEffect } from "react";
import Aos from "aos";
import Analytics from "@/components/analytics/Analytics";
import Script from "next/script";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    Aos.init({
      duration: 1000,
      offset: 0,
    });
  }, []);

  return (
    <html suppressHydrationWarning={true} lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div></div>}>
          <Analytics />
          <Script
            src="https://tbrain.arcanic.ai/embed.js"
            data-chat-service="TbrainAI"
            data-url="https://tbrain.arcanic.ai/"
            data-chat-width="450px"
            data-chat-height="600px"
          />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
