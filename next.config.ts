import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.vrbo.com' },
      { protocol: 'https', hostname: 'images.trvl-media.com' },
      { protocol: 'https', hostname: 'vrbo.com' },
      { protocol: 'https', hostname: 'expedia.com' },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 604800,
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    deviceSizes: [640, 750, 828, 1080, 1200],
  },
};

export default nextConfig;
