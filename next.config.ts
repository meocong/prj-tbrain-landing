import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "tbrain.ai",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  async redirects() {
    return [
      // Legacy hardcoded case-study URLs → CMS-driven slugs.
      { source: "/casestudy/details/manufacturing", destination: "/casestudy/manufacturing", permanent: true },
      { source: "/casestudy/details/scalable", destination: "/casestudy/scalable-multimodal", permanent: true },
      { source: "/casestudy/details/agent", destination: "/casestudy/agent-evaluation", permanent: true },
      // /services merged into /about (5/7/26 — tester request to drop duplication).
      // Anchor preserves SEO landing for users hitting an old "Services" link.
      { source: "/services", destination: "/about#services", permanent: true },
      // /services#services and /services#domains preserved as anchors on the merged page.
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
