'use client';

import { useRouter } from 'next/navigation';
import { Calendar, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

type ArticleItem = {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
  author: string;
};

type GuidesListProps = {
  locale: string;
  articles: ArticleItem[];
  page: number;
  totalPages: number;
};

const AVATAR_BASE = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100';

export default function GuidesList({ locale, articles, page, totalPages }: GuidesListProps) {
  const router = useRouter();
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-b from-[#191e3b] to-[#0f51ec] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>
            {t('guides.title')}
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto">{t('guides.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">{t.has('guides.noArticles') ? t('guides.noArticles') : 'No articles yet.'}</p>
            <p className="text-sm mt-2">{t.has('guides.checkBack') ? t('guides.checkBack') : 'Check back soon for new guides.'}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => router.push(`/${locale}/guides/${article.slug}`)}
                  className="group text-left rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden">
                    {article.image ? (
                      <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                        <span className="text-4xl">🏡</span>
                      </div>
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
                    <h3 className="font-bold text-lg text-[#191e3b] leading-tight mb-2 group-hover:text-[#0f51ec] transition-colors" style={{ fontFamily: 'var(--font-radio-canada), sans-serif' }}>
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <img src={AVATAR_BASE} alt={article.author} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-[#191e3b]">{article.author}</p>
                          <p className="text-[10px] text-slate-400">{t.has('guides.contributor') ? t('guides.contributor') : 'Contributor'}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#0f51ec] group-hover:gap-2 transition-all">
                        {t.has('guides.viewGuide') ? t('guides.viewGuide') : 'Read Guide'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pb-8">
                <button
                  onClick={() => router.push(`/${locale}/guides?page=${page - 1}`)}
                  disabled={page <= 1}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => router.push(`/${locale}/guides?page=${p}`)}
                    className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
                      p === page
                        ? 'bg-[#0f51ec] text-white'
                        : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => router.push(`/${locale}/guides?page=${page + 1}`)}
                  disabled={page >= totalPages}
                  className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
