'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

const WIDGET_HTML = `<div class="eg-widget" data-widget="search" data-program="ca-vrbo" data-lobs="stays" data-network="pz" data-camref="1100lpG3d" data-pubref=""></div><script class="eg-widgets-script" src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"></script>`;

export default function Hero() {
  const { t } = useTranslations();
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = WIDGET_HTML;

    el.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    const checkInit = setInterval(() => {
      if ((window as any).eg?.widgets?.loaded) {
        clearInterval(checkInit);
      } else if (document.readyState !== 'loading') {
        window.dispatchEvent(new Event('DOMContentLoaded'));
      }
    }, 300);

    return () => {
      clearInterval(checkInit);
      el.innerHTML = '';
    };
  }, []);

  return (
    <section className="relative min-h-[600px] lg:min-h-[640px] overflow-hidden">
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

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] max-w-[1600px] mx-auto">
          <div className="order-2 lg:order-1 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[575px] rounded-[2rem] overflow-hidden bg-white">
              <div ref={containerRef} />
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start">
            <div className="mb-4 inline-flex items-center justify-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <Sparkles className="text-[#93B4FF] mr-2" size={16} />
              <span className="text-white text-xs font-bold tracking-wider uppercase">{t.hero.search.title || 'Official VRBO Affiliate Search'}</span>
            </div>
            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-4 tracking-tight"
              style={{ fontFamily: 'Radio Canada, sans-serif', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
            >
              {t.hero.title}
            </h1>
            <p className="text-blue-100/90 text-base md:text-lg mb-8 max-w-2xl font-light">
              {t.hero.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
