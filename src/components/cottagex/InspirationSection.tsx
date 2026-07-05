import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type InspirationSectionProps = {
  locale: string;
  title?: string;
  description?: string;
};

export default function InspirationSection({ locale, title, description }: InspirationSectionProps) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
              {title}
            </h2>
            {description && (
              <p className="text-slate-500 mt-2 text-sm sm:text-base max-w-2xl">{description}</p>
            )}
          </div>
          <Link
            href={`/${locale}/guides`}
            className="inline-flex items-center gap-1.5 text-[#0f51ec] font-semibold text-sm hover:underline shrink-0"
          >
            {locale === 'fr' ? 'Voir tous les guides' : 'View all guides'} <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
