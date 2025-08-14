import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "App Template - Next.js Starter",
    short_name: "App Template",
    description:
      "A modern, production-ready Next.js template with Supabase authentication, TypeScript, Tailwind CSS, and comprehensive testing.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["business", "productivity", "developer"],
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
  };
}
