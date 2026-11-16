import type { Metadata } from "next";
import StandardTemplate from '@/templates/StandardTemplate';
import { seoFor } from '@/lib/seo-meta';
import { getCached } from '@/lib/cache';
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = seoFor('about', locale);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://chaletexpress.com/${locale}/about`,
      languages: {
        en: `https://chaletexpress.com/en/about`,
        fr: `https://chaletexpress.com/fr/about`,
        "x-default": `https://chaletexpress.com/en/about`,
      },
    },
    openGraph: {
      title: "About Chalet Express",
      description: meta.description,
      images: [{ url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200", width: 1200, height: 630 }],
    },
  };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  // Prefer a CMS-managed 'about' page row (locale-aware, EN fallback);
  // fall back to the hardcoded content when the DB has none.
  const pageData = null;
  try {
    const metaRows = await getCached<any[]>(`pages:meta:${locale}:about`, () =>
      db.select({ title: pages.title, seoTitle: pages.seoTitle, metaDescription: pages.metaDescription, faq: pages.faq, isPublished: pages.isPublished }).from(pages).where(
        and(
          eq(pages.slug, 'about'),
          eq(pages.isPublished, true),
          inArray(pages.locale, locale === 'fr' ? ['fr', 'en'] : ['en']),
        ),
      ).limit(2), 86400);
    const meta = metaRows.find((r: any) => r.locale === locale) || metaRows.find((r: any) => r.locale === 'en') || [];
    if (!meta || !meta.isPublished) return null;

    // Contenu lu en base à la volée (pas de cache Redis : pas de blob 4 Mo).
    const contentRows = await db.select({ content: pages.content, isPublished: pages.isPublished }).from(pages).where(
      and(
        eq(pages.slug, 'about'),
        eq(pages.isPublished, true),
        inArray(pages.locale, locale === 'fr' ? ['fr', 'en'] : ['en']),
      ),
    ).limit(1);
    const content = contentRows[0]?.content || '';
    if ((content || '').trim().length === 0) return null;

    return {
      title: meta.title || 'About Chalet Express',
      content,
      type: 'about' as const,
    };
  } catch {}
  return (
    <StandardTemplate
      pageData={pageData || {
        title: 'About Chalet Express',
        content: '',
        type: 'about',
      }}
    />
  );
}
