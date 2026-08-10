'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type SearchFaqProps = {
  data?: any;
};

export default function SearchFaq({ data }: SearchFaqProps) {
  const title = data?.title || '';
  const subtitle = data?.subtitle || '';
  const description = data?.description || '';
  const items: { q: string; a: string }[] = data?.items || [];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!title && items.length === 0) return null;

  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);

  const renderAccordion = (list: { q: string; a: string }[], offset: number) => (
    <div className="space-y-0">
      {list.map((item, i) => {
        const idx = offset + i;
        const isOpen = openIndex === idx;
        return (
          <div key={idx} className="border-b border-slate-200">
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex items-center justify-between w-full py-4 text-left"
            >
              <span className="font-medium text-sm text-[#191e3b] pr-3">{item.q}</span>
              <ChevronDown className={`w-4 h-4 text-[#0f51ec] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
              <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
      <div className="max-w-5xl mx-auto">
        {subtitle && (
          <p className="text-sm font-semibold uppercase tracking-wider text-[#0f51ec] mb-2 text-center">{subtitle}</p>
        )}
        {title && (
          <h2 className="text-2xl sm:text-3xl font-bold text-[#191e3b] text-center" style={{ fontFamily: 'Radio Canada, sans-serif' }}>{title}</h2>
        )}
        {description && (
          <p className="text-slate-500 mt-4 text-sm sm:text-base leading-relaxed text-center max-w-2xl mx-auto">{description}</p>
        )}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {renderAccordion(left, 0)}
          {renderAccordion(right, half)}
        </div>
      </div>
    </section>
  );
}