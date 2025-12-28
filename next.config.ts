import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "icons.duckduckgo.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["@phosphor-icons/react"],
    useCache: true,
  },
  async redirects() {
    return [
      {
        source: "/s",
        destination: "/installkit-sync.sh",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
