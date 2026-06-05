'use client';

import { ArrowLeft, CalendarDays, Clock } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { BreadcrumbSchema, ArticleSchema } from '@/components/seo/SchemaOrg';
import { CottageShortcode } from '@/components/CottageShortcode';
import FAQAccordion from '@/components/FAQAccordion';

const shortcodeRegex = /\[([a-z0-9-]+),\s*([a-z0-9-]+)(?:,\s*([a-z0-9-]+))?(?:,\s*(\d+))?\]/;

type ArticleListicleProps = {
  locale: string;
  article: {
    title: string;
    content: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
    imageAlt?: string;
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
        <img src={article.image} alt={article.imageAlt || article.title} className="w-full h-full object-cover" />
      </div>

      <div className="prose prose-lg text-slate-700 max-w-none leading-relaxed mb-12 w-full overflow-x-hidden break-words [&_pre]:whitespace-pre-wrap [&_code]:break-words">
        {(() => {
          const parts = article.content.split(shortcodeRegex);
          if (parts.length === 1) {
            return <div dangerouslySetInnerHTML={{ __html: article.content }} />;
          }
          return parts.map((part, i) => {
            const mod = i % 5;
            if (mod === 0) {
              return part ? <div key={i} dangerouslySetInnerHTML={{ __html: part }} /> : null;
            }
            if (mod === 1) {
              const param1 = part.trim().toLowerCase();
              const param2 = (parts[i + 1] || '').trim().toLowerCase() || 'rating';
              const param3 = (parts[i + 2] || '').trim().toLowerCase();
              const limitStr = parts[i + 3];
              const limit = limitStr ? parseInt(limitStr, 10) : (param3 && /^\d+$/.test(param3) ? parseInt(param3) : 6);
              const actualParam3 = limitStr ? param3 : '';
              return <CottageShortcode key={i} param1={param1} param2={param2} param3={actualParam3 || undefined} limit={Math.min(limit, 10)} />;
            }
            return null;
          });
        })()}
      </div>

      <div className="border-l-4 border-[#1F51C6] pl-4 mb-8 bg-blue-50/50 p-6 rounded-r-2xl">
        <h4 className="font-bold text-[#0B1B40] text-lg mb-2">Editor's Disclaimer:</h4>
        <p className="text-sm text-slate-600">
          Pricing is highly dependent on season and group size. Clicking "Check Availability" routes you directly to verified affiliate landing pages where transactions can be made securely. Happy scouting!
        </p>
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
