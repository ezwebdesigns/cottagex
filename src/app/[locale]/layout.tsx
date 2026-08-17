import type { Metadata } from "next";
import { TranslationsProvider } from '@/lib/TranslationsProvider';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: `Canadian Cottage Rentals - Chalet Express`,
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
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

  return (
    <TranslationsProvider locale={locale}>
      <PublicLayoutWrapper>
        {children}
      </PublicLayoutWrapper>
    </TranslationsProvider>
  );
}