import type { Metadata } from "next";
import ContactForm from '@/components/contact/ContactForm';
import { seoFor } from '@/lib/seo-meta';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const meta = seoFor('contact', locale);
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://chaletexpress.com/${locale}/contact`,
      languages: {
        en: `https://chaletexpress.com/en/contact`,
        fr: `https://chaletexpress.com/fr/contact`,
        "x-default": `https://chaletexpress.com/en/contact`,
      },
    },
    openGraph: {
      title: "Contact Chalet Express",
      description: meta.description,
    },
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
