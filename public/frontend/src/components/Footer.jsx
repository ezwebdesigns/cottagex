// Footer - paste from Base44
// Paste your Base44 code here.
import React from 'react';
import { Mountain, Facebook, Instagram, Youtube } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';
import { allProvinces } from '@/lib/data';

export default function Footer({ onNavigate }) {
  const { t } = useLang();
  const socialIcons = [Facebook, Instagram, Youtube];

  return (
    <footer className="bg-[#191e3b] text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                Cottage<span className="text-[#77e1fb]">x</span>
              </span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-4">{t.footer.tagline}</p>
            <div className="flex gap-3">
              {socialIcons.map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#0f51ec] flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-3">{t.footer.explore}</h4>
            <ul className="space-y-2">
              {allProvinces.map((prov) => (
                <li key={prov}>
                  <button
                    onClick={() => onNavigate('destination', prov)}
                    className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors"
                  >
                    {t.provinces[prov]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-3">{t.footer.company}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('guides')} className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors">{t.nav.guides}</button></li>
              <li><button onClick={() => onNavigate('home')} className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors">{t.nav.about}</button></li>
              <li><a href="mailto:hello@cottagex.ca" className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors">{t.nav.contact}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-white/90 mb-3">{t.footer.legal}</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate('terms')} className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors">{t.nav.terms}</button></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors">Privacy</a></li>
              <li><a href="#" className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        {/* Affiliate disclosure */}
        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50 text-center sm:text-left max-w-2xl">
              {t.footer.affiliateNote}
            </p>
            <p className="text-xs text-white/50 flex-shrink-0">
              © 2026 Cottagex. {t.footer.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}