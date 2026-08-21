'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import SocialIcon from '@/components/cottagex/SocialIcon';

type FooterLink = { label: string; href: string };
type FooterSocial = { platform: string; url: string };
type FooterSettings = {
  description?: string;
  logo?: string;
  discoverTitle?: string;
  quickLinksTitle?: string;
  aboutTitle?: string;
  topDestinationsTitle?: string;
  discover?: FooterLink[];
  quickLinks?: FooterLink[];
  about?: FooterLink[];
  topDestinations?: FooterLink[];
  socials?: FooterSocial[];
};

export default function Footer() {
  const t = useTranslations();
  const lang = useLocale();
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);

  useEffect(() => {
    fetch('/api/admin/settings?section=footer').then(r => r.json()).then(d => {
      const raw = d.data ?? null;
      if (raw?.logo?.startsWith('lib:')) {
        fetch(`/api/library/${raw.logo.slice(4)}`).then(r => r.ok && r.json()).then(d => setFooterSettings({ ...raw, logo: d?.url || '' })).catch(() => setFooterSettings(raw));
      } else {
        setFooterSettings(raw);
      }
    }).catch(() => {});
  }, []);

  const interpolate = (href: string) => href?.replace(/\{locale\}/g, lang) ?? '#';

  const discover = footerSettings?.discover ?? [];
  const quickLinks = footerSettings?.quickLinks ?? [];
  const about = footerSettings?.about ?? [];
  const topDestinations = footerSettings?.topDestinations ?? [];
  const socials = (footerSettings?.socials ?? []).filter(s => s.url);
  const hasAnyLinks = discover.length > 0 || quickLinks.length > 0 || about.length > 0 || topDestinations.length > 0;

  if (!footerSettings) return null;

  return (
    <footer className="bg-[#0f51ec] text-white">
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {hasAnyLinks && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1">
              {footerSettings.logo ? (
                <div className="flex items-center gap-2 mb-3">
                  <img src={footerSettings.logo} alt="Logo" className="h-8 w-auto" />
                </div>
              ) : null}
              {footerSettings.description && (
                <p className="text-sm text-white/60 leading-relaxed mb-4">{footerSettings.description}</p>
              )}
              {socials.length > 0 && (
                <div className="flex gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.platform}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                      <SocialIcon platform={s.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {discover.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-3">{footerSettings.discoverTitle || t('footer.discover')}</h4>
                <ul className="space-y-2">
                  {discover.map((item, i) => (
                    <li key={i}>
                      <Link
                        href={interpolate(item.href)}
                        className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {quickLinks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-3">{footerSettings.quickLinksTitle || t('footer.support')}</h4>
                <ul className="space-y-2">
                  {quickLinks.map((item, i) => (
                    <li key={i}>
                      <Link
                        href={interpolate(item.href)}
                        className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {about.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-3">{footerSettings.aboutTitle || t('footer.company')}</h4>
                <ul className="space-y-2">
                  {about.map((item, i) => (
                    <li key={i}>
                      <Link
                        href={interpolate(item.href)}
                        className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {topDestinations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white/90 mb-3">{footerSettings.topDestinationsTitle || t('footer.topDestinations')}</h4>
                <ul className="space-y-2">
                  {topDestinations.map((item, i) => (
                    <li key={i}>
                      <Link
                        href={interpolate(item.href)}
                        className="text-sm text-white/60 hover:text-[#77e1fb] transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/50 flex-shrink-0">
              © {new Date().getFullYear()} Chalet Express. {t('footer.rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
