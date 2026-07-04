// AppSidebar - paste from Base44
// Paste your Base44 code here.
import React, { useState } from 'react';
import { Mountain, Compass, BookOpen, MapPin, Info, Globe, LayoutDashboard } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { allProvinces } from '@/lib/data';

export default function AppSidebar({ onNavigate, favorites, currentPage }) {
  const { t, toggleLang } = useLang();
  const [expanded, setExpanded] = useState(false);

  const navItems = [
    { label: t.nav.explore, icon: Compass, page: 'home' },
    { label: t.nav.guides, icon: BookOpen, page: 'guides' },
    { label: t.nav.terms, icon: Info, page: 'terms' }
  ];

  return (
    <aside
      className="flex flex-col sticky top-0 h-screen bg-white border-r border-slate-100 flex-shrink-0 transition-all duration-300 overflow-hidden z-40"
      style={{ width: expanded ? '240px' : '68px' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="border-b border-slate-100 flex items-center h-16 sm:h-20 px-4 flex-shrink-0">
        <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center flex-shrink-0">
            <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span
            className={`text-xl font-bold text-[#191e3b] whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}
            style={{ fontFamily: 'Radio Canada, sans-serif' }}
          >
            Cottage<span className="text-[#0f51ec]">x</span>
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5 mb-3">
          {navItems.map((item) => {
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.page)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-[44px] ${
                  isActive ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'text-[#191e3b] hover:bg-slate-50'
                }`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Destinations */}
        <p className={`px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.nav.destinations}</p>
        <div className="space-y-0.5 mb-3">
          {allProvinces.map((prov) => (
            <button
              key={prov}
              onClick={() => onNavigate('destination', prov)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-xl font-medium text-sm text-[#191e3b] hover:bg-slate-50 transition-colors min-h-[40px]"
              title={t.provinces[prov]}
            >
              <MapPin className="w-5 h-5 text-[#77e1fb] flex-shrink-0" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.provinces[prov]}</span>
            </button>
          ))}
        </div>

        {/* Favorites */}
        <p className={`px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.sidebar.favorites}</p>
        {favorites.length === 0 ? (
          <p className={`px-3 text-xs text-slate-400 leading-relaxed transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{t.sidebar.noFavorites}</p>
        ) : (
          <div className="flex gap-2 px-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {favorites.map((ch) => (
              <button key={ch.id} onClick={() => onNavigate('home')} className="flex-shrink-0">
                <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#77e1fb]">
                  <img src={ch.image} alt={ch.name} className="w-full h-full object-cover" />
                </div>
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Bottom: admin + lang toggle */}
      <div className="border-t border-slate-100 px-2 py-2 flex-shrink-0">
        <button
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors min-h-[44px] mb-1"
          title="Admin"
        >
          <LayoutDashboard className="w-5 h-5 text-[#191e3b] flex-shrink-0" />
          <span className="text-sm font-medium text-[#191e3b] whitespace-nowrap transition-opacity duration-200" style={{ opacity: expanded ? 1 : 0 }}>Admin</span>
        </button>
        <button
          onClick={toggleLang}
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