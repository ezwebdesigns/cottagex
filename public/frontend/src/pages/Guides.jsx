// Guides page
// Paste your Base44 code here.
import React from 'react';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { articles } from '@/lib/data';

export default function Guides({ onNavigate }) {
  const { t, lang } = useLang();

  const formatDate = (dateStr, dateFr) => lang === 'fr' ? dateFr : dateStr;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#191e3b] to-[#0f51ec] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
            {t.guides.title}
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-2xl mx-auto">{t.guides.subtitle}</p>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {articles.map((article) => {
            const title = lang === 'fr' ? article.titleFr : article.title;
            const excerpt = lang === 'fr' ? article.excerptFr : article.excerpt;
            const category = lang === 'fr' ? article.categoryFr : article.category;
            const date = formatDate(article.date, article.dateFr);
            return (
              <button
                key={article.id}
                onClick={() => onNavigate('article', article.id)}
                className="group text-left rounded-[2rem] overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={article.image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#77e1fb]/90 backdrop-blur text-[#191e3b] text-xs font-semibold">
                    {category}
                  </div>
                </div>
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {article.readTime} {t.guides.readTime}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-[#191e3b] leading-tight mb-2 group-hover:text-[#0f51ec] transition-colors" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                    {title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed mb-4 flex-1">{excerpt}</p>
                  {/* Author */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <img src={article.author.avatar} alt={article.author.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-semibold text-[#191e3b]">{article.author.name}</p>
                        <p className="text-[10px] text-slate-400">{article.author.role}</p>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#0f51ec] group-hover:gap-2 transition-all">
                      {t.guides.viewGuide}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}