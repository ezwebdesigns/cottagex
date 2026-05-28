'use client';

import { useEffect, useId } from 'react';
import { Sparkles } from 'lucide-react';

const WIDGET_HTML = `<div class="eg-widget" data-widget="search" data-program="ca-vrbo" data-lobs="stays" data-network="pz" data-camref="1100lpG3d" data-pubref="chaletxhomepage"></div>`;

export default function HeroSection() {
  const id = useId();
  const containerId = `eg-widget-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = WIDGET_HTML;

    const script = document.createElement('script');
    script.className = 'eg-widgets-script';
    script.src = 'https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js';
    script.async = true;
    container.appendChild(script);

    return () => {
      container.innerHTML = '';
      const existing = document.querySelector('script.eg-widgets-script[src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"]');
      if (existing) existing.remove();
    };
  }, [containerId]);

  return (
    <div className="px-4 md:px-8 py-6">
      <div
        className="relative min-h-[500px] md:min-h-[580px] rounded-[2rem] overflow-hidden flex flex-col md:flex-row items-center justify-center text-center md:text-left px-4 md:px-12 py-12 gap-8 md:gap-12"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(11, 27, 64, 0.45), rgba(11, 27, 64, 0.85)), url('https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&q=80&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <div id={containerId} className="w-full max-w-[575px]" />
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center md:items-start">
          <div className="mb-4 inline-flex items-center justify-center bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
            <Sparkles className="text-[#93B4FF] mr-2" size={16} />
            <span className="text-white text-xs font-bold tracking-wider uppercase">Official VRBO Affiliate Search</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white max-w-4xl leading-tight mb-4 tracking-tight">
            Find Your Perfect Canadian Escape
          </h1>
          <p className="text-blue-100/90 text-base md:text-lg mb-8 max-w-2xl font-light">
            Instantly query and secure verified premium lake houses and mountain lodges.
          </p>
        </div>
      </div>
    </div>
  );
}
