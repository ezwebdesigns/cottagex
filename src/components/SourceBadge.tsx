'use client';

type Props = { source: string | null | undefined };

const BRAND_LOGOS: Record<string, { svg: string; bg: string }> = {
  vrbo: {
    bg: '#003D29',
    svg: `<svg viewBox="0 0 50 18" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="14" font-family="Arial,Helvetica,sans-serif" font-weight="900" font-size="16" letter-spacing="1.5" fill="white">vrbo</text></svg>`,
  },
  expedia: {
    bg: '#00387E',
    svg: `<svg viewBox="0 0 75 18" fill="none" xmlns="http://www.w3.org/2000/svg"><text x="0" y="14" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="15" letter-spacing="-0.3" fill="white">Expedia</text></svg>`,
  },
};

const BRAND_DEFAULTS: Record<string, string> = {
  vrbo: 'vrbo',
  expedia: 'expedia',
};

export default function SourceBadge({ source }: Props) {
  const s = (source || '').toLowerCase();
  const brand = Object.keys(BRAND_LOGOS).find(k => s.includes(k));
  const logo = brand ? BRAND_LOGOS[brand] : null;

  if (!logo) {
    return (
      <span className="bg-[#1F51C6] text-white px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold">
        {source || 'Featured'}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center px-2 md:px-3 py-0.5 md:py-1 rounded-full"
      style={{ backgroundColor: logo.bg }}
    >
      <span
        className="block"
        style={{ width: 'auto', height: '14px', display: 'flex', alignItems: 'center' }}
        dangerouslySetInnerHTML={{ __html: logo.svg }}
      />
    </span>
  );
}
