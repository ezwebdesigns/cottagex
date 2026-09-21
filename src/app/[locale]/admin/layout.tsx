'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { SessionProvider, signOut } from 'next-auth/react';
import AuthGuard from '@/components/cottagex/AuthGuard';
import {
  LayoutDashboard, FileText, BookOpen, Image as ImageIcon, Mail,
  Settings as SettingsIcon, Building2, MapPin, User, ExternalLink,
  ChevronLeft, ChevronRight, Menu, LogOut, Mountain, Search,
  RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [favicon, setFavicon] = useState<string | null>(undefined!);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string || 'en';

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
  }, []);

  return (
    <SessionProvider>
      <AuthGuard>
        <AdminShell collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} pathname={pathname} locale={locale} favicon={favicon} loading={loading}>
          {children}
        </AdminShell>
      </AuthGuard>
    </SessionProvider>
  );
}

function AdminShell({
  children, collapsed, setCollapsed, mobileOpen, setMobileOpen, pathname, locale, favicon, loading,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  pathname: string;
  locale: string;
  favicon: string | null;
  loading: boolean;
}) {
  const menuItems = [
    { label: 'Dashboard', href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
    { label: 'Pages', href: `/${locale}/admin/pages`, icon: FileText },
    { label: 'Articles', href: `/${locale}/admin/articles`, icon: BookOpen },
    { label: 'Library', href: `/${locale}/admin/library`, icon: ImageIcon },
    { label: 'Messages', href: `/${locale}/admin/messages`, icon: Mail },
    { label: 'Search', href: `/${locale}/admin/search`, icon: Search },
    { label: 'Cottages', href: `/${locale}/admin/cottages`, icon: Building2 },
    { label: 'Destinations', href: `/${locale}/admin/destinations`, icon: MapPin },
    { label: 'Settings', href: `/${locale}/admin/settings`, icon: SettingsIcon },
  ];

  if (pathname.endsWith('/admin/login')) return <>{children}</>;

  // Clear-cache toast: visible confirmation (auto-dismiss), error state on failure.
  const [cacheToast, setCacheToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const toastTimer = useRef<number | null>(null);
  async function handleClearCache() {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    try {
      const res = await fetch('/api/admin/cache/clear', { method: 'POST' });
      setCacheToast(res.ok ? { ok: true, msg: 'Cache cleared' } : { ok: false, msg: 'Failed to clear cache' });
    } catch {
      setCacheToast({ ok: false, msg: 'Failed to clear cache' });
    }
    toastTimer.current = window.setTimeout(() => setCacheToast(null), 3500);
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const switchHref = pathname.replace(/^\/(en|fr)/, `/${otherLocale}`);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed md:static z-30 h-screen bg-white border-r border-slate-100 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="border-b border-slate-100 flex items-center h-16 px-4 flex-shrink-0 gap-2.5">
          {loading ? <div className="w-9 h-9" /> : favicon ? (
            <img src={favicon} alt="" className="w-9 h-9 rounded-2xl flex-shrink-0 object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center flex-shrink-0">
              <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
          )}
          <span className={`text-xl font-bold text-[#191e3b] whitespace-nowrap transition-opacity duration-200 ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}>
            Chalet<span className="text-[#0f51ec]">x</span>
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden md:block text-slate-400 hover:text-slate-600"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          <p className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1 ${
            collapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
          }`}>Admin</p>
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-[44px] ${
                isActive(item.href) ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'text-[#191e3b] hover:bg-slate-50'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`whitespace-nowrap transition-opacity duration-200 ${
                collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-slate-100 px-2 py-3 space-y-0.5 flex-shrink-0">
          <a
            href={`/${locale}/admin/profile`}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-colors min-h-[44px] ${
              isActive(`/${locale}/admin/profile`) ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'text-[#191e3b] hover:bg-slate-50'
            }`}
            title="Profile"
          >
            <User className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>Profile</span>
          </a>
          <a
            href={`/${locale}`}
            target="_blank"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#191e3b] hover:bg-slate-50 transition-colors min-h-[44px]"
            title="Visit Website"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>Visit Website</span>
          </a>
          <button
            onClick={handleClearCache}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#191e3b] hover:bg-orange-50 hover:text-orange-600 transition-colors min-h-[44px]"
            title="Clear Cache"
          >
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>Clear Cache</span>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[#191e3b] hover:bg-red-50 hover:text-red-600 transition-colors min-h-[44px]"
            title="Logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-200 ${
              collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center px-4 md:px-6 gap-3 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-slate-500 hover:text-slate-700">
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-2xl bg-[#0f51ec] flex items-center justify-center md:hidden">
            <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Admin</h2>
          {/* Editing-locale badge + switcher: /en/admin edits EN rows (visible
              on /en/…), /fr/admin edits FR rows (visible on /fr/…). The two
              languages never sync automatically. */}
          <div className="ml-auto flex items-center gap-2">
            <span
              title={
                locale === 'fr'
                  ? 'Vous éditez la version FR — visible sur /fr/… Pensez à reporter sur EN si besoin (pas de synchro auto).'
                  : 'You are editing the EN version — visible on /en/… Remember to mirror on FR if needed (no auto-sync).'
              }
              className={`text-xs font-bold px-2.5 py-1 rounded-full cursor-help ${
                locale === 'fr' ? 'bg-[#0f51ec]/10 text-[#0f51ec]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {locale.toUpperCase()}
            </span>
            <div className="flex rounded-full border border-slate-200 overflow-hidden text-xs font-semibold">
              {(['en', 'fr'] as const).map((l) => (
                <a
                  key={l}
                  href={l === locale ? pathname : switchHref}
                  aria-current={l === locale ? 'page' : undefined}
                  className={`px-2.5 py-1 transition-colors ${
                    l === locale ? 'bg-[#191e3b] text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {l.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
      {cacheToast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-3 pr-4 py-3 rounded-2xl shadow-lg border text-sm font-medium ${
          cacheToast.ok ? 'bg-white border-green-200 text-green-800' : 'bg-white border-red-200 text-red-800'
        }`}>
          {cacheToast.ok
            ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
          {cacheToast.msg}
        </div>
      )}
    </div>
  );
}
