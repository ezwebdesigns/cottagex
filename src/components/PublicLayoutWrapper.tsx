'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/cottagex/AppSidebar';
import Header from '@/components/cottagex/Header';
import Footer from '@/components/cottagex/Footer';
import MaintenancePage from '@/components/cottagex/MaintenancePage';

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [maintenance, setMaintenance] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings?section=maintenance')
      .then(r => r.json())
      .then(d => { setMaintenance(d.data?.enabled === true); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const isAdmin = pathname.includes('/admin/');
  const isAuth = pathname.includes('/login') || pathname.includes('/register');

  if (loaded && maintenance && !isAdmin && !isAuth) {
    return <MaintenancePage />;
  }

  if (isAdmin || isAuth) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
}