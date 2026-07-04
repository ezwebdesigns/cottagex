'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, ChevronRight, ChevronLeft, ChevronUp } from 'lucide-react';
import Image from 'next/image';

type ArticleItem = {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
};

type GuidesListProps = {
  locale: string;
  articles: ArticleItem[];
  page: number;
  totalPages: number;
};

export default function GuidesList({ locale, articles, page, totalPages }: GuidesListProps) {
  const router = useRouter();

  return (
    <div className="animate-in fade-in duration-300 max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[#0f51ec] font-bold text-sm tracking-widest uppercase bg-blue-50 px-3 py-1.5 rounded-full">Inspiration & Travel Intel</span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#191e3b] mt-4 mb-3">The Escape Magazine</h1>
        <p className="text-slate-500 text-lg">In-depth guides, expert packing lists, and local recommendations to simplify your upcoming cabin retreat.</p>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-lg">No articles yet.</p>
          <p className="text-sm mt-2">Check back soon for new guides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group"
              onClick={() => router.push(`/${locale}/guides/${article.slug}`)}
            >
              <div className="relative h-56 overflow-hidden">
                {article.image ? (
                  <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
                    <span className="text-4xl">🏡</span>
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#191e3b]">
                  {article.category}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    {article.date && <span className="flex items-center gap-1"><CalendarDays size={12} /> {article.date}</span>}
                    <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                  </div>
                  <h3 className="font-bold text-lg text-[#191e3b] mb-3 group-hover:text-[#0f51ec] transition-colors line-clamp-2 leading-tight">
                    {article.title}
                  </h3>
                  <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
                <span className="text-[#0f51ec] font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                  Read Article <ChevronRight size={16} />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

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
    </div>
  );
}
