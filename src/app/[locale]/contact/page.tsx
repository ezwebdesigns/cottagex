import type { Metadata } from "next";
import ContactForm from '@/components/contact/ContactForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Contact - Get in Touch",
    description: "Contact Cottage Escape for partnerships, cottage listings, or travel inquiries. We respond within 24 hours.",
    alternates: { canonical: `https://chaletexpress.com/${locale}/contact` },
    openGraph: {
      title: "Contact Cottage Escape",
      description: "Get in touch with Canada's cottage rental directory team.",
    },
  };
}

export default function ContactPage() {
  return <ContactForm />;
}
