'use client';

import { useState, useEffect, useRef } from 'react';
import { Sailboat, Bath, Users, Gem, Dog, Mountain, Heart, Home, Trees, TreePine, Umbrella, Building2, MountainSnow, Waves, Footprints } from 'lucide-react';
import { useTranslations } from '@/lib/useTranslations';

const WIDGET_HTML = `<div class="eg-widget" data-widget="search" data-program="ca-vrbo" data-lobs="stays" data-network="pz" data-camref="1100lpG3d" data-pubref=""></div><script class="eg-widgets-script" src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"></script>`;

const iconMap: Record<string, React.ElementType> = {
  lakefront: Sailboat, 'hot-tub': Bath, family: Users, luxury: Gem,
  'pet-friendly': Dog, mountain: Mountain, romantic: Heart, 'log-cabin': Home,
  countryside: Trees, secluded: TreePine, beach: Umbrella, resort: Building2,
  skiing: MountainSnow, pools: Waves, hiking: Footprints,
};

type CatItem = { id: string; label: string; link?: string };

type HeroProps = {
  tag?: string;
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  catItems?: CatItem[];
};

export default function Hero({ tag, title, description, image, imageAlt, catItems }: HeroProps) {
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
      {image && (
        <div
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.4}px) scale(1.1)` }}
        >
          <img
            src={image}
            alt={imageAlt || ''}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#191e3b]/80 via-[#191e3b]/50 to-[#191e3b]/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#191e3b]/60 to-transparent" />
        </div>
      )}

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] max-w-[1600px] mx-auto">
          <div className="order-2 lg:order-1 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-[575px] rounded-[2rem] overflow-hidden bg-white">
              <div ref={containerRef} />
            </div>
          </div>

          <div className="order-1 lg:order-2 flex flex-col items-center lg:items-start">
            {tag && (
              <div className="mb-4 inline-flex items-center justify-center bg-[#0f51ec] px-4 py-1.5 rounded-full">
                <span className="text-white text-xs font-bold tracking-wider uppercase">{tag}</span>
              </div>
            )}
            {title && (
              <h1
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-4 tracking-tight"
                style={{ fontFamily: 'Radio Canada, sans-serif', textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
              >
                {title}
              </h1>
            )}
            {description && (
              <p className="text-blue-100/90 text-base md:text-lg mb-8 max-w-2xl font-light">
                {description}
              </p>
            )}
          </div>
        </div>

        {catItems && catItems.length > 0 && (
          <div className="flex gap-4 sm:gap-5 lg:gap-7 justify-center mt-8 lg:mt-12 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-2" style={{ scrollbarWidth: 'none' }}>
            {catItems.map((cat) => {
              const Icon = iconMap[cat.id] || Mountain;
              const Wrapper = cat.link ? 'a' : 'div';
              return (
                <Wrapper key={cat.id} href={cat.link} className="flex flex-col items-center gap-1.5 flex-shrink-0 group min-w-[56px] sm:min-w-[64px]">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border border-white/20 bg-transparent group-hover:bg-[#0f51ec] flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-white transition-colors" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-white/80 group-hover:text-white transition-colors text-center">
                    {cat.label}
                  </span>
                </Wrapper>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
