import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.imgur.com', // ✅ allow all HTTPS hosts
      },
    ],
  }
};

export default nextConfig;
