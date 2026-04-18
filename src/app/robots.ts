import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.PUBLIC_BASE_URL || "https://tbrain.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/data/*/api/", "/data/*/s/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
