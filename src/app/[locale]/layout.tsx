import type { Metadata } from "next";
import LocaleLayout from '@/components/layout/LocaleLayout';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      template: `%s | Cottage Escape`,
      default: `Canadian Cottage Rentals - Cottage Escape`,
    },
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
    alternates: {
      canonical: `https://chaletexpress.com/${locale}`,
    },
    openGraph: {
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LocaleLayout locale={locale}>{children}</LocaleLayout>;
}
