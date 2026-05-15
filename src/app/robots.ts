import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/data/*/api/",
          "/data/*/s/",
          "/data/terminal-bench/s/",
          "/data/terminal-bench/enter",
          "/data/terminal-bench/viewer/",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
