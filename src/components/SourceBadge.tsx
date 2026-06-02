'use client';

import { useState, useEffect } from 'react';

type Props = { source: string | null | undefined };

const FALLBACK_SVGS: Record<string, string> = {
  vrbo: `<svg viewBox="0 0 50 18" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="14" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="16" letter-spacing="1.5" fill="white">vrbo</text></svg>`,
  expedia: `<svg viewBox="0 0 75 18" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="14" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="15" letter-spacing="-0.3" fill="white">Expedia</text></svg>`,
};

const BRAND_BG: Record<string, string> = {
  vrbo: '#003D29',
  expedia: '#00387E',
};

export default function SourceBadge({ source }: Props) {
  const [logoUrls, setLogoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/admin/library')
      .then(r => r.json())
      .then((data: any[]) => {
        const urls: Record<string, string> = {};
        for (const img of data) {
          const name = (img.name || '').toLowerCase();
          if (name.includes('vrb')) urls.vrbo = img.url;
          if (name.includes('exp')) urls.expedia = img.url;
        }
        setLogoUrls(urls);
      })
      .catch(() => {});
  }, []);

  const s = (source || '').toLowerCase();
  const brandKey = Object.keys(FALLBACK_SVGS).find(k => s.includes(k));
  const bgColor = brandKey ? BRAND_BG[brandKey] : '#1F51C6';

  if (!brandKey) {
    return (
      <span className="bg-[#1F51C6] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
        {source || 'Featured'}
      </span>
    );
  }

  const imageUrl = logoUrls[brandKey];

  return (
    <span
      className="inline-flex items-center justify-center px-2 md:px-3 py-0.5 md:py-1 rounded-full"
      style={{ backgroundColor: bgColor }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={brandKey} className="h-3.5 md:h-4 w-auto" />
      ) : (
        <span className="block" style={{ width: 'auto', height: '14px', display: 'flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: FALLBACK_SVGS[brandKey] }} />
      )}
    </span>
  );
}
