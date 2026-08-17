import type { Metadata } from "next";
import ContactForm from '@/components/contact/ContactForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Contact - Get in Touch",
    description: "Contact Chalet Express for partnerships, cottage listings, or travel inquiries. We respond within 24 hours.",
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
      description: "Get in touch with Canada's cottage rental directory team.",
    },
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
