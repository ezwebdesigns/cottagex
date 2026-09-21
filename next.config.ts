import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactCompiler: false,
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/fr/apple-icon',
        destination: '/apple-touch-icon.png',
      },
      {
        source: '/en/apple-icon',
        destination: '/apple-touch-icon.png',
      },
    ];
  },
  async redirects() {
    return [
      // Canonical domain = apex: consolidate www → apex permanently.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.chaletexpress.com' }],
        destination: 'https://chaletexpress.com/:path*',
        permanent: true,
      },
      {
        source: '/:locale/locations/:slug',
        destination: '/:locale/cottage-country/:slug',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'media.vrbo.com' },
      { protocol: 'https', hostname: 'images.trvl-media.com' },
      { protocol: 'https', hostname: 'vrbo.com' },
      { protocol: 'https', hostname: 'expedia.com' },
      { protocol: 'https', hostname: 'vlnh9d6siarbizgq.public.blob.vercel-storage.com' },
      { protocol: 'https', hostname: 'qteoayvaigrmbryq.private.blob.vercel-storage.com' },
      // Legacy catalogue thumbnails still reference this host (400s otherwise).
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
    imageSizes: [64, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200, 1536],
  },
};

export default withNextIntl(nextConfig);