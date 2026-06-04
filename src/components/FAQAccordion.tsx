'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

type FAQAccordionProps = {
  items: FAQItem[];
};

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl md:text-3xl font-bold text-[#0B1B40] mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-[#0B1B40] text-sm md:text-base pr-4">{item.question}</span>
                <ChevronDown size={18} className={`text-[#1F51C6] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
