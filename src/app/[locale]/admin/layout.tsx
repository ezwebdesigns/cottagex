'use client';

import { useState } from 'react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { LayoutDashboard, FileText, BookOpen, Image as ImageIcon, Mail, Settings as SettingsIcon, ExternalLink, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const locale = params?.locale as string || 'en';

  return (
    <SessionProvider>
      <AdminShell collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} pathname={pathname} locale={locale}>
        {children}
      </AdminShell>
    </SessionProvider>
  );
}

function AdminShell({
  children,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
  pathname,
  locale,
}: {
  children: React.ReactNode;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
  pathname: string;
  locale: string;
}) {

  const menuItems = [
    { label: 'Dashboard', href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
    { label: 'Pages', href: `/${locale}/admin/pages`, icon: FileText },
    { label: 'Articles', href: `/${locale}/admin/articles`, icon: BookOpen },
    { label: 'Library', href: `/${locale}/admin/library`, icon: ImageIcon },
    { label: 'Messages', href: `/${locale}/admin/messages`, icon: Mail },
    { label: 'Settings', href: `/${locale}/admin/settings`, icon: SettingsIcon },
  ];

  if (pathname.endsWith('/admin/login')) return <>{children}</>;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`fixed md:static z-30 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center h-14 px-3 border-b border-gray-200">
          <span className="text-xs font-black text-[#1F51C6] tracking-widest uppercase overflow-hidden">CE</span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto hidden md:block text-gray-400 hover:text-gray-600"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-2 py-2.5 rounded-full transition-colors ${
                isActive(item.href) ? 'bg-[#1F51C6]/10 text-[#1F51C6]' : 'text-gray-600 hover:bg-gray-100'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className={`text-sm font-medium whitespace-nowrap transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
                {item.label}
              </span>
            </a>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-200 space-y-1">
          <a href={`/${locale}`} target="_blank" className="flex items-center gap-3 w-full px-2 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" title="Visit Website">
            <ExternalLink className="w-5 h-5 shrink-0" />
            <span className={`text-sm font-medium transition-opacity duration-300 ${collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>Visit Website</span>
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-3">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Admin</h2>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
