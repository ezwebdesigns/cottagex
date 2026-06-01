import type { Metadata } from "next";
import { db } from '@/lib/db';
import { siteSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { defaultSettings } from '@/lib/settings-defaults';
import LocaleLayout from '@/components/layout/LocaleLayout';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      template: `%s | Chalet Express`,
      default: `Canadian Cottage Rentals - Chalet Express`,
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

  let menuItems = defaultSettings.header.menuItems;
  let logo = defaultSettings.general.logo;
  try {
    const [headerRow] = await db.select().from(siteSettings).where(eq(siteSettings.section, 'header'));
    const headerData = headerRow?.data as any;
    if (headerData?.menuItems) menuItems = headerData.menuItems;
    const [generalRow] = await db.select().from(siteSettings).where(eq(siteSettings.section, 'general'));
    const generalData = generalRow?.data as any;
    if (generalData?.logo) logo = generalData.logo;
  } catch {}

  return (
    <LocaleLayout locale={locale} menuItems={menuItems} logo={logo}>
      {children}
    </LocaleLayout>
  );
}
