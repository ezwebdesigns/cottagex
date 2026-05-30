import type { Metadata } from "next";
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { initialArticles } from '@/lib/mock-data';
import GuidesList from '@/components/guides/GuidesList';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Cottage & Cabin Rental Guides - The Escape Magazine",
    description: "Expert travel guides, packing lists, and local recommendations for Canadian cottage rentals. Discover Muskoka, Mont-Tremblant, Banff and more.",
    alternates: { canonical: `https://chaletexpress.com/${locale}/guides` },
    openGraph: {
      title: "The Escape Magazine - Cottage & Cabin Guides",
      description: "Expert travel guides for Canadian cottage rentals.",
      images: [{ url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1200", width: 1200, height: 630 }],
    },
  };
}

export default async function GuidesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr || '1', 10) || 1);
  const perPage = 9;

  let dbArticles: any[] = [];
  try {
    dbArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
  } catch (e) {
    console.error('Failed to fetch articles:', e);
  }

  const combined = [
    ...dbArticles.map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || '',
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : '',
      readTime: `${Math.max(1, Math.ceil((a.content || '').split(/\s+/).length / 200))} min read`,
      category: a.category || 'Articles',
      image: a.featuredImage || '',
    })),
    ...initialArticles,
  ];

  const total = combined.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const paged = combined.slice(start, start + perPage);

  return <GuidesList locale={locale} articles={paged} page={page} totalPages={totalPages} />;
}
