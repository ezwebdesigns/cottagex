import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type InspirationSectionProps = {
  locale: string;
  title?: string;
  description?: string;
};

export default function InspirationSection({ locale, title, description }: InspirationSectionProps) {
  if (!title && !description) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-slate-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            {title && (
              <h2 className="text-3xl sm:text-4xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-slate-500 mt-3 text-sm sm:text-base leading-relaxed">{description}</p>
            )}
          </div>
          <Link
            href={`/${locale}/guides`}
            className="inline-flex items-center gap-2 bg-[#0f51ec] text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-[#0d44c9] transition-colors shrink-0"
          >
            {locale === 'fr' ? 'Voir tous les guides' : 'View all guides'} <ArrowRight size={16} />
          </Link>
        </div>
    </section>
  );
}
