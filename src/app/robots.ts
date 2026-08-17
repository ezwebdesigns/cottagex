import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/en/admin/', '/fr/admin/', '/en/login', '/fr/login'],
    },
    sitemap: 'https://chaletexpress.com/sitemap.xml',
  };
}
