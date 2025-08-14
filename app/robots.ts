import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/auth/confirm",
        "/auth/error",
        "/admin/",
        "/_next/",
        "/.well-known/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
