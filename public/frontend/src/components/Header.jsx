// Header - paste from Base44
// Paste your Base44 code here.
import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Mountain } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

export default function Header({ onNavigate }) {
  const { t, toggleLang } = useLang();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-slate-200/60">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#0f51ec] flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
              <Mountain className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#191e3b]" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
              Cottage<span className="text-[#0f51ec]">x</span>
            </span>
          </button>

          {/* Right: lang toggle + profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors min-h-[44px]"
            >
              <Globe className="w-4 h-4 text-[#191e3b]" />
              <span className="text-sm font-semibold text-[#191e3b]">{t.langLabel}</span>
            </button>

            <div ref={profileRef} className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors min-h-[44px]"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0f51ec] to-[#77e1fb]" />
                <ChevronDown className={`w-3.5 h-3.5 text-[#191e3b] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs text-slate-500">{t.profile.title}</p>
                  </div>
                  {[t.profile.signIn, t.profile.trips, t.profile.favorites, t.profile.help].map((item) => (
                    <button key={item} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-[#191e3b] hover:bg-slate-50 transition-colors">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}