import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

type InspirationSectionProps = {
  locale: string;
  title?: string;
  description?: string;
};

const placeholders: Record<string, { title: string; description: string; image: string }[]> = {
  en: [
    { title: 'Top 10 Ontario Lakefront Rentals', description: 'Discover the best waterfront cottages across Ontario for your perfect summer getaway.', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80' },
    { title: 'Quebec Cottage Guide for Families', description: 'Family-friendly chalets in Quebec with activities for all ages, from swimming to hiking.', image: 'https://images.unsplash.com/photo-1517770413964-df8ca61194a6?auto=format&fit=crop&w=600&q=80' },
    { title: 'Luxury Mountain Retreats in BC', description: 'Premium alpine lodges in British Columbia offering hot tubs, views, and world-class amenities.', image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=600&q=80' },
  ],
  fr: [
    { title: 'Top 10 locations au bord du lac en Ontario', description: 'Découvrez les meilleurs chalets au bord de l\'eau en Ontario pour vos vacances d\'été.', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=600&q=80' },
    { title: 'Guide des chalets au Québec pour familles', description: 'Chalets familiaux au Québec avec activités pour tous les âges, de la baignade à la randonnée.', image: 'https://images.unsplash.com/photo-1517770413964-df8ca61194a6?auto=format&fit=crop&w=600&q=80' },
    { title: 'Retraites de montagne luxueuses en CB', description: 'Chalets de luxe en Colombie-Britannique offrant spas, vues imprenables et commodités de classe mondiale.', image: 'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?auto=format&fit=crop&w=600&q=80' },
  ],
};

export default function InspirationSection({ locale, title, description }: InspirationSectionProps) {
  const guides = placeholders[locale] || placeholders.en;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
              {title}
            </h2>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {guides.map((guide, i) => (
            <Link
              key={i}
              href={`/${locale}/guides`}
              className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative h-48 overflow-hidden">
                <img src={guide.image} alt={guide.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-5 sm:p-6">
                <h3 className="font-bold text-[#191e3b] mb-2 group-hover:text-[#0f51ec] transition-colors">{guide.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{guide.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}