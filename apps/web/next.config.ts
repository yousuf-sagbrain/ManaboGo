import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/index.ts");

const nextConfig: NextConfig = {
  // Transpile the shared package from the monorepo
  transpilePackages: ["@manabogo/shared"],

  // Image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "assets.manabogo.app" },
      { protocol: "https", hostname: "*.cloudflare.com" },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  experimental: {
    // React 19 server components
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default withNextIntl(nextConfig);
