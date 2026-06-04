'use client';

import { ArrowLeft, CalendarDays, Clock, ExternalLink, BookOpen } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { useRouter, usePathname } from 'next/navigation';
import { ontarioListicleChalets } from '@/lib/mock-data';
import { BreadcrumbSchema, ArticleSchema, ItemListSchema } from '@/components/seo/SchemaOrg';
import FAQAccordion from '@/components/FAQAccordion';

type ArticleListicleProps = {
  locale: string;
  article: {
    title: string;
    content: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
    faq?: { question: string; answer: string }[];
  };
};

export default function ArticleListicle({ locale, article }: ArticleListicleProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto px-4 py-10">
      <BreadcrumbSchema items={[
        { name: 'Home', url: `/${locale}` },
        { name: 'Guides', url: `/${locale}/guides` },
        { name: article.title, url: pathname },
      ]} />
      <ArticleSchema
        title={article.title}
        description={article.content}
        image={article.image}
        date={article.date}
      />
      <ItemListSchema
        items={ontarioListicleChalets.map(c => ({
          title: c.title,
          description: c.description,
          url: c.vrboLink,
        }))}
      />
      <button
        onClick={() => router.push(`/${locale}/guides`)}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-[#1F51C6] font-semibold text-sm mb-8 transition-colors bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm"
      >
        <ArrowLeft size={16} /> Back to Guides
      </button>

      <div className="mb-8">
        <span className="text-xs font-bold text-[#1F51C6] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
          {article.category}
        </span>
        <h1 className="text-3xl md:text-5xl font-bold text-[#0B1B40] mt-4 mb-6 leading-tight">
          {article.title}
        </h1>
        <div className="flex items-center gap-6 text-sm text-slate-500 border-y border-slate-100 py-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-[#1F51C6]">EC</span>
            <span className="font-medium text-slate-700">Chalet Express Editorial Team</span>
          </div>
          <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
            <span className="flex items-center gap-1"><CalendarDays size={14} /> {article.date}</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {article.readTime}</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] md:h-[450px] rounded-[2rem] overflow-hidden mb-10 shadow-sm">
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-lg text-slate-700 max-w-none leading-relaxed mb-12 w-full overflow-x-hidden break-words [&_pre]:whitespace-pre-wrap [&_code]:break-words" dangerouslySetInnerHTML={{ __html: article.content }} />

      <div className="space-y-16">
        <div className="border-l-4 border-[#1F51C6] pl-4 mb-8 bg-blue-50/50 p-6 rounded-r-2xl">
          <h4 className="font-bold text-[#0B1B40] text-lg mb-2">Editor's Disclaimer:</h4>
          <p className="text-sm text-slate-600">
            Pricing is highly dependent on season and group size. Clicking "Check Availability" routes you directly to verified affiliate landing pages where transactions can be made securely. Happy scouting!
          </p>
        </div>

        {ontarioListicleChalets.map((chalet) => (
          <div key={chalet.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row">
            <div className="lg:w-2/5 relative h-72 lg:h-auto min-h-[300px] bg-slate-100">
              <img src={chalet.image} alt={chalet.title} className="w-full h-full object-cover" />
              <div className="absolute top-6 left-6 w-12 h-12 bg-[#0B1B40] text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                #{chalet.rank}
              </div>
            </div>
            <div className="lg:w-3/5 p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                  <span className="bg-blue-50 text-[#1F51C6] text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full">
                    {chalet.vibe}
                  </span>
                  <div className="flex items-center gap-1">
                    <StarRating rating={parseFloat(chalet.rating)} size={14} />
                    <span className="text-sm font-bold text-[#0B1B40]">{chalet.rating}</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[#0B1B40] mb-4">
                  {chalet.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base mb-6">
                  {chalet.description}
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">ESTIMATED RATE</p>
                  <span className="text-2xl font-black text-[#1F51C6]">${chalet.price}</span>
                  <span className="text-xs text-slate-500 font-medium"> / night</span>
                </div>
                <a href={chalet.vrboLink} target="_blank" rel="noopener noreferrer" className="bg-[#0B1B40] hover:bg-[#1F51C6] text-white px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 text-sm shadow-md">
                  Check Availability <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {article.faq && article.faq.length > 0 && (
        <FAQAccordion items={article.faq} />
      )}

      <div className="bg-[#0B1B40] rounded-[2rem] p-8 text-white mt-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-xl font-bold mb-2">Inspired by this reading?</h4>
          <p className="text-blue-200 text-sm">Find and compare your dream cottage across Canada now.</p>
        </div>
        <button onClick={() => router.push(`/${locale}`)} className="bg-[#1F51C6] hover:bg-[#163FA3] text-white px-6 py-3 rounded-full font-bold transition-colors whitespace-nowrap text-sm">
          Back to Homepage
        </button>
      </div>
    </div>
  );
}
