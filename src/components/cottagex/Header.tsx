'use client';

import { useState, useEffect } from 'react';
import { Globe, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';

export default function Header({ onMenuToggle }: { onMenuToggle?: () => void }) {
  const t = useTranslations();
  const lang = useLocale();
  const pathname = usePathname();
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings?section=general').then(r => r.json()).then(d => {
      const raw = d.data?.logo ?? null;
      if (raw && raw.startsWith('lib:')) {
        fetch(`/api/library/${raw.slice(4)}`).then(r => r.ok && r.json()).then(d => setLogo(d?.url || '')).catch(() => setLogo(''));
      } else {
        setLogo(raw);
      }
    }).catch(() => {});
  }, []);

  const toggleLang = () => {
    const otherLocale = lang === 'en' ? 'fr' : 'en';
    // Handle root path and paths with/without trailing slash
    let newPath = pathname;
    if (pathname === '/') {
      newPath = `/${otherLocale}`;
    } else if (pathname === '/en' || pathname === '/fr') {
      newPath = `/${otherLocale}`;
    } else if (pathname.startsWith('/en/')) {
      newPath = pathname.replace(/^\/en/, '/fr');
    } else if (pathname.startsWith('/fr/')) {
      newPath = pathname.replace(/^\/fr/, '/en');
    } else {
      newPath = `/${otherLocale}`;
    }
    window.location.href = newPath;
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex items-center gap-2">
            <button
              onClick={onMenuToggle}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-[#191e3b]" />
            </button>
            <Link href={`/${lang}`} className="flex items-center gap-2 group">
              {logo ? (
                <img src={logo} alt="Chalet Express" className="h-8 sm:h-9 w-auto" />
              ) : (
                <span className="text-xl font-bold text-[#191e3b] whitespace-nowrap">
                  Chalet <span className="text-[#0f51ec]">Express</span>
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
            >
              <Globe className="w-4 h-4 text-[#191e3b]" />
              <span className="text-sm font-semibold text-[#191e3b]">{t('langLabel')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
