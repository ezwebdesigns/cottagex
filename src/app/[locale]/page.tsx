import type { Metadata } from "next";
import HeroSection from '@/components/home/HeroSection';
import TrendingDestinations from '@/components/home/TrendingDestinations';
import PropertyGallery from '@/components/home/PropertyGallery';
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div>
      <HeroSection />
      <TrendingDestinations locale={locale} />
      <PropertyGallery />
      <SearchByCity />
      <PartnershipPromo locale={locale} />
    </div>
  );
}
