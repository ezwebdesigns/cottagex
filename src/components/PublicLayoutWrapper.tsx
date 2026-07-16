'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/cottagex/AppSidebar';
import Header from '@/components/cottagex/Header';
import Footer from '@/components/cottagex/Footer';

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdmin = pathname.includes('/admin/');
  const isAuth = pathname.includes('/login') || pathname.includes('/register');

  if (isAdmin || isAuth) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden md:block">
        <AppSidebar mobileOpen={false} onMobileClose={() => {}} />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {mobileMenuOpen && (
        <AppSidebar mobileOpen={true} onMobileClose={() => setMobileMenuOpen(false)} />
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuToggle={() => setMobileMenuOpen((v) => !v)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
