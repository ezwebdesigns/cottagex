import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from '@/lib/db';
import { pages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import StandardTemplate from '@/templates/StandardTemplate';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string; slug: string }> };

async function fetchPage(slug: string) {
  try {
    const [page] = await db.select().from(pages).where(eq(pages.slug, slug)).limit(1);
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = await fetchPage(slug);
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.metaDescription,
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
      description: page.metaDescription,
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const pageData = await fetchPage(slug);

  if (!pageData) notFound();

  return <StandardTemplate pageData={pageData} />;
}
