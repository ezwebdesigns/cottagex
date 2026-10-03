'use client';

import { useEffect, useRef } from 'react';

export default function AdRenderer({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!html || !ref.current) return;

    ref.current.innerHTML = '';

    const fragment = document.createRange().createContextualFragment(html);

    fragment.querySelectorAll('script').forEach((oldScript) => {
      const newScript = document.createElement('script');
      for (const attr of oldScript.attributes) {
        newScript.setAttribute(attr.name, attr.value);
      }
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });

    ref.current.appendChild(fragment);

    // Les scripts d'affiliation Expedia scannent la page à DOMContentLoaded.
    // Comme le HTML arrive ici après le chargement (fetch settings), on
    // re-déclenche l'init comme le Hero, sinon la bannière reste vide.
    const checkInit = setInterval(() => {
      const done =
        (window as any).eg?.widgets?.loaded ||
        ref.current?.querySelector('iframe');
      if (done) {
        clearInterval(checkInit);
      } else if (document.readyState !== 'loading') {
        window.dispatchEvent(new Event('DOMContentLoaded'));
      }
    }, 300);
    const stopAfter = window.setTimeout(() => clearInterval(checkInit), 10000);

    return () => {
      window.clearInterval(checkInit);
      window.clearTimeout(stopAfter);
    };
  }, [html]);

  if (!html) return null;

  return <div ref={ref} className="mt-6" />;
}
