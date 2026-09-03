'use client';

import { useState, useEffect } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { SessionProvider, signOut } from 'next-auth/react';
import AuthGuard from '@/components/cottagex/AuthGuard';
import {
  LayoutDashboard, FileText, BookOpen, Image as ImageIcon, Mail,
  Settings as SettingsIcon, Building2, MapPin, User, ExternalLink,
  ChevronLeft, ChevronRight, Menu, LogOut, Mountain, Search,
  RefreshCw
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

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

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
            onClick={async () => {
              try {
                const res = await fetch(`/api/admin/cache/clear`, { method: 'POST' });
                if (res.ok) {
                  console.log('Cache cleared');
                }
              } catch (e) {
                console.error('Failed to clear cache:', e);
              }
            }}
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
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
