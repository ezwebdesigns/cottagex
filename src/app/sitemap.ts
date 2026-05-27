import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/routing';
import { initialArticles } from '@/lib/mock-data';

const BASE_URL = 'https://chaletexpress.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['', '/about', '/contact', '/guides', '/p/terms'];
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${BASE_URL}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'weekly' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }

    entries.push({
      url: `${BASE_URL}/${locale}/locations/ontario`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    });

    for (const article of initialArticles) {
      entries.push({
        url: `${BASE_URL}/${locale}/guides/${article.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  }

  return entries;
}
