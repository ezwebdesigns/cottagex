'use client';

import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, ChevronRight } from 'lucide-react';
import { initialArticles } from '@/lib/mock-data';

export default function GuidesList() {
  const router = useRouter();

  return (
    <div className="animate-in fade-in duration-300 max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[#1F51C6] font-bold text-sm tracking-widest uppercase bg-blue-50 px-3 py-1.5 rounded-full">Inspiration & Travel Intel</span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#0B1B40] mt-4 mb-3">The Escape Magazine</h1>
        <p className="text-slate-500 text-lg">In-depth guides, expert packing lists, and local recommendations to simplify your upcoming cabin retreat.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {initialArticles.map((article) => (
          <article
            key={article.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer group"
            onClick={() => router.push(`/guides/${article.slug}`)}
          >
            <div className="relative h-56 overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#0B1B40]">
                {article.category}
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> {article.date}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {article.readTime}</span>
                </div>
                <h3 className="font-bold text-lg text-[#0B1B40] mb-3 group-hover:text-[#1F51C6] transition-colors line-clamp-2 leading-tight">
                  {article.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
              <span className="text-[#1F51C6] font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                Read Article <ChevronRight size={16} />
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
