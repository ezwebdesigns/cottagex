'use client';

import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

type SearchInspirationsProps = {
  data: {
    title?: string;
    items?: { city: string; category: string; tab: string; link: string }[];
  } | null;
  locale: string;
};

export default function SearchInspirations({ data, locale }: SearchInspirationsProps) {
  const items = data?.items || [];
  const title = data?.title || '';

  const tabs = useMemo(() => {
    const unique = Array.from(new Set(items.map(i => i.tab).filter(Boolean)));
    return unique;
  }, [items]);

  const [activeTab, setActiveTab] = useState<string>(tabs[0] || '');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const tabItems = activeTab ? items.filter(i => i.tab === activeTab) : items;
    return showAll ? tabItems : tabItems.slice(0, 18);
  }, [items, activeTab, showAll]);

  if (!title || items.length === 0) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-50">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#191e3b] mb-8" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
        {title}
      </h2>

      {tabs.length > 0 && (
        <div className="flex justify-center gap-2 sm:gap-3 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setShowAll(false); }}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-[#0f51ec] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-[#0f51ec]/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {filtered.map((item, i) => (
          <a
            key={i}
            href={item.link}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 hover:shadow-md transition-shadow group"
          >
            <p className="text-sm sm:text-base font-semibold text-[#191e3b] group-hover:text-[#0f51ec] transition-colors">{item.city}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.category}</p>
          </a>
        ))}
      </div>

      {items.length > 18 && (
        <div className="text-center mt-8">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-[#0f51ec] font-semibold text-sm hover:underline"
          >
            {showAll ? 'Show less' : 'Show more'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}
    </section>
  );
}
