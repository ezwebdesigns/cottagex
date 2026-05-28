'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { canadaSearchData } from '@/lib/mock-data';

type SearchByCityProps = {
  title?: string;
  description?: string;
};

export default function SearchByCity({ title = "Search by City and Category", description = "Quickly jump into active curated rentals across major Canadian regions." }: SearchByCityProps) {
  const [activeMoreCity, setActiveMoreCity] = useState<typeof canadaSearchData[0] | null>(null);

  return (
    <section className="px-4 md:px-8 py-16 bg-[#f8fafc] border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-[#0B1B40] tracking-tight">{title}</h2>
          <p className="text-slate-500 mt-2">{description}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          {canadaSearchData.map((data) => (
            <div key={data.city} className="bg-white rounded-3xl p-4 md:p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold text-[#0B1B40] border-b border-slate-50 pb-2 md:pb-3 mb-3 md:mb-4">{data.city}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {data.categories.map((cat, idx) => (
                    <li key={idx}>
                      <a
                        href="https://www.vrbo.com/search"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#1F51C6] hover:text-[#163FA3] text-xs md:text-sm font-semibold hover:underline block transition-colors line-clamp-1"
                      >
                        {cat}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setActiveMoreCity(data)}
                className="text-[#1F51C6]/80 hover:text-[#1F51C6] text-[11px] md:text-xs font-bold mt-4 md:mt-5 text-left inline-flex items-center gap-1 hover:underline"
              >
                + 8 more
              </button>
            </div>
          ))}
        </div>
      </div>

      {activeMoreCity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200 shadow-2xl">
            <button
              onClick={() => setActiveMoreCity(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
            <h3 className="text-2xl font-black text-[#0B1B40] mb-2">{activeMoreCity.city}</h3>
            <p className="text-sm text-slate-400 mb-6">Explore expanded niche categories and localized cabin listings.</p>

            <div className="grid grid-cols-2 gap-3">
              {activeMoreCity.more.map((item, idx) => (
                <a
                  key={idx}
                  href="https://www.vrbo.com/search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-[#1F51C6] p-3 rounded-full text-xs font-semibold border border-slate-100 transition-colors text-center"
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveMoreCity(null)}
                className="bg-[#0B1B40] hover:bg-slate-800 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
