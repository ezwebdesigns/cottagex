// Terms page
// Paste your Base44 code here.
import React from 'react';
import { useLang } from '@/lib/LanguageContext';

export default function Terms() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#191e3b] mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
          {t.terms.title}
        </h1>
        <p className="text-sm text-slate-400 mb-8">{t.terms.updated}</p>

        <div className="p-6 rounded-[2rem] bg-[#77e1fb]/10 border border-[#77e1fb]/30 mb-8">
          <p className="text-sm sm:text-base text-[#191e3b] leading-relaxed">{t.terms.intro}</p>
        </div>

        <div className="space-y-8">
          {t.terms.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg sm:text-xl font-bold text-[#191e3b] mb-2" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                {i + 1}. {section.heading}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed" style={{ lineHeight: 1.8 }}>
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-400">{t.footer.affiliateNote}</p>
        </div>
      </div>
    </div>
  );
}