'use client';

import { useState, useEffect } from 'react';
import { BrandFavicon } from '@/components/branding/Logo';
import Link from 'next/link';

type FooterProps = {
  locale: string;
  footerData?: {
    description: string;
    discover: { label: string; href: string }[];
    quickLinks: { label: string; href: string }[];
    about: { label: string; href: string }[];
  };
};

export default function Footer({ locale, footerData }: FooterProps) {
  const [data, setData] = useState(footerData);

  useEffect(() => {
    if (footerData) return;
    fetch(`/api/admin/settings?section=footer`)
      .then(r => r.json())
      .then(j => { if (j.data) setData(j.data); })
      .catch(() => {});
  }, [footerData]);

  const f = data || footerData || { description: '', discover: [], quickLinks: [], about: [] };
  const interpolate = (text: string) => text?.replace(/\{locale\}/g, locale);

  return (
    <footer className="bg-[#0B1B40] text-white pt-16 pb-8 px-4 md:px-8 mt-16 border-t border-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-xl mb-6">
              <BrandFavicon className="w-8 h-8" />
              <span>Cottage<span className="text-[#1F51C6]">Escape</span></span>
            </Link>
            <p className="text-blue-100/70 text-sm mb-6 max-w-xs leading-relaxed">
              {f.description || 'Your premier directory for comparing beautiful wilderness retreats in Canada.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-300">Discover</h4>
            <ul className="flex flex-col gap-3 text-blue-100/80 text-sm">
              {(f.discover || []).map((item, i) => (
                <li key={i}>
                  <Link href={interpolate(item.href)} className="hover:text-white transition-colors font-semibold">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-300">Quick Links</h4>
            <ul className="flex flex-col gap-3 text-blue-100/80 text-sm">
              {(f.quickLinks || []).map((item, i) => (
                <li key={i}>
                  <Link href={interpolate(item.href)} className="hover:text-white transition-colors font-medium">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-xs uppercase tracking-widest text-blue-300">About</h4>
            <ul className="flex flex-col gap-3 text-blue-100/80 text-sm">
              {(f.about || []).map((item, i) => (
                <li key={i}>
                  <Link href={interpolate(item.href)} className="hover:text-white transition-colors font-medium">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-blue-100/60">
          <p>© {new Date().getFullYear()} Cottage Escape. All rights reserved. Cottage Escape is an independent travel affiliate partner.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors font-medium">Privacy</Link>
            <Link href={`/${locale}/p/terms`} className="hover:text-white transition-colors font-medium">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
