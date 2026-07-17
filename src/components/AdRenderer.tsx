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
  }, [html]);

  if (!html) return null;

  return <div ref={ref} className="mt-6" />;
}
