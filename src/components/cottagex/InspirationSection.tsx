import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type ArticleItem = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
};

type InspirationSectionProps = {
  locale: string;
  title?: string;
  description?: string;
  articles?: ArticleItem[];
};

export default function InspirationSection({ locale, title, description, articles }: InspirationSectionProps) {
  if (!title && !description && (!articles || articles.length === 0)) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto">
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

        {articles && articles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/${locale}/guides/${article.slug}`}
                className="group text-left rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  {article.image ? (
                    <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100" />
                  )}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#77e1fb]/90 backdrop-blur text-[#191e3b] text-xs font-semibold">
                    {article.category}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    {article.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.date}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#191e3b] leading-tight mb-2 group-hover:text-[#0f51ec] transition-colors" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                    {article.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">{article.excerpt}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-[#0f51ec] mt-4 group-hover:gap-2 transition-all">
                    {locale === 'fr' ? 'Lire le guide' : 'Read Guide'} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
