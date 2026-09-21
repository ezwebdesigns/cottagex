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
    // Cached 5 min, shared between generateMetadata and the page.
    // Locale-preferred row with EN fallback. Preview uses its own
    // short-TTL key so drafts never leak into the public cache.
    const rows = await getCached<any[]>(`pages:by-slug:${locale}:${slug}${preview ? ':preview' : ''}`, () =>
      db.select().from(pages).where(
        and(
          eq(pages.slug, slug),
          ...(preview ? [] : [eq(pages.isPublished, true)]),
          inArray(pages.locale, locale === 'fr' ? ['fr', 'en'] : ['en']),
        ),
      ).limit(2),
    preview ? 60 : 300);
    const [page] = [rows.find((r: any) => r.locale === locale) || rows.find((r: any) => r.locale === 'en')];
    if (!page || !page.isPublished) return null;

    return {
      title: page.title,
      content: page.content || "",
      type: "default" as const,
      updatedDate: page.updatedAt ? new Date(page.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined,
      metaDescription: page.metaDescription || undefined,
      faq: (page.faq as { question: string; answer: string }[]) || [],
    };
  } catch (e) {
    console.error("Failed to fetch page:", e);
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
