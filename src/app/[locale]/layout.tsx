import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { locales } from '@/i18n/routing';
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';
import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "Canadian Cottage Rentals",
      template: "%s | Chalet Express",
    },
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
    metadataBase: new URL("https://www.chaletexpress.com"),
    // NOTE: no `alternates.canonical` here on purpose — the root layout
    // builds a per-page canonical from the x-pathname header, and a static
    // `/{locale}` canonical here would override it with a wrong value.
    // hreflang alternates are defined per page.
    openGraph: {
      siteName: "Chalet Express",
      type: "website",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
    },
    twitter: {
      card: "summary_large_image",
    },
    icons: {
      icon: [
        { url: "/images/favicon.ico", sizes: "any" },
        { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/images/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      other: [
        { rel: "icon", url: "/images/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { rel: "icon", url: "/images/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
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

  if (!(locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  // NOTE: no <html>/<body> here — the root layout owns them. A nested
  // <html> produces invalid HTML, breaks hydration and duplicates the
  // font + global JSON-LD schemas.
  return (
    <>
      <ThirdPartyScripts />
      <NextIntlClientProvider locale={locale} messages={messages}>
        <PublicLayoutWrapper>
          {children}
        </PublicLayoutWrapper>
      </NextIntlClientProvider>
    </>
  );
}
