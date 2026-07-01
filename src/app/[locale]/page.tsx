import type { Metadata } from "next";
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import ComingSoon from '@/components/ComingSoon';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Chalet Express - Coming Soon",
    description: "Canadian cottage rentals coming back soon.",
    alternates: { canonical: `https://chaletexpress.com/${locale}` },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let healthy = false;
  try {
    await db.execute(sql`SELECT 1`);
    healthy = true;
  } catch {}

  if (!healthy) {
    return <ComingSoon locale={locale} />;
  }

  const { getAllSettings } = await import('@/lib/cached-settings');
  const { articles } = await import('@/db/schema');
  const { desc, eq } = await import('drizzle-orm');
  const HeroSection = (await import('@/components/home/HeroSection')).default;
  const TrendingDestinations = (await import('@/components/home/TrendingDestinations')).default;
  const PropertyGallery = (await import('@/components/home/PropertyGallery')).default;
  const ExploreSection = (await import('@/components/home/ExploreSection')).default;
  const SearchByCity = (await import('@/components/home/SearchByCity')).default;
  const InspirationSection = (await import('@/components/home/InspirationSection')).default;
  const PartnershipPromo = (await import('@/components/home/PartnershipPromo')).default;
  const { defaultSettings } = await import('@/lib/settings-defaults');

  const [all, recentArticles] = await Promise.all([
    getAllSettings(),
    db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt)).catch(() => []),
  ]);

  const hero = all.homepage_hero ?? defaultSettings.homepage_hero;
  const destinations = all.homepage_destinations ?? defaultSettings.homepage_destinations;
  const gallery = all.homepage_gallery ?? defaultSettings.homepage_gallery;
  const search = all.homepage_search ?? defaultSettings.homepage_search;
  const inspiration = all.homepage_inspiration ?? defaultSettings.homepage_inspiration;
  const explore = all.homepage_explore ?? defaultSettings.homepage_explore;
  const cta = all.homepage_cta ?? defaultSettings.homepage_cta;

  const articlePreviews = (recentArticles as any[]).slice(0, 4).map(a => ({
    id: a.id, title: a.title, slug: a.slug, excerpt: a.excerpt || '',
    date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : '',
    readTime: `${Math.max(1, Math.ceil((a.content || '').split(/\s+/).length / 200))} min read`,
    category: a.category || 'Articles', image: a.featuredImage || '',
  }));

  return (
    <div>
      <HeroSection tag={hero.tag} title={hero.title} description={hero.description} image={hero.image} imageAlt={hero.imageAlt} />
      <TrendingDestinations locale={locale} title={destinations.title} description={destinations.description} items={destinations.items} />
      <PropertyGallery title={gallery.title} description={gallery.description} tabs={gallery.tabs} />
      <SearchByCity title={search.title} description={search.description} />
      <InspirationSection locale={locale} title={inspiration.title} description={inspiration.description} articles={articlePreviews} />
      <ExploreSection title={explore.title} description={explore.description} subtitle={explore.subtitle} items={explore.items} />
      <PartnershipPromo locale={locale} title={cta.title} description={cta.description} buttonText={cta.buttonText} buttonLink={cta.buttonLink} image={cta.image} imageAlt={cta.imageAlt} />
    </div>
  );
}