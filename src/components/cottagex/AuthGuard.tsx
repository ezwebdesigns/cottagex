'use client';

import { useSession } from 'next-auth/react';
import { usePathname, useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  if (pathname.endsWith('/admin/login')) return <>{children}</>;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/${locale}/admin/login`);
    }
  }, [status, locale, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0f51ec] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
