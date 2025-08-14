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
  title: "App Template - Next.js Starter with Supabase Auth",
  description:
    "A modern, production-ready Next.js template with Supabase authentication, TypeScript, Tailwind CSS, and comprehensive testing.",
  keywords: [
    "nextjs",
    "typescript",
    "supabase",
    "authentication",
    "tailwind",
    "template",
    "starter",
    "react",
    "app router",
  ],
  image: "/og-image.png",
  openGraph: {
    type: "website",
    siteName: "App Template",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    site: "@your_twitter_handle",
    creator: "@your_twitter_handle",
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
    name: defaultSEO.openGraph?.siteName,
    description: defaultSEO.description,
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
    name: defaultSEO.openGraph?.siteName,
    description: defaultSEO.description,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    sameAs: [
      // Add your social media URLs here
      // 'https://twitter.com/your_handle',
      // 'https://github.com/your_username',
    ],
  };
}

export function generateWebAppSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: defaultSEO.title,
    description: defaultSEO.description,
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}
