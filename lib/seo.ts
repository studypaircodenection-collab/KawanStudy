import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  openGraph?: {
    type?: "website" | "article" | "profile";
    siteName?: string;
    locale?: string;
  };
  twitter?: {
    card?: "summary" | "summary_large_image" | "app" | "player";
    site?: string;
    creator?: string;
  };
}

export const defaultSEO: SEOConfig = {
  title: "kawanstudy - Find Study Partners, Tutors & Level Up Your Learning",
  description:
    "A peer-to-peer campus study site for students to find tutors, study with others, and earn points, badges, and leaderboard ranks. Gamify your learning experience!",
  keywords: [
    "study",
    "campus",
    "peer-to-peer",
    "tutoring",
    "students",
    "leaderboard",
    "badges",
    "points",
    "gamification",
    "education",
    "social learning",
    "kawanstudy",
  ],
  image: "/og-image.png",
  openGraph: {
    type: "website",
    siteName: "kawanstudy",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@kawanstudy", // Update to your actual Twitter handle
    creator: "@kawanstudy", // Update to your actual Twitter handle
  },
};

export function generateMetadata(config: Partial<SEOConfig> = {}): Metadata {
  const seo = { ...defaultSEO, ...config };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const fullImageUrl = seo.image?.startsWith("http")
    ? seo.image
    : `${baseUrl}${seo.image}`;

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords?.join(", "),
    robots: seo.noIndex ? "noindex,nofollow" : "index,follow",

    openGraph: {
      title: seo.title,
      description: seo.description,
      type: seo.openGraph?.type || "website",
      siteName: seo.openGraph?.siteName || defaultSEO.openGraph?.siteName,
      locale: seo.openGraph?.locale || defaultSEO.openGraph?.locale,
      images: fullImageUrl
        ? [
            {
              url: fullImageUrl,
              width: 1200,
              height: 630,
              alt: seo.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: seo.twitter?.card || defaultSEO.twitter?.card,
      site: seo.twitter?.site || defaultSEO.twitter?.site,
      creator: seo.twitter?.creator || defaultSEO.twitter?.creator,
      title: seo.title,
      description: seo.description,
      images: fullImageUrl ? [fullImageUrl] : undefined,
    },

    alternates: {
      canonical: seo.canonical ? `${baseUrl}${seo.canonical}` : undefined,
    },

    other: {
      "theme-color": "#000000",
      "color-scheme": "light dark",
    },
  };
}

// Structured data helpers
export function generateWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "kawanstudy",
    description:
      "A peer-to-peer campus study site for students to find tutors, study with others, and earn points, badges, and leaderboard ranks.",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "kawanstudy",
    description:
      "A peer-to-peer campus study site for students to find tutors, study with others, and earn points, badges, and leaderboard ranks.",
    url: baseUrl,
    logo: `${baseUrl}/icon-192.png`,
    sameAs: [
      "https://twitter.com/kawanstudy", // Update to your actual social URLs
      "https://github.com/kawanstudy",
    ],
  };
}

export function generateWebAppSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "kawanstudy",
    description:
      "A peer-to-peer campus study site for students to find tutors, study with others, and earn points, badges, and leaderboard ranks.",
    url: baseUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
