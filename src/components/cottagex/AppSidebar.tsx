'use client';

import { useState, useEffect } from 'react';
import { Mountain, Compass, BookOpen, MapPin, Info, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/lib/useTranslations';

const allProvinces = ['ontario', 'quebec', 'britishColumbia', 'alberta'] as const;

export default function AppSidebar() {
  const { t, lang } = useTranslations();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings?section=general').then(r => r.json()).then(d => setFavicon(d.data?.favicon ?? null)).catch(() => {});
  }, []);

  const currentPage = pathname.replace(/^\/(en|fr)\/?/, '') || 'home';

  const toggleLocale = () => {
    const otherLocale = lang === 'en' ? 'fr' : 'en';
    const newPath = pathname.replace(/^\/(en|fr)/, `/${otherLocale}`);
    window.location.href = newPath;
  };

  const navItems = [
    { label: t.nav.explore, icon: Compass, href: `/${lang}` },
    { label: t.nav.guides, icon: BookOpen, href: `/${lang}/guides` },
    { label: t.nav.terms, icon: Info, href: `/${lang}/terms` },
  ];

  const isActive = (href: string) => {
    if (href === `/${lang}`) return currentPage === 'home';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className="flex flex-col sticky top-0 h-screen bg-white border-r border-slate-100 flex-shrink-0 transition-all duration-300 overflow-hidden z-40"
      style={{ width: expanded ? '240px' : '68px' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="border-b border-slate-100 flex items-center h-16 sm:h-20 px-4 flex-shrink-0">
        <Link href={`/${lang}`} className="flex items-center">
          {favicon ? (
            <img src={favicon} alt="" className="w-9 h-9 rounded-2xl flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center flex-shrink-0">
              <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5 mb-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-[44px] ${
                  active ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'text-[#191e3b] hover:bg-slate-50'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <p className={`px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.nav.destinations}</p>
        <div className="space-y-0.5 mb-3">
          {allProvinces.map((prov) => (
            <Link
              key={prov}
              href={`/${lang}/cottage-country/${prov}`}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl font-medium text-sm text-[#191e3b] hover:bg-slate-50 transition-colors min-h-[40px]"
              title={t.provinces[prov]}
            >
              <MapPin className="w-5 h-5 text-[#77e1fb] flex-shrink-0" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.provinces[prov]}</span>
            </Link>
          ))}
        </div>

        <p className={`px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.sidebar.favorites}</p>
        <p className={`px-3 text-xs text-slate-400 leading-relaxed transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.sidebar.noFavorites}</p>
      </nav>

      <div className="border-t border-slate-100 px-2 py-2 flex-shrink-0">
        <button
          onClick={toggleLocale}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors min-h-[44px]"
          title={t.langLabel}
        >
          <Globe className="w-5 h-5 text-[#191e3b] flex-shrink-0" />
          <span className={`text-sm font-medium text-[#191e3b] whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.langLabel}</span>
        </button>
      </div>
    </aside>
  );
}
