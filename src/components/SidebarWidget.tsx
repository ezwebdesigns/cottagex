'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const WIDGET_HTML = `<div class="eg-widget" data-widget="search" data-program="ca-vrbo" data-lobs="stays" data-network="pz" data-camref="1100lpG3d" data-pubref="cottagexsidebar"></div><script class="eg-widgets-script" src="https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js"></script>`;

/**
 * SidebarWidget — the same Expedia/VRBO search widget as the homepage
 * hero, sized for the 260px article sidebar. `pubref="cottagexsidebar"`
 * keeps attribution separate from the hero. If the third-party script is
 * blocked (adblocker) or fails, a compact on-brand fallback card links
 * to internal search instead of leaving an empty box.
 */
export default function SidebarWidget({ locale }: { locale: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = ref.current;
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

    // Adblock / failure fallback: if the widget never initializes, show
    // the fallback card instead of an empty box.
    const timer = window.setTimeout(() => {
      if (!el.querySelector('iframe')) setFailed(true);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
      el.innerHTML = '';
    };
  }, []);

  if (failed) {
    return (
      <div className="rounded-2xl bg-[#191e3b] p-5 text-white">
        <p className="font-bold text-sm mb-1">
          {locale === 'fr' ? 'Trouvez votre chalet' : 'Find your chalet'}
        </p>
        <p className="text-white/60 text-xs mb-4 leading-relaxed">
          {locale === 'fr'
            ? 'Comparez les locations vérifiées et réservez en sécurité.'
            : 'Compare verified rentals and book securely.'}
        </p>
        <Link
          href={`/${locale}/search`}
          className="inline-flex items-center justify-center w-full bg-[#0f51ec] hover:bg-[#0d44c9] text-white px-4 py-2.5 rounded-full font-semibold text-sm transition-colors"
        >
          {locale === 'fr' ? 'Rechercher' : 'Search'}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        {locale === 'fr' ? 'Réserver' : 'Book now'}
      </p>
      {/* min-height placeholder: avoids layout shift while the third-party widget loads. */}
      <div ref={ref} className="min-h-[320px]" />
    </div>
  );
}
