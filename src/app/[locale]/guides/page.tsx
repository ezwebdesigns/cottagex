import type { Metadata } from "next";
import GuidesList from '@/components/guides/GuidesList';

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

export default function GuidesPage() {
  return <GuidesList />;
}
