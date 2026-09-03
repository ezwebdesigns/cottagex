import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { Radio_Canada } from "next/font/google";
import { locales } from '@/i18n/routing';
import { OrganizationSchema, WebSiteSchema } from "@/components/seo/SchemaOrg";
import PublicLayoutWrapper from '@/components/PublicLayoutWrapper';
import { ThirdPartyScripts } from '@/components/ThirdPartyScripts';
import "../globals.css";

const radioCanada = Radio_Canada({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-radio-canada",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "Chalet Express - Canadian Cottage Rentals",
      template: "%s | Chalet Express",
    },
    description: "Find your perfect Canadian escape. Premium lake houses and mountain lodges across Canada.",
    metadataBase: new URL("https://chaletexpress.com"),
    alternates: {
      canonical: `https://chaletexpress.com/${locale}`,
      languages: {
        en: "https://chaletexpress.com/en",
        fr: "https://chaletexpress.com/fr",
        "x-default": "https://chaletexpress.com/en",
      },
    },
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

  return (
    <html lang={locale} className={`${radioCanada.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/android-chrome-512x512.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <OrganizationSchema />
        <WebSiteSchema />
        <ThirdPartyScripts />
      </head>
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PublicLayoutWrapper>
            {children}
          </PublicLayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}