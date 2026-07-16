'use client';

import { useState, useEffect } from 'react';
import { Compass, BookOpen, MapPin, Info, Mountain, Home, TreePine, Sailboat, Sunrise, Globe, Heart, Star, Search, Image, Settings as SettingsIcon, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const iconMap: Record<string, any> = {
  Compass, BookOpen, MapPin, Info, Mountain, Home, TreePine, Sailboat, Sunrise, Globe, Heart, Star, Search, Image, Settings: SettingsIcon, User,
};

export default function AppSidebar() {
  const pathname = usePathname();
  const lang = pathname.startsWith('/fr') ? 'fr' : 'en';
  const [expanded, setExpanded] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(undefined!);
  const [loading, setLoading] = useState(true);
  const [menuSections, setMenuSections] = useState<{ title: string; items: { label: string; icon: string; href: string }[] }[]>([]);

  useEffect(() => {
    fetch('/api/admin/settings?section=general').then(r => r.json()).then(d => {
      const raw = d.data?.favicon ?? null;
      if (raw && raw.startsWith('lib:')) {
        fetch(`/api/library/${raw.slice(4)}`).then(r => r.ok && r.json()).then(d => { setFavicon(d?.url || ''); setLoading(false); }).catch(() => { setFavicon(''); setLoading(false); });
      } else {
        setFavicon(raw);
        setLoading(false);
      }
    }).catch(() => setLoading(false));
    fetch('/api/admin/settings?section=side_menu').then(r => r.json()).then(d => { if (d.data?.sections) setMenuSections(d.data.sections); }).catch(() => {});
  }, []);

  const interpolate = (text: string) => text?.replace(/\{locale\}/g, lang);

  const isActive = (href: string) => {
    const resolved = interpolate(href);
    if (resolved === `/${lang}`) return pathname.replace(/^\/(en|fr)\/?/, '') === 'home';
    return pathname.startsWith(resolved);
  };

  return (
    <aside
      className="flex flex-col sticky top-0 h-screen bg-white border-r border-slate-100 flex-shrink-0 transition-all duration-300 overflow-hidden z-40"
      style={{ width: expanded ? '240px' : '68px' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="border-b border-slate-100 flex items-center h-16 sm:h-20 px-4 flex-shrink-0">
        <Link href={`/${lang}`} className="flex items-center">
          {loading ? <div className="w-9 h-9" /> : favicon ? (
            <img src={favicon} alt="" className="w-9 h-9 rounded-2xl flex-shrink-0 object-cover" />
          ) : null}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {menuSections.map((section, si) => (
          <div key={si} className="space-y-0.5 mb-3">
            {section.title && (
              <p className={`px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{section.title}</p>
            )}
            {section.items.map((item, ii) => {
              const href = interpolate(item.href);
              const Icon = iconMap[item.icon] || Compass;
              const active = isActive(item.href);
              return (
                <Link
                  key={`${si}-${ii}`}
                  href={href}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-[44px] ${
                    active ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'text-[#191e3b] hover:bg-slate-50'
                  }`}
                  title={item.label}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* language switcher hidden for now */}
    </aside>
  );
}
