'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type SearchFaqProps = {
  data?: any;
  location?: string;
  province?: string;
};

export default function SearchFaq({ data, location = '', province = '' }: SearchFaqProps) {
  const items: { q: string; a: string }[] = data?.items || [];
  const note = data?.note || '';

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (items.length === 0) return null;

  const fill = (text: string) => {
    let out = text.replace(/\{location\}/g, location);
    if (province) {
      out = out.replace(/\{province\}/g, province);
    } else {
      out = out
        .replace(/,?\s*(?:in\s+)?\{province\}\s*,?/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }
    return out;
  };

  const half = Math.ceil(items.length / 2);
  const left = items.slice(0, half);
  const right = items.slice(half);
  const hasNote = Boolean(note.trim());

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
              <span className="font-medium text-sm text-[#191e3b] pr-3">{fill(item.q)}</span>
              <ChevronDown className={`w-4 h-4 text-[#0f51ec] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
              <p className="text-sm text-slate-500 leading-relaxed">{fill(item.a)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-white">
      <div className={hasNote ? 'grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8' : 'grid grid-cols-1 md:grid-cols-2 gap-x-10'}>
        {renderAccordion(left, 0)}
        {renderAccordion(right, half)}
        {hasNote && (
          <div className="bg-[#77e1fb] rounded-[2rem] p-6 sm:p-8">
            <p className="text-sm text-[#191e3b] leading-relaxed text-justify">{fill(note)}</p>
          </div>
        )}
      </div>
    </section>
  );
}