import type { Metadata } from "next";
import LocationTemplate from '@/templates/LocationTemplate';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const name = slug.charAt(0).toUpperCase() + slug.slice(1);
  return {
    title: `Cottages to Rent in ${name} - Canadian Cottage Rentals`,
    description: `Find your perfect cottage escape in ${name}. Browse premium lake houses, cabins, and wilderness retreats with secure VRBO booking.`,
    alternates: { canonical: `https://chaletexpress.com/${locale}/locations/${slug}` },
    openGraph: {
      title: `Cottages to Rent in ${name}`,
      description: `Discover premium cottage rentals in ${name}, Canada.`,
      images: [{ url: "https://images.unsplash.com/photo-1475855581690-80accde3ae2b?auto=format&fit=crop&q=80&w=1200", width: 1200, height: 630 }],
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  return <LocationTemplate locale={locale} slug={slug} />;
}
