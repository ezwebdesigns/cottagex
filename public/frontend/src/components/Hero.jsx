// Hero - paste from Base44
// Paste your Base44 code here.
import React, { useState, useEffect } from 'react';
import { Shield, Map, Heart, Trees } from 'lucide-react';
import { useLang } from '@/lib/LanguageContext';

const iconMap = { shield: Shield, map: Map, heart: Heart, trees: Trees };

export default function Hero() {
  const { t } = useLang();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load VRBO / Expedia Group affiliate widget script
  useEffect(() => {
    const existingScript = document.querySelector('.eg-widgets-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.className = 'eg-widgets-script';
      script.src = 'https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js';
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Re-trigger widget initialization if script already loaded
      setTimeout(() => {
        if (window.EGWidgets && typeof window.EGWidgets.parse === 'function') {
          window.EGWidgets.parse();
        }
      }, 200);
    }
  }, []);

  return (
    <section className="relative min-h-[600px] lg:min-h-[640px] overflow-hidden">
      {/* Background with parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${scrollY * 0.4}px) scale(1.1)` }}
      >
        <img
          src="https://images.unsplash.com/photo-1469768411273-917c5c855b87?auto=format&fit=crop&w=1920&q=80"
          alt="Misty Canadian lake at dusk"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#191e3b]/80 via-[#191e3b]/50 to-[#191e3b]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] max-w-[1600px] mx-auto">
          {/* Left: VRBO Widget */}
          <div className="order-2 lg:order-1">
            <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/20 p-5 sm:p-7 border border-white/40 overflow-hidden">
              <h2 className="text-lg font-bold text-[#191e3b] mb-1" style={{ fontFamily: 'Radio Canada, sans-serif' }}>
                {t.hero.search.title}
              </h2>
              <p className="text-xs text-slate-500 mb-4">VRBO · Expedia Group</p>
              <div className="eg-widget" data-widget="search" data-program="ca-vrbo" data-lobs="stays" data-network="pz" data-camref="1100lpG3d" data-pubref=""></div>
            </div>
          </div>

          {/* Right: Poetry */}
          <div className="order-1 lg:order-2 text-white">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-4"
              style={{ fontFamily: 'Radio Canada, sans-serif', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
            >
              {t.hero.title}
            </h1>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6 max-w-md">
              {t.hero.subtitle}
            </p>
            <div className="space-y-2.5">
              {t.hero.args.map((arg, i) => {
                const Icon = iconMap[arg.icon] || Shield;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#77e1fb]/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-[#77e1fb]" />
                    </div>
                    <span className="text-sm font-medium text-white/90">{arg.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}