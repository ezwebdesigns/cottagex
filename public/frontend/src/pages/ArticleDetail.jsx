// Article detail page
// Paste your Base44 code here.
import React from 'react';
import { ArrowLeft, Star, MapPin, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { articles, chalets } from '@/lib/data';

export default function ArticleDetail({ articleId, onNavigate }) {
  const { t, lang } = useLang();

  const article = articles.find((a) => a.id === articleId);
  if (!article) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-400">Article not found.</p>
      </div>
    );
  }

  const title = lang === 'fr' ? article.titleFr : article.title;
  const excerpt = lang === 'fr' ? article.excerptFr : article.excerpt;
  const category = lang === 'fr' ? article.categoryFr : article.category;
  const date = lang === 'fr' ? article.dateFr : article.date;
  const articleChalets = article.chaletIds.map((id) => chalets.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      {/* Back button */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => onNavigate('guides')}
          className="flex items-center gap-2 text-sm font-semibold text-[#0f51ec] hover:gap-3 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.guides.backToGuides}
        </button>
      </div>

      {/* Article Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 text-center">
        <div className="inline-block px-3 py-1 rounded-full bg-[#77e1fb]/30 text-[#0f51ec] text-xs font-semibold mb-4">
          {category}
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#191e3b] mb-4 leading-tight" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {title}
        </h1>
        <p className="text-base text-slate-500 leading-relaxed mb-6 max-w-2xl mx-auto">{excerpt}</p>
        {/* Author */}
        <div className="flex items-center justify-center gap-3">
          <img src={article.author.avatar} alt={article.author.name} className="w-12 h-12 rounded-full object-cover" />
          <div className="text-left">
            <p className="text-sm font-semibold text-[#191e3b]">{article.author.name}</p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{article.author.role}</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.readTime} {t.guides.readTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Panoramic Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="rounded-[2rem] overflow-hidden h-64 sm:h-96">
          <img src={article.image} alt={title} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <p className="text-base sm:text-lg text-[#191e3b] leading-relaxed" style={{ lineHeight: 1.8 }}>
          {article.intro}
        </p>
      </div>

      {/* Ranked Chalets */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191e3b] mb-6" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {t.guides.rankedChalets}
        </h2>
        <div className="space-y-6">
          {articleChalets.map((chalet, i) => {
            const rank = i + 1;
            return (
              <div
                key={chalet.id}
                className="relative flex flex-col sm:flex-row rounded-[2rem] overflow-hidden bg-white shadow-md hover:shadow-xl transition-shadow border border-slate-100"
              >
                {/* Image - 40% on desktop */}
                <div className="sm:w-2/5 h-52 sm:h-auto overflow-hidden relative">
                  <img src={chalet.image} alt={chalet.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#77e1fb]/90 backdrop-blur text-[#191e3b] text-xs font-semibold">
                    {t.badges[chalet.badge] || chalet.badge}
                  </div>
                </div>
                {/* Text - 60% on desktop */}
                <div className="sm:w-3/5 p-5 sm:p-6 lg:p-8 relative">
                  {/* Large low-opacity rank number */}
                  <span className="absolute top-2 right-4 text-7xl sm:text-8xl font-bold text-[#0f51ec]/10 pointer-events-none leading-none" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                    #{rank}
                  </span>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0f51ec] text-white text-xs font-bold">#{rank}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-[#191e3b]">{chalet.rating}</span>
                        <span className="text-xs text-slate-400">({chalet.reviews})</span>
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                      {chalet.name}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-500 mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs">{chalet.location}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 max-w-prose">{chalet.description}</p>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs text-slate-400">{t.guides.estimatedPrice}</span>
                        <p>
                          <span className="text-lg font-bold text-[#191e3b]">${chalet.price}</span>
                          <span className="text-xs text-slate-400">{t.properties.perNight}</span>
                        </p>
                      </div>
                      <a
                        href={chalet.vrboUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0f51ec] text-white text-sm font-semibold hover:bg-[#0d44c9] transition-all hover:shadow-md hover:shadow-blue-500/30 min-h-[44px]"
                      >
                        {t.guides.bookNow}
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}