import type { Metadata } from "next";
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { getSettings } from '@/lib/cached-settings';
import { defaultSettings } from '@/lib/settings-defaults';
import LocaleLayout from '@/components/layout/LocaleLayout';
import ComingSoon from '@/components/ComingSoon';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  let healthy = false;
  try { await db.execute(sql`SELECT 1`); healthy = true; } catch {}
  if (!healthy) {
    return { title: "Chalet Express - Coming Soon" };
  }
  return {
    title: {
      template: `%s | Chalet Express`,
      default: `Canadian Cottage Rentals - Chalet Express`,
    },
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

  let healthy = false;
  try { await db.execute(sql`SELECT 1`); healthy = true; } catch {}

  if (!healthy) {
    return <ComingSoon locale={locale} />;
  }

  const [headerData, generalData] = await Promise.all([
    getSettings('header'),
    getSettings('general'),
  ]);
  const menuItems = headerData?.menuItems ?? defaultSettings.header.menuItems;
  const logo = generalData?.logo ?? defaultSettings.general.logo;

  return (
    <LocaleLayout locale={locale} menuItems={menuItems} logo={logo}>
      {children}
    </LocaleLayout>
  );
}
