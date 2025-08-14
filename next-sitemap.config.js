module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  generateRobotsTxt: true,
  exclude: [
    "/api/*",
    "/auth/confirm",
    "/auth/error",
    "/admin/*",
    "/_next/*",
    "/.well-known/*",
  ],
  additionalPaths: async (config) => [
    await config.transform(config, "/"),
    await config.transform(config, "/auth/login"),
    await config.transform(config, "/auth/sign-up"),
    await config.transform(config, "/auth/forgot-password"),
  ],
  robotsTxtOptions: {
    policies: [
      {
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
    ],
  },
};
