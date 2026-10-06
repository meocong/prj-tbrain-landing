import type { NextConfig } from "next";

/**
 * Hand pose (/samples/hand-pose) is on staging for review and not on
 * production yet: the launch waits on consent for more public previews.
 *
 * Decided once, at build time, and inlined into server and client bundles
 * through `env` — the Samples menu and the chooser are client components, and
 * a flag only the server could read would hydrate a menu the client then
 * removes. Fail-closed: never on in a Vercel production build, on for every
 * Vercel preview (the `staging` branch is one), and off for Docker and local
 * builds unless SHOW_HAND_POSE=1 is set. Read it through `src/lib/samples/flags.ts`.
 */
const HAND_POSE_ON =
  process.env.VERCEL_ENV !== "production" &&
  (process.env.VERCEL_ENV === "preview" || process.env.SHOW_HAND_POSE === "1");

const nextConfig: NextConfig = {
  env: {
    HAND_POSE_ON: HAND_POSE_ON ? "1" : "",
  },
  images: {
    remotePatterns: [
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
        hostname: "landing-staging.tbrain.ai",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
    ],
  },
  async redirects() {
    if (HAND_POSE_ON) return [];
    // With hand pose off, its static media would still be served from
    // `public/` by URL guess; redirects run before the filesystem does.
    return [
      { source: "/samples/hand-pose/:path*", destination: "/samples", permanent: false },
      { source: "/samples/clips/hand-pose-:rest", destination: "/samples", permanent: false },
      { source: "/samples/posters/hand-pose-:rest", destination: "/samples", permanent: false },
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
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
