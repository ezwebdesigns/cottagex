import type { Metadata } from "next";
import { db } from '@/lib/db';
import { articles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getSettings } from '@/lib/cached-settings';
import HeroSection from '@/components/home/HeroSection';
import TrendingDestinations from '@/components/home/TrendingDestinations';
import PropertyGallery from '@/components/home/PropertyGallery';
import ExploreSection from '@/components/home/ExploreSection';
import SearchByCity from '@/components/home/SearchByCity';
import InspirationSection from '@/components/home/InspirationSection';
import PartnershipPromo from '@/components/home/PartnershipPromo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Canadian Cottage Rentals - Find Your Perfect Escape",
    description: "Discover premium lake houses, mountain lodges, and wilderness cabins across Canada. Curated cottage rentals with secure VRBO booking.",
    alternates: { canonical: `https://chaletexpress.com/${locale}` },
    openGraph: {
      title: "Canadian Cottage Rentals - Chalet Express",
      description: "Discover premium lake houses, mountain lodges, and wilderness cabins across Canada.",
      images: [{ url: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200", width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [hero, destinations, gallery, search, inspiration, explore, cta] = await Promise.all([
    getSettings('homepage_hero'),
    getSettings('homepage_destinations'),
    getSettings('homepage_gallery'),
    getSettings('homepage_search'),
    getSettings('homepage_inspiration'),
    getSettings('homepage_explore'),
    getSettings('homepage_cta'),
  ]);

  let recentArticles: any[] = [];
  try {
    recentArticles = await db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
  } catch (e) {
    console.error('Failed to fetch articles:', e);
  }

  const articlePreviews = recentArticles.slice(0, 4).map(a => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt || '',
    date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : '',
    readTime: `${Math.max(1, Math.ceil((a.content || '').split(/\s+/).length / 200))} min read`,
    category: a.category || 'Articles',
    image: a.featuredImage || '',
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
