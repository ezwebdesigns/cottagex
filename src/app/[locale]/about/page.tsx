import type { Metadata } from "next";
import StandardTemplate from '@/templates/StandardTemplate';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "About - Canadian Cottage Rental Directory",
    description: "Learn about Chalet Express — Canada's premier curated directory for lake houses, mountain cabins, and wilderness retreats.",
    alternates: {
      canonical: `https://chaletexpress.com/${locale}/about`,
      languages: {
        en: `https://chaletexpress.com/en/about`,
        fr: `https://chaletexpress.com/fr/about`,
        "x-default": `https://chaletexpress.com/en/about`,
      },
    },
    openGraph: {
      title: "About Chalet Express",
      description: "Learn about Canada's premier curated cottage rental directory.",
      images: [{ url: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=1200", width: 1200, height: 630 }],
    },
  };
}

export default async function AboutPage() {
  return (
    <StandardTemplate
      pageData={{
        title: 'About Chalet Express',
        content: '',
        type: 'about',
      }}
    />
  );
}
