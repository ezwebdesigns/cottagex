// Sidebar - paste from Base44
// Paste your Base44 code here.
import React from 'react';
import { X, Mountain, Compass, BookOpen, MapPin, Mail, Phone, Facebook, Instagram, Youtube, Info, Heart } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { allProvinces } from '@/lib/data';
import WeatherWidget from './WeatherWidget';

export default function Sidebar({ isOpen, onClose, onNavigate, favorites, onToggleFavorite }) {
  const { t } = useLang();

  const navItems = [
    { label: t.nav.explore, icon: Compass, page: 'home' },
    { label: t.nav.guides, icon: BookOpen, page: 'guides' },
    { label: t.nav.terms, icon: Info, page: 'terms' }
  ];

  const socialIcons = [Facebook, Instagram, Youtube];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 z-[70] h-full w-[85vw] max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <button onClick={() => { onNavigate('home'); onClose(); }} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center">
              <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
              Cottage<span className="text-[#0f51ec]">x</span>
            </span>
          </button>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center min-h-[44px] min-w-[44px]">
            <X className="w-5 h-5 text-[#191e3b]" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Nav */}
          <nav className="space-y-1 mb-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => { onNavigate(item.page); onClose(); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[#191e3b] font-medium hover:bg-slate-50 transition-colors text-left min-h-[48px]"
              >
                <item.icon className="w-5 h-5 text-[#0f51ec]" />
                {item.label}
              </button>
            ))}
            {/* Destinations */}
            <div className="pt-2">
              <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">{t.nav.destinations}</p>
              {allProvinces.map((prov) => (
                <button
                  key={prov}
                  onClick={() => { onNavigate('destination', prov); onClose(); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 rounded-2xl text-[#191e3b] font-medium hover:bg-slate-50 transition-colors text-left min-h-[44px]"
                >
                  <MapPin className="w-4 h-4 text-[#77e1fb]" />
                  {t.provinces[prov]}
                </button>
              ))}
            </div>
          </nav>

          {/* Favorites */}
          <div className="mb-6 p-4 rounded-3xl bg-slate-50">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-[#0f51ec] fill-[#0f51ec]" />
              <h3 className="text-sm font-bold text-[#191e3b]">{t.sidebar.favorites}</h3>
            </div>
            {favorites.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed">{t.sidebar.noFavorites}</p>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {favorites.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => { onNavigate('home'); onClose(); }}
                    className="flex-shrink-0 group"
                  >
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#77e1fb] group-hover:border-[#0f51ec] transition-colors">
                      <img src={ch.image} alt={ch.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-center mt-1 text-[#191e3b] font-medium max-w-[60px] truncate">{ch.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weather */}
          <WeatherWidget />
        </div>

        {/* Footer: contact + social */}
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{t.sidebar.follow}</p>
          <div className="flex gap-3">
            {socialIcons.map((Icon, i) => (
              <button key={i} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-[#0f51ec] hover:text-white text-[#191e3b] flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <div className="flex gap-4 mt-3">
            <a href="mailto:hello@cottagex.ca" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0f51ec] transition-colors">
              <Mail className="w-3.5 h-3.5" /> hello@cottagex.ca
            </a>
            <a href="tel:+18005550100" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#0f51ec] transition-colors">
              <Phone className="w-3.5 h-3.5" /> 1-800-555-0100
            </a>
          </div>
        </div>
      </div>
    </>
  );
}