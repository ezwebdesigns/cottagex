'use client';

import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type ArticlePreview = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
};

type InspirationSectionProps = {
  locale: string;
  title?: string;
  description?: string;
  articles?: ArticlePreview[];
};

export default function InspirationSection({
  locale,
  title = "Latest Inspiration",
  description = "Expert guides, local tips, and curated stories to help plan your perfect Canadian cottage escape.",
  articles = [],
}: InspirationSectionProps) {
  if (articles.length === 0) return null;

  return (
    <section className="px-4 md:px-8 py-16 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40]">{title}</h2>
            {description && <p className="text-gray-500 mt-2 max-w-2xl">{description}</p>}
          </div>
          <Link
            href={`/${locale}/guides`}
            className="text-[#1F51C6] font-semibold text-sm inline-flex items-center gap-1 hover:underline shrink-0"
          >
            View all guides <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.slice(0, 4).map((article) => (
            <Link
              key={article.id}
              href={`/${locale}/guides/${article.slug}`}
              className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {article.image ? (
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <BookOpen size={40} />
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[#0B1B40] text-[10px] font-bold px-3 py-1 rounded-full">
                  {article.category}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1B40] leading-snug mb-2 line-clamp-2 group-hover:text-[#1F51C6] transition-colors">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-[10px] text-gray-400 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={10} /> {article.readTime}
                  </span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
