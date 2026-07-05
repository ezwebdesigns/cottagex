'use client';

import { usePathname } from 'next/navigation';
import AppSidebar from '@/components/cottagex/AppSidebar';
import Header from '@/components/cottagex/Header';
import Footer from '@/components/cottagex/Footer';

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin/');
  const isAuth = pathname.includes('/login') || pathname.includes('/register');

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
