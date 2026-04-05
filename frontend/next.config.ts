import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "flagsapi.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
