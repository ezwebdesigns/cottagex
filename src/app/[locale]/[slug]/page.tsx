import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { getCached } from '@/lib/cache';
import { auth } from '@/lib/auth';
import StandardTemplate from '@/templates/StandardTemplate';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

async function canPreview(searchParams?: { [key: string]: string | string[] | undefined }): Promise<boolean> {
  if (searchParams?.preview !== '1') return false;
  try {
    const session = await auth();
    return !!session?.user;
  } catch {
    return false;
  }
}

async function fetchPage(slug: string, locale: string, preview = false) {
  try {
    // Métadonnées seulement (sans le contenu, jusqu'à 4 Mo) : le cache
    // Redis stocke ce qui est petit ; le corps est lu en base à la volée.
    const metaRows = await getCached<any[]>(`pages:meta:${locale}:${slug}${preview ? ':preview' : ''}`, () =>
      db.select({
        slug: pages.slug,
        title: pages.title,
        seoTitle: pages.seoTitle,
        metaDescription: pages.metaDescription,
        faq: pages.faq,
        type: pages.template,
        locale: pages.locale,
        isPublished: pages.isPublished,
        updatedAt: pages.updatedAt,
        locationData: pages.locationData,
      }).from(pages).where(
        and(
          eq(pages.slug, slug),
          ...(preview ? [] : [eq(pages.isPublished, true)]),
          inArray(pages.locale, locale === 'fr' ? ['fr', 'en'] : ['en']),
        ),
      ).limit(2),
    preview ? 60 : 86400);
    const [page] = [metaRows.find((r: any) => r.locale === locale) || metaRows.find((r: any) => r.locale === 'en')];
    if (!page || !page.isPublished) return null;

    const content = await getPageContent(slug, locale === 'fr' ? ['fr', 'en'] : ['en'], preview);

    return {
      title: page.title,
      content: content || "",
      type: (page.type === 'about' || page.type === 'terms' || page.type === 'default') ? page.type : 'default',
      updatedDate: page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined,
      metaDescription: page.metaDescription || undefined,
      faq: (page.faq as { question: string; answer: string }[]) || [],
    };
  } catch (e) {
    console.error("Failed to fetch page:", e);
    return null;
  }
}

// Contenu lu en base directement (pas de cache Redis : pas de blobs volumineux).
async function getPageContent(slug: string, locales: string[], preview = false) {
  try {
    const rows = await db.select({ content: pages.content, isPublished: pages.isPublished }).from(pages).where(
      and(
        eq(pages.slug, slug),
        ...(preview ? [] : [eq(pages.isPublished, true)]),
        inArray(pages.locale, locales),
      ),
    ).limit(1);
    const row = rows[0];
    if (!row) return null;
    if (preview && !row.isPublished) return null;
    return row.content;
  } catch (e) {
    console.error("Failed to fetch page content:", e);
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: Props & {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const preview = await canPreview(await searchParams);
  const page = await fetchPage(slug, locale, preview);
  // NOTE: no notFound() call here — with loading.tsx in the tree, Next 16
  // streams HTTP 200 anyway (vercel/next.js#93008). This robots tag is what
  // keeps missing slugs out of Google; the page below calls notFound() for UI.
  if (!page) return { title: "Page Not Found", robots: { index: false, follow: false } };
  const description = page.metaDescription
    || `${page.title} — Practical resources and guides from Chalet Express.`;
  return {
    title: page.title,
    description,
    ...(preview ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: `https://chaletexpress.com/${locale}/${slug}`,
      languages: {
        en: `https://chaletexpress.com/en/${slug}`,
        fr: `https://chaletexpress.com/fr/${slug}`,
        "x-default": `https://chaletexpress.com/en/${slug}`,
      },
    },
    openGraph: {
      title: page.title,
      description,
    },
  };
}

export default async function DynamicPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale, slug } = await params;
  const preview = await canPreview(await searchParams);
  const pageData = await fetchPage(slug, locale, preview);

  if (!pageData) notFound();

  return <StandardTemplate pageData={pageData} />;
}
