"use client";

import {
  generateWebsiteSchema,
  generateOrganizationSchema,
  generateWebAppSchema,
} from "@/lib/seo";

interface StructuredDataProps {
  type?: "website" | "organization" | "webapp" | "all";
}

export function StructuredData({ type = "all" }: StructuredDataProps) {
  const schemas = [];

  if (type === "website" || type === "all") {
    schemas.push(generateWebsiteSchema());
  }

  if (type === "organization" || type === "all") {
    schemas.push(generateOrganizationSchema());
  }

  if (type === "webapp" || type === "all") {
    schemas.push(generateWebAppSchema());
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
