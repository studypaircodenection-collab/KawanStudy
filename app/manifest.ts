import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "kawanstudy - Peer Study & Tutoring",
    short_name: "kawanstudy",
    description:
      "A peer-to-peer campus study site for students to find tutors, study with others, and earn points, badges, and leaderboard ranks.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0055ff",
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
    categories: ["education", "social", "productivity", "gamification"],
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
  };
}
