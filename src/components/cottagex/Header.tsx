'use client';

import { Globe, Mountain } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/useTranslations';

export default function Header() {
  const { t, lang } = useTranslations();
  const pathname = usePathname();

  const toggleLang = () => {
    const otherLocale = lang === 'en' ? 'fr' : 'en';
    const newPath = pathname.replace(/^\/(en|fr)/, `/${otherLocale}`);
    window.location.href = newPath;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href={`/${lang}`} className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0f51ec] flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
              Chalet<span className="text-[#0f51ec]"> Express</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
            >
              <Globe className="w-4 h-4 text-[#191e3b]" />
              <span className="text-sm font-semibold text-[#191e3b]">{t.langLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
