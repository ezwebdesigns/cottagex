import { notFound } from 'next/navigation';
import type { Metadata } from "next";
import StandardTemplate from '@/templates/StandardTemplate';

const staticPages: Record<string, { title: string; content: string; type: 'terms' | 'about' | 'default'; updatedDate?: string; metaDescription?: string }> = {
  terms: {
    title: 'Terms of Service & Affiliate Disclosure',
    content: '',
    type: 'terms',
    updatedDate: 'May 26, 2026',
    metaDescription: 'Read the Cottage Escape Terms of Service and Affiliate Disclosure. Learn how our VRBO and Expedia affiliate partnerships work at no extra cost to you.',
  },
};

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = staticPages[slug];
  if (!page) return { title: "Page Not Found" };
  return {
    title: page.title,
    description: page.metaDescription || `Cottage Escape - ${page.title}`,
    alternates: { canonical: `https://chaletexpress.com/${locale}/p/${slug}` },
    openGraph: {
      title: page.title,
      description: page.metaDescription || `Cottage Escape - ${page.title}`,
    },
  };
}

export default async function StandardPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug } = await params;
  const pageData = staticPages[slug];

  if (!pageData) {
    notFound();
  }

  return <StandardTemplate pageData={pageData} />;
}
