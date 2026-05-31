import type { Metadata } from "next";
import { db } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { defaultSettings } from '@/lib/settings-defaults';
import HeroSection from '@/components/home/HeroSection';
import TrendingDestinations from '@/components/home/TrendingDestinations';
import PropertyGallery from '@/components/home/PropertyGallery';
import ExploreSection from '@/components/home/ExploreSection';
import SearchByCity from '@/components/home/SearchByCity';
import PartnershipPromo from '@/components/home/PartnershipPromo';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Canadian Cottage Rentals - Find Your Perfect Escape",
    description: "Discover premium lake houses, mountain lodges, and wilderness cabins across Canada. Curated cottage rentals with secure VRBO booking.",
    alternates: { canonical: `https://chaletexpress.com/${locale}` },
    openGraph: {
      title: "Canadian Cottage Rentals - Cottage Escape",
      description: "Discover premium lake houses, mountain lodges, and wilderness cabins across Canada.",
      images: [{ url: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200", width: 1200, height: 630 }],
    },
  };
}

async function getSettings(section: string) {
  const [row] = await db.select().from(siteSettings).where(eq(siteSettings.section, section));
  return (row?.data ?? defaultSettings[section]) as any;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const hero = await getSettings('homepage_hero');
  const destinations = await getSettings('homepage_destinations');
  const gallery = await getSettings('homepage_gallery');
  const search = await getSettings('homepage_search');
  const explore = await getSettings('homepage_explore');
  const cta = await getSettings('homepage_cta');

  return (
    <div>
      <HeroSection tag={hero.tag} title={hero.title} description={hero.description} image={hero.image} />
      <TrendingDestinations locale={locale} title={destinations.title} description={destinations.description} ctaText={destinations.ctaText} ctaLink={destinations.ctaLink} items={destinations.items} />
      <PropertyGallery title={gallery.title} description={gallery.description} tabs={gallery.tabs} />
      <ExploreSection title={explore.title} description={explore.description} subtitle={explore.subtitle} items={explore.items} />
      <SearchByCity title={search.title} description={search.description} />
      <PartnershipPromo locale={locale} title={cta.title} description={cta.description} buttonText={cta.buttonText} buttonLink={cta.buttonLink} image={cta.image} />
    </div>
  );
}
