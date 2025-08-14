import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes = [
    "",
    "/auth/login",
    "/auth/sign-up",
    "/auth/forgot-password",
    "/protected",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : ("monthly" as const),
    priority: route === "" ? 1.0 : 0.8,
  }));
}
